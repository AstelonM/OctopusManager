package com.astelon.octopusmanager.managers;

import com.astelon.octopusmanager.configs.ServerConfig;
import com.astelon.octopusmanager.data.ServerInfo;
import com.astelon.octopusmanager.data.FileInfo;
import com.astelon.octopusmanager.exceptions.EmptyPathException;
import com.astelon.octopusmanager.exceptions.PathOutsideServerException;
import com.astelon.octopusmanager.exceptions.ServerNotFoundException;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
public class FileManager {

    private static final Logger logger = LoggerFactory.getLogger(FileManager.class);

    private final HashMap<String, List<Path>> directoryMap;

    public FileManager(ServerConfig serverConfig) {
        directoryMap = new HashMap<>();
        for (Map.Entry<String, ServerInfo> entry: serverConfig.getServers().entrySet()) {
            addServerDirectories(entry.getKey(), entry.getValue());
        }
    }

    public Path getWorkingDirectory(String directoryName) {
        Path path = parsePath(directoryName);
        if (!Files.isDirectory(path))
            throw new InvalidPathException(directoryName, "Not a directory.");
        if (Files.notExists(path))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return path;
    }

    public void addServerDirectories(String serverName, ServerInfo info) {
        List<String> directoryNames = info.getExtraDirectories();
        Path workingDirectory = getWorkingDirectory(info.getWorkingDirectory());
        if (directoryNames == null || directoryNames.isEmpty()) {
            directoryMap.put(serverName, List.of(workingDirectory));
            return;
        }
        List<Path> directories = new ArrayList<>(directoryNames.size() + 1);
        directories.add(workingDirectory);
        for (String directoryName: directoryNames) {
            Path path;
            try {
                path = parsePath(directoryName);
                if (!Files.isDirectory(path)) {
                    logger.warn("Directory path + " + directoryName + " of server " + serverName + " is not a directory.");
                    continue;
                }
                directories.add(path);
            } catch (Exception e) {
                logger.warn("Directory " + directoryName + " of server " + serverName + " is invalid");
            }
        }
        directoryMap.put(serverName, Collections.unmodifiableList(directories));
    }

    public void removeServerDirectories(String serverName) {
        directoryMap.remove(serverName);
    }

    public void updateServerDirectories(String serverName, ServerInfo info) {
        addServerDirectories(serverName, info);
    }

    @NotNull
    public List<FileInfo> getDirectories(String serverName) {
        List<Path> directories = getServerDirectories(serverName);
        return toFileInfoList(directories);
    }

    @NotNull
    public List<FileInfo> getFiles(String serverName, String pathText) {
        Path path = getActualPath(serverName, pathText).resultPath;
        try {
            List<Path> children = getChildren(path);
            return toFileInfoList(children);
        } catch (IOException e) {
            logger.error("Could not walk the children of " + path + ".");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read the files.", e);
        }
    }

    public Resource getFileContent(String serverName, String pathText) {
        Path path = getActualPath(serverName, pathText).resultPath;
        if (Files.notExists(path))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The file could not be found.");
        try {
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() && resource.isReadable())
                return resource;
        } catch (MalformedURLException e) {
            logger.error("Could not create file resource for file " + path + ".", e);
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read the file " + pathText + ".");
    }

    public Path createDirectory(String serverName, String pathText, String name) {
        CreatedPaths createdPaths = getActualPath(serverName, pathText);
        Path givenPath = createdPaths.givenPath;
        Path resultPath = createNewPath(createdPaths.resultPath, name);
        if (Files.exists(resultPath))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The directory already exists.");
        try {
            Files.createDirectory(resultPath);
            return givenPath;
        } catch (IOException e) {
            logger.error("Could not create directory " + resultPath + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create directory " + name + ".", e);
        }
    }

    public Path createFile(String serverName, String pathText, String name) {
        CreatedPaths createdPaths = getActualPath(serverName, pathText);
        Path givenPath = createdPaths.givenPath;
        Path resultPath = createNewPath(createdPaths.resultPath, name);
        if (Files.exists(resultPath))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The file already exists.");
        try {
            Files.createFile(resultPath);
            return givenPath;
        } catch (IOException e) {
            logger.error("Could not create file " + resultPath + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create file " + name + ".", e);
        }
    }

    public Path uploadFile(String serverName, String pathText, MultipartFile file) {
        CreatedPaths createdPaths = getActualPath(serverName, pathText);
        Path givenPath = createdPaths.givenPath;
        String fileName = file.getOriginalFilename();
        if (fileName == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The given file is invalid.");
        fileName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);
        Path resultPath = createNewPath(createdPaths.resultPath, fileName);
        if (Files.exists(resultPath))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The file already exists.");
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, resultPath);
            return givenPath;
        } catch (IOException e) {
            logger.error("Could not upload the file.", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not upload the given file.", e);
        }
    }

    public void editFile(String serverName, String pathText, String newContent) {
        if (newContent == null)
            newContent = "";
        Path path = getActualPath(serverName, pathText).resultPath;
        if (Files.exists(path) && Files.isDirectory(path))
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "Directories cannot be edited like files.");
        try (BufferedWriter writer = Files.newBufferedWriter(path, StandardOpenOption.CREATE, StandardOpenOption.WRITE,
                StandardOpenOption.TRUNCATE_EXISTING)) {
            writer.write(newContent);
            writer.flush();
        } catch (IOException e) {
            logger.error("Could not write to file " + path + ".");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not edit file " + pathText + ".", e);
        }
    }

