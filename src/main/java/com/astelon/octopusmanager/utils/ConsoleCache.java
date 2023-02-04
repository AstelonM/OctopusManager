package com.astelon.octopusmanager.utils;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

public class ConsoleCache {

    private final SimpMessagingTemplate messagingTemplate;
    private final String serverName;
    private final int cacheSize;
    private final ConcurrentLinkedQueue<String> cache;

    private int currentSize;

    public ConsoleCache(SimpMessagingTemplate messagingTemplate, String serverName, int cacheSize) {
        this.messagingTemplate = messagingTemplate;
        this.serverName = serverName;
        this.cacheSize = cacheSize;
        cache = new ConcurrentLinkedQueue<>();
    }

    public void addLine(String line) {
        if (currentSize == cacheSize)
            cache.poll();
        else
            currentSize++;
        cache.add(line);
        messagingTemplate.convertAndSend("/topic/console/" + serverName, line);
    }

    public List<String> getCachedLines() {
        ArrayList<String> view = new ArrayList<>(cache);
        return Collections.unmodifiableList(view);
    }
}
