package com.astelon.octopusmanager.controllers.api;

import com.astelon.octopusmanager.data.FileInfo;
import com.astelon.octopusmanager.managers.FileManager;
import com.astelon.octopusmanager.utils.requestbodies.MultiFileRequestBody;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FileController {

    private final FileManager fileManager;

    public FileController(FileManager fileManager) {
        this.fileManager = fileManager;
    }

    @GetMapping("/server/{serverName}/directories")
    public List<FileInfo> showDirectories(@PathVariable String serverName) {
        return fileManager.getDirectories(serverName);
    }

    @GetMapping("/server/{serverName}/files")
    public List<FileInfo> showFiles(@PathVariable String serverName, @RequestParam String path) {
        List<FileInfo> result = fileManager.getFiles(serverName, path);
        result.sort((file1, file2) -> {
            if (file1.equals(file2))
                return 0;
            if (file1.isDirectory() && !file2.isDirectory())
                return -1;
            else if (!file1.isDirectory() && file2.isDirectory())
                return 1;
            else
                return file1.getName().compareTo(file2.getName());
        });
        return result;
    }

    @PostMapping("/server/{serverName}/files/newFile")
    public ResponseEntity<?> createFile(@PathVariable String serverName, @RequestParam String path,
                                        @RequestBody Map<String, String> requestBody) {
        String name = requestBody.get("name");
        if (name == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The name field is required.");
        Path result = fileManager.createFile(serverName, path, name);
        return ResponseEntity.created(MvcUriComponentsBuilder.fromMethodName(
                FileController.class,
                "showFile",
                serverName,
                result.toString()
        ).build().toUri()).build();
    }

    @PostMapping("/server/{serverName}/files/newDirectory")
    public ResponseEntity<?> createDirectory(@PathVariable String serverName, @RequestParam String path,
                                             @RequestBody Map<String, String> requestBody) {
        String name = requestBody.get("name");
        if (name == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The name field is required.");
        Path result = fileManager.createDirectory(serverName, path, name);
        return ResponseEntity.created(MvcUriComponentsBuilder.fromMethodName(
                FileController.class,
                "showFiles",
                serverName,
                result.toString()
        ).build().toUri()).build();
    }

    @PostMapping("/server/{serverName}/files/upload")
    public ResponseEntity<?> uploadFile(@PathVariable String serverName, @RequestParam String path,
                                        @RequestParam MultipartFile file) {
        Path result = fileManager.uploadFile(serverName, path, file);
        return ResponseEntity.created(MvcUriComponentsBuilder.fromMethodName(
                FileController.class,
                "showFile",
                serverName,
                result.toString()
        ).build().toUri()).build();
    }

    @DeleteMapping("/server/{serverName}/files")
    public ResponseEntity<?> deleteFile(@PathVariable String serverName, @RequestParam String path) {
        fileManager.deleteFile(serverName, path);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/files/delete/multiple")
    public ResponseEntity<?> deleteMultipleFiles(@PathVariable String serverName,
                                        @RequestBody MultiFileRequestBody requestBody) {
        //if (requestBody.isAll()) {
        //    fileManager.deleteAllFiles(serverName, path);
        //} else {
            for (String file: requestBody.getFiles())
                fileManager.deleteFile(serverName, file);
        //}
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/server/{serverName}/files")
    public ResponseEntity<?> renameFile(@PathVariable String serverName, @RequestParam String path,
                                        @RequestBody Map<String, String> requestBody) {
        String newName = requestBody.get("newName");
        if (newName == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The newName field is required.");
        fileManager.renameFile(serverName, path, newName);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/files/move")
    public ResponseEntity<?> moveFile(@PathVariable String serverName, @RequestParam String path,
                                      @RequestBody Map<String, String> requestBody) {
        String sourcePath = requestBody.get("sourcePath");
        if (sourcePath == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The sourcePath field is required.");
        fileManager.moveFile(serverName, sourcePath, path);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/files/move/multiple")
    public ResponseEntity<?> moveMultipleFiles(@PathVariable String serverName, @RequestParam String path,
                                      @RequestBody MultiFileRequestBody requestBody) {
        for (String file: requestBody.getFiles()) {
            try {
                fileManager.moveFile(serverName, file, path);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/files/copy")
    public ResponseEntity<?> copyFile(@PathVariable String serverName, @RequestParam String path,
                                      @RequestBody Map<String, String> requestBody) {
        String sourcePath = requestBody.get("sourcePath");
        if (sourcePath == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The sourcePath field is required.");
        fileManager.copyFile(serverName, sourcePath, path);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/files/copy/multiple")
    public ResponseEntity<?> copyMultipleFiles(@PathVariable String serverName, @RequestParam String path,
                                      @RequestBody MultiFileRequestBody requestBody) {
        for (String file: requestBody.getFiles()) {
            try {
                fileManager.copyFile(serverName, file, path);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/files/compress")
    public ResponseEntity<?> compressFiles(@PathVariable String serverName, @RequestParam String path,
                                           @RequestBody MultiFileRequestBody requestBody) {
        fileManager.compress(serverName, path, requestBody.getFiles());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/files/decompress")
    public ResponseEntity<?> compressFiles(@PathVariable String serverName, @RequestParam String path) {
        fileManager.decompress(serverName, path);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/server/{serverName}/file")
    public ResponseEntity<Resource> showFile(@PathVariable String serverName, @RequestParam String path) {
        Resource file = fileManager.getFileContent(serverName, path);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }

    @PutMapping("/server/{serverName}/file")
    public ResponseEntity<?> editFile(@PathVariable String serverName, @RequestParam String path,
                                      @RequestBody Map<String, String> requestBody) {
        fileManager.editFile(serverName, path, requestBody.get("newContent"));
        return ResponseEntity.noContent().build();
    }
}
