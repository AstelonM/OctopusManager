package com.astelon.octopusmanager.data;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class FileInfo {

    private final String name;
    private final boolean directory;
    private final long size;
    private final long lastModified;

    public FileInfo(Path path) throws IOException {
        if (Files.notExists(path))
            throw new FileNotFoundException();
        name = path.getFileName().toString();
        directory = Files.isDirectory(path);
        size = Files.size(path);
        lastModified = Files.getLastModifiedTime(path).toMillis();
    }

    public String getName() {
        return name;
    }

    public boolean isDirectory() {
        return directory;
    }

    public long getSize() {
        return size;
    }

    public long getLastModified() {
        return lastModified;
    }
}
