package com.astelon.octopusmanager.managers;

import com.astelon.octopusmanager.configs.AppConfig;
import com.astelon.octopusmanager.configs.ServerConfig;
import com.astelon.octopusmanager.data.ServerInfo;
import com.astelon.octopusmanager.data.Server;
import com.astelon.octopusmanager.data.ServerConsole;
import com.astelon.octopusmanager.exceptions.ServerNotFoundException;
import org.jetbrains.annotations.NotNull;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConsoleManager {

    private final AppConfig appConfig;
    private final SimpMessagingTemplate messagingTemplate;
    private final HashMap<String, ServerConsole> consoles;

    public ConsoleManager(ServerConfig serverConfig, AppConfig appConfig, SimpMessagingTemplate messagingTemplate) {
        this.appConfig = appConfig;
        this.messagingTemplate = messagingTemplate;
        consoles = new HashMap<>();
        for (Map.Entry<String, ServerInfo> entry: serverConfig.getServers().entrySet()) {
            consoles.put(entry.getKey(), new ServerConsole(entry.getKey(), appConfig.getConsoleCacheSize(), messagingTemplate));
        }
    }

    public void addServerConsole(Server server) {
        consoles.put(server.getName(), new ServerConsole(server.getName(), appConfig.getConsoleCacheSize(), messagingTemplate));
    }

    public void removeServerConsole(String serverName) {
        consoles.remove(serverName);
    }

    public void startConsole(String serverName, Process process) {
        getServerConsole(serverName).processStart(process);
    }

    public List<String> getConsoleText(String serverName) {
        return getServerConsole(serverName).getConsoleText();
    }

    public void writeToConsole(String serverName, String message) {
        getServerConsole(serverName).writeMessage(message);
    }

    public void stopConsole(String serverName) {
        getServerConsole(serverName).processStop();
    }

    public void logManagerMessage(String serverName, String message) {
        getServerConsole(serverName).logManagerMessage(message);
    }

    public void shutdown() {
        for (ServerConsole console: consoles.values())
            console.shutdown();
    }

    @NotNull
    private ServerConsole getServerConsole(String serverName) {
        ServerConsole console = consoles.get(serverName);
        if (console == null)
            throw new ServerNotFoundException(serverName);
        return console;
    }
}