    private void deleteCheckedPath(Path path) {
        try {
            if (Files.isDirectory(path))
                FileSystemUtils.deleteRecursively(path);
            else
                Files.delete(path);
        } catch (IOException e) {
            logger.error("Could not delete the file/directory " + path + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "The file/directory could not be deleted.", e);
        }
    }

    public void deleteFile(String serverName, String pathText) {
        CreatedPaths createdPaths = getActualPath(serverName, pathText);
        Path path = createdPaths.resultPath;
        Path root = createdPaths.rootPath;
        if (Files.notExists(path))
            return;
        if (path.equals(root))
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "You cannot delete server directories.");
        deleteCheckedPath(path);
    }

    public void deleteAllFiles(String serverName, String root) {
        Path rootPath = getActualPath(serverName, root).resultPath;
        try {
            Files.walk(rootPath)
                    .filter(path -> !path.equals(rootPath))
                    .forEach(this::deleteCheckedPath);
        } catch (IOException e) {
            logger.error("Could not delete the files in " + root + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "The files/directories could not be deleted.", e);
        }
    }

    public void renameFile(String serverName, String pathText, String newName) {
        CreatedPaths createdPaths = getActualPath(serverName, pathText);
        Path path = createdPaths.resultPath;
        Path root = createdPaths.rootPath;
        if (Files.notExists(path))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The file could not be found.");
        if (path.equals(root))
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "You cannot rename server directories.");
        Path parent = path.getParent();
        Path newPath = createNewPath(parent, newName);
        if (Files.exists(newPath))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A file with the new name already exists.");
        try {
            Files.move(path, newPath, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            logger.error("Could not rename file " + path + " to " + newPath + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "The file could not be renamed.", e);
        }
    }

    public void moveFile(String serverName, String pathText, String newPath) {
        CreatedPaths sourcePaths = getActualPath(serverName, pathText);
        Path sourcePath = sourcePaths.resultPath;
        Path sourceRoot = sourcePaths.rootPath;
        Path path = getActualPath(serverName, newPath).resultPath;
        Path destinationPath = createNewPath(path, sourcePath.getFileName());
        if (Files.notExists(sourcePath))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The source file could not be found.");
        if (Files.exists(destinationPath))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "There already is a file with the same name at the " +
                    "destination.");
        if (sourcePath.equals(sourceRoot))
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "You cannot move server directories.");
        try {
            Files.move(sourcePath, destinationPath, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            logger.error("Could not move file " + sourcePath + " to " + destinationPath + ".", e);
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "The file could not be moved.", e);
        }
    }

    public void copyFile(String serverName, String pathText, String newPath) {
        Path sourcePath = getActualPath(serverName, pathText).resultPath;
        Path path = getActualPath(serverName, newPath).resultPath;
        Path destinationPath = createNewPath(path, sourcePath.getFileName());
        if (Files.notExists(sourcePath))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The source file could not be found.");
        if (Files.exists(destinationPath))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "There already is a file with the same name at the " +
                    "destination " + destinationPath);
        try {
            FileSystemUtils.copyRecursively(sourcePath, destinationPath);
        } catch (IOException e) {
            logger.error("Could not copy file " + sourcePath + " to " + destinationPath + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "The file could not be copied.", e);
        }
    }

    public void compress(String serverName, String archiveName, List<String> files) {
        Path archivePath = getNotExistingPath(serverName, archiveName);
        List<Path> paths = files.stream().map(file -> getExistingPath(serverName, file)).collect(Collectors.toList());
        try (ZipOutputStream output = new ZipOutputStream(new FileOutputStream(archivePath.toFile()))) {
            for (Path path: paths)
                compressFile(path, path.getFileName().toString(), output);
        } catch (IOException e) {
            logger.error("Could not create archive " + archivePath + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "The archive could not be created.", e);
        }
    }

    private void compressFile(Path path, String fileName, ZipOutputStream output) throws IOException {
        if (Files.isDirectory(path)) {
            if (!fileName.endsWith("/"))
                fileName = fileName + "/";
            output.putNextEntry(new ZipEntry(fileName));
            output.closeEntry();
            List<Path> children = Files.walk(path, 1)
                    .filter(childPath -> !childPath.equals(path)).collect(Collectors.toList());
            for (Path childPath: children)
                compressFile(childPath, fileName + childPath.getFileName().toString(), output);
        } else {
            try (FileInputStream inputStream = new FileInputStream(path.toFile())) {
                output.putNextEntry(new ZipEntry(fileName));
                byte[] buffer = new byte[1024];
                int length = inputStream.read(buffer);
                while (length >= 0) {
                    output.write(buffer, 0, length);
                    length = inputStream.read(buffer);
                }
            }
        }
    }

    public void decompress(String serverName, String archiveName) {
        Path archivePath = getExistingPath(serverName, archiveName);
        Path destination = archivePath.getParent();
        File archive = archivePath.toFile();
        byte[] buffer = new byte[1024];
        try (ZipInputStream input = new ZipInputStream(new FileInputStream(archive))) {
            ZipEntry zipEntry = input.getNextEntry();
            while (zipEntry != null) {
                Path childPath = createNewPath(destination, zipEntry.getName());
                if (zipEntry.isDirectory()) {
                    if (Files.exists(childPath) && !Files.isDirectory(childPath)) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "There already is a file with the same name.");
                    } else {
                        Files.createDirectories(childPath);
                    }
                } else {
                    Path parent = childPath.getParent();
                    if (!Files.isDirectory(parent))
                        Files.createDirectories(parent);
                    try (FileOutputStream outputStream = new FileOutputStream(childPath.toFile())) {
                        int length = input.read(buffer);
                        while (length > 0) {
                            outputStream.write(buffer, 0, length);
                            length = input.read(buffer);
                        }
                    }
                }
                zipEntry = input.getNextEntry();
            }
            input.closeEntry();
        } catch (IOException e) {
            logger.error("Could not decompress archive " + archivePath + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "The archive could not be decompressed", e);
        }
    }

    public List<String> getConflictingFiles(String serverName, String destination, List<String> files) {
        Path destinationPath = getActualPath(serverName, destination).resultPath;
        try {
            return Files.walk(destinationPath)
                    .filter(path -> !path.equals(destinationPath))
                    .map(path -> path.getFileName().toString())
                    .filter(files::contains)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            logger.error("Could not walk the folder " + destinationPath + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "There was an internal server error.", e);
        }
    }

    @NotNull
    private List<Path> getServerDirectories(String serverName) {
        List<Path> directories = directoryMap.get(serverName);
        if (directories == null)
            throw new ServerNotFoundException(serverName);
        return directories;
    }

    private Path parsePath(String pathText) {
        if (pathText == null || pathText.isEmpty())
            throw new EmptyPathException();
        if (pathText.contains(".."))
            throw new InvalidPathException(pathText, "The path cannot contain parent references (..).");
        return Path.of(pathText);
    }

    private Path getRootDirectory(List<Path> directories, Path path) {
        for (Path root: directories) {
            if (path.startsWith(root.getName(root.getNameCount() - 1)))
                return root;
        }
        return null;
    }

    private Path removeRoot(Path path) {
        if (path.getNameCount() == 1)
            return Path.of("");
        return path.subpath(1, path.getNameCount());
    }

    // getActualPath, cand conteaza doar rezultatul
    private Path getExistingPath(String serverName, String pathText) {
        Path result = getActualPath(serverName, pathText).resultPath;
        if (Files.notExists(result))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The file/directory could not be found.");
        return result;
    }

    private Path getNotExistingPath(String serverName, String pathText) {
        Path result = getActualPath(serverName, pathText).resultPath;
        if (Files.exists(result))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "There already is a file with the same name.");
        return result;
    }

    private CreatedPaths getActualPath(String serverName, String pathText) {
        List<Path> directories = getServerDirectories(serverName);
        Path path = parsePath(pathText).normalize();
        Path root = getRootDirectory(directories, path);
        if (root == null)
            throw new PathOutsideServerException(serverName, pathText);
        path = removeRoot(path);
        Path result = root.resolve(path).normalize().toAbsolutePath();
        if (!result.startsWith(root))
            throw new PathOutsideServerException(serverName, pathText);
        return new CreatedPaths(root, path, result);
    }

    private Path createNewPath(Path root, String name) {
        Path path = parsePath(name);
        Path result = root.resolve(path).normalize().toAbsolutePath();
        if (!result.getParent().equals(root))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The given name is invalid.");
        return result;
    }

    private Path createNewPath(Path root, Path name) {
        return createNewPath(root, name.toString());
    }

    private List<Path> getChildren(Path root) throws IOException {
        return Files.walk(root, 1)
                .filter(path -> !path.equals(root)).collect(Collectors.toList());
    }

    private List<FileInfo> toFileInfoList(List<Path> paths) {
        List<FileInfo> result = new ArrayList<>();
        for (Path path: paths) {
            try {
                result.add(new FileInfo(path));
            } catch (FileNotFoundException e) {
                logger.error("File " + path + " supposedly doesn't exist.");
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File " + path + " could not be read.", e);
            } catch (IOException e) {
                logger.error("Encountered an exception while creating the FileInfo object of path " + path + ".", e);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File " + path + " could not be read.", e);
            }
        }
        return result;
    }

    private static class CreatedPaths {

        private final Path rootPath;
        private final Path givenPath;
        private final Path resultPath;

        private CreatedPaths(Path rootPath, Path givenPath, Path resultPath) {
            this.rootPath = rootPath;
            this.givenPath = givenPath;
            this.resultPath = resultPath;
        }
    }
}
