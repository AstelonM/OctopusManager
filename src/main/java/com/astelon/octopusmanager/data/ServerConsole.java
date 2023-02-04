package com.astelon.octopusmanager.data;

import com.astelon.octopusmanager.utils.ConsoleCache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ServerConsole {

    private static final Logger logger = LoggerFactory.getLogger(ServerConsole.class);

    private final String serverName;
    private final ConsoleCache cache;

    private final ExecutorService readExecutor;
    private final ExecutorService writeExecutor;

    private Process process;
    private BufferedWriter writer;

    public ServerConsole(String serverName, int cacheSize, SimpMessagingTemplate messagingTemplate) {
        this.serverName = serverName;
        cache = new ConsoleCache(messagingTemplate, serverName, cacheSize);
        readExecutor = Executors.newSingleThreadExecutor(r -> new Thread(r, "Read Thread Server " + serverName));
        writeExecutor = Executors.newSingleThreadExecutor(r -> new Thread(r, "Write Thread Server " + serverName));
    }

    public void processStart(Process process) {
        this.process = process;
        writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8));
        startReading();
    }

    public List<String> getConsoleText() {
        return cache.getCachedLines();
    }

    public void processStop() {
        process = null;
        try {
            writer.close();
        } catch (IOException e) {
            logger.error("Could not close the writer of server " + serverName + ".");
        } finally {
            writer = null;
        }
    }

    private void startReading() {
        readExecutor.execute(this::readConsole);
    }

    private void readConsole() {
        logger.info("Began reading from the console of server " + serverName + ".");
        InputStream inputStream = process.getInputStream();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line = reader.readLine();
            while (line != null) {
                cache.addLine(line);
                line = reader.readLine();
            }
        } catch (IOException e) {
            logger.error("Encountered an exception while reading from console of server " + serverName + ".", e);
            logManagerMessage("The manager has encountered an exception while reading from this console.");
        }
        logger.info("Stopped reading from the console of server " + serverName + ".");
    }

    public void writeMessage(String text) {
        cache.addLine(text);
        if (!text.endsWith("\n"))
            text = text + "\n";
        String finalText = text;
        writeExecutor.execute(() -> writeToConsole(finalText));
    }

    private void writeToConsole(String text) {
        if (writer == null)
            return;
        try {
            writer.write(text);
            writer.flush();
        } catch (IOException e) {
            logger.error("Encountered an exception while writing to the console of server " + serverName + ".", e);
            logManagerMessage("The manager has encountered an exception while writing to this console.");
        }
    }

    public void logManagerMessage(String message) {
        cache.addLine("[OctopusManager] " + message);
    }

    public void shutdown() {
        readExecutor.shutdownNow();
        writeExecutor.shutdownNow();
    }
}
