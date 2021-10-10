package com.astelon.octopusmanager.utils.requestbodies;

import java.util.List;

public class MultiFileRequestBody {

    private List<String> files;

    public List<String> getFiles() {
        return files;
    }

    public void setFiles(List<String> files) {
        this.files = files;
    }
}
