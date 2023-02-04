package com.astelon.octopusmanager.data;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

public class ServerInfo {

    private String command;
    private String workingDirectory;
    private List<String> extraDirectories;
    private long timeBetweenCrashes;
    private int restartAttempts;

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public String getWorkingDirectory() {
        return workingDirectory;
    }

    public void setWorkingDirectory(String workingDirectory) {
        this.workingDirectory = workingDirectory;
    }

    public List<String> getExtraDirectories() {
        return extraDirectories;
    }

    public void setExtraDirectories(List<String> extraDirectories) {
        this.extraDirectories = extraDirectories;
    }

    public long getTimeBetweenCrashes() {
        return timeBetweenCrashes;
    }

    public void setTimeBetweenCrashes(long timeBetweenCrashes) {
        this.timeBetweenCrashes = timeBetweenCrashes;
    }

    public int getRestartAttempts() {
        return restartAttempts;
    }

    public void setRestartAttempts(int restartAttempts) {
        this.restartAttempts = restartAttempts;
    }

    public void validate() {
        if (command == null || command.isEmpty() || command.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        if (workingDirectory == null || workingDirectory.isEmpty() || workingDirectory.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
}
