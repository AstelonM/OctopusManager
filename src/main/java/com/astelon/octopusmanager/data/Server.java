package com.astelon.octopusmanager.data;

import com.astelon.octopusmanager.managers.ConsoleManager;
import com.astelon.octopusmanager.managers.FileManager;
import com.astelon.octopusmanager.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

public class Server {

    private static final Logger logger = LoggerFactory.getLogger(Server.class);

    private final ConsoleManager consoleManager;
    private final FileManager fileManager;

    private final String name;
    private List<String> command;
    private File workingDirectory;

    private long timeBetweenCrashes;
    private int restartAttempts;
    private long lastCrash;
    private int currentRestartAttempt;

    private Process process;
    private volatile Status status;
    private volatile boolean stopped;
    private volatile boolean restarting;

    private final SimpMessagingTemplate messagingTemplate;

    public Server(ConsoleManager consoleManager, FileManager fileManager, String name, ServerInfo serverInfo,
                  SimpMessagingTemplate messagingTemplate) {
        this.consoleManager = consoleManager;
        this.fileManager = fileManager;
        this.name = name;
        Path path = fileManager.getWorkingDirectory(serverInfo.getWorkingDirectory());
        this.workingDirectory = path.toFile();
        this.command = Utils.parseCommand(serverInfo.getCommand());
        this.timeBetweenCrashes = serverInfo.getTimeBetweenCrashes();
        this.restartAttempts = serverInfo.getRestartAttempts();
        this.messagingTemplate = messagingTemplate;
        status = Status.OFFLINE;
        stopped = true;
    }

    public boolean isOnline() {
        return status == Status.ONLINE || status == Status.RESTARTING;
    }

    public void start() throws IOException {
        process = new ProcessBuilder(command).redirectErrorStream(true).directory(workingDirectory).start();
        stopped = false;
        restarting = false;
        setStatus(Status.ONLINE);
        process.onExit().thenAccept(this::processExit);
        consoleManager.logManagerMessage(name, "Starting server " + name + ".");
        consoleManager.startConsole(name, process);
    }

    public void stop() {
        if (process != null) {
            stopped = true;
            consoleManager.logManagerMessage(name, "Stopping server " + name + ".");
            process.destroy();
        }
    }

    public void kill() {
        if (process != null) {
            stopped = true;
            consoleManager.logManagerMessage(name, "Killing server " + name + ".");
            process.destroyForcibly();
        }
    }

    public void restart() {
        if (process != null) {
            restarting = true;
            consoleManager.logManagerMessage(name, "Restarting server " + name + ".");
            process.destroy();
        }
    }

    private void processExit(Process process) {
        consoleManager.stopConsole(name);
        if (restarting) {
            tryRestart();
            return;
        }
        int exitValue = process.exitValue();
        if (exitValue == 0 || stopped) {
            setStatus(Status.OFFLINE);
            consoleManager.logManagerMessage(name, "Server " + name + " shut down.");
        } else {
            long currentCrash = System.currentTimeMillis();
            setStatus(Status.CRASHED);
            consoleManager.logManagerMessage(name, "Server " + name + " has crashed.");
            if (restartAttempts > 0) {
                if (currentCrash - lastCrash < timeBetweenCrashes)
                    currentRestartAttempt++;
                else
                    currentRestartAttempt = 1;
                lastCrash = currentCrash;
                if (currentRestartAttempt <= restartAttempts) {
                    consoleManager.logManagerMessage(name, "Attempting restart " + currentRestartAttempt + ".");
                    tryRestart();
                } else {
                    consoleManager.logManagerMessage(name, "The server crashed too many times. Automatic restarts " +
                            "will no longer be attempted.");
                }
            }
        }
    }

    private void tryRestart() {
        setStatus(Status.RESTARTING);
        try {
            start();
        } catch (IOException e) {
            logger.error("Encountered an exception while restarting the process.", e);
            consoleManager.logManagerMessage(name, "The server could not be restarted.");
            setStatus(Status.CRASHED);
        }
    }

    private void setStatus(Status status) {
        this.status = status;
        messagingTemplate.convertAndSend("/topic/status/" + name, status.name());
    }

    public String getName() {
        return name;
    }

    public void setCommand(String command) {
        this.command = Utils.parseCommand(command);
    }

    public void setWorkingDirectory(String workingDirectory) {
        Path path = fileManager.getWorkingDirectory(workingDirectory);
        this.workingDirectory = path.toFile();
    }

    public void setTimeBetweenCrashes(long timeBetweenCrashes) {
        this.timeBetweenCrashes = timeBetweenCrashes;
    }

    public void setRestartAttempts(int restartAttempts) {
        this.restartAttempts = restartAttempts;
    }

    public Status getStatus() {
        return status;
    }

    public enum Status {
        ONLINE,
        OFFLINE,
        CRASHED,
        RESTARTING
    }
}
