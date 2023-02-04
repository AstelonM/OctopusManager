package com.astelon.octopusmanager.managers;

import com.astelon.octopusmanager.configs.ServerConfig;
import com.astelon.octopusmanager.data.PartialServerInfo;
import com.astelon.octopusmanager.data.ServerInfo;
import com.astelon.octopusmanager.data.Server;
import com.astelon.octopusmanager.exceptions.ServerNotFoundException;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;
import org.yaml.snakeyaml.nodes.Tag;
import org.yaml.snakeyaml.representer.Representer;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ServerManager {

    private static final Logger logger = LoggerFactory.getLogger(ServerManager.class);

    private final ConsoleManager consoleManager;
    private final FileManager fileManager;

    private final SimpMessagingTemplate messagingTemplate;

    private final ArrayList<Server> servers;
    private final HashMap<String, Server> serverMap;

    private final ServerConfigTemplate serverConfigTemplate;

    public ServerManager(ServerConfig serverConfig, ConsoleManager consoleManager, FileManager fileManager,
                         SimpMessagingTemplate messagingTemplate) {
        this.consoleManager = consoleManager;
        this.fileManager = fileManager;
        this.messagingTemplate = messagingTemplate;
        servers = new ArrayList<>();
        serverMap = new HashMap<>();
        for (Map.Entry<String, ServerInfo> entry: serverConfig.getServers().entrySet()) {
            Server server = new Server(consoleManager, fileManager, entry.getKey(), entry.getValue(), messagingTemplate);
            servers.add(server);
            serverMap.put(server.getName(), server);
        }
        serverConfigTemplate = new ServerConfigTemplate();
        serverConfigTemplate.setManaged(serverConfig);
    }

    public List<PartialServerInfo> getServers() {
        return servers.stream().map(server -> new PartialServerInfo(server.getName(), server.getStatus())).collect(Collectors.toList());
    }

    public Server.Status getServerStatus(String serverName) {
        return getServer(serverName).getStatus();
    }

    public void startServer(String serverName) {
        try {
            getServer(serverName).start();
        } catch (IOException e) {
            logger.error("Could not start server " + serverName + ".", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Server could not be started.", e);
        }
    }

    public void stopServer(String serverName) {
        getServer(serverName).stop();
    }

    public void killServer(String serverName) {
        getServer(serverName).kill();
    }

    public void restartServer(String serverName) {
        getServer(serverName).restart();
    }

    @NotNull
    private Server getServer(String name) {
        Server server = serverMap.get(name);
        if (server == null)
            throw new ServerNotFoundException(name);
        return server;
    }

    public ServerInfo getServerInfo(String name) {
        ServerInfo info = serverConfigTemplate.managed.getServers().get(name);
        if (info == null)
            throw new ServerNotFoundException(name);
        return info;
    }

    public void createServer(String name, ServerInfo info) {
        if (name == null || name.isEmpty() || name.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        info.validate();
        if (serverMap.containsKey(name))
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        Server server = new Server(consoleManager, fileManager, name, info, messagingTemplate);
        servers.add(server);
        serverMap.put(name, server);
        consoleManager.addServerConsole(server);
        fileManager.addServerDirectories(name, info);
        serverConfigTemplate.managed.getServers().put(name, info);
        saveConfig();
    }

    public void removeServer(String name) {
        Server server = getServer(name);
        if (server.isOnline())
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        servers.remove(server);
        serverMap.remove(name);
        serverConfigTemplate.managed.getServers().remove(name);
        fileManager.removeServerDirectories(name);
        consoleManager.removeServerConsole(name);
        saveConfig();
    }

    public void updateServer(String name, ServerInfo info) {
        Server server = getServer(name);
        if (server.isOnline())
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        server.setCommand(info.getCommand());
        server.setWorkingDirectory(info.getWorkingDirectory());
        server.setTimeBetweenCrashes(info.getTimeBetweenCrashes());
        server.setRestartAttempts(info.getRestartAttempts());
        serverConfigTemplate.managed.getServers().put(name, info);
        fileManager.updateServerDirectories(name, info);
        saveConfig();
    }

    public void shutdown() {
        for (Server server: servers)
            server.stop();
    }

    private void saveConfig() {
        try {
            DumperOptions options = new DumperOptions();
            options.setDefaultFlowStyle(DumperOptions.FlowStyle.AUTO);
            options.setPrettyFlow(false);
            Yaml yaml = new Yaml(new Constructor(ServerConfigTemplate.class), new Representer(), options);
            String output = yaml.dumpAs(serverConfigTemplate, Tag.MAP, DumperOptions.FlowStyle.AUTO);
            try (FileWriter fileWriter = new FileWriter("servers.yml")) {
                fileWriter.write(output);
                fileWriter.flush();
            }
        } catch (IOException e) {
            logger.error("Could not save the servers config.", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public static class ServerConfigTemplate {

        private ServerConfig managed;

        public ServerConfig getManaged() {
            return managed;
        }

        public void setManaged(ServerConfig managed) {
            this.managed = managed;
        }
    }
}
