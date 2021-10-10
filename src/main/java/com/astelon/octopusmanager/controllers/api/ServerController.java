package com.astelon.octopusmanager.controllers.api;

import com.astelon.octopusmanager.data.PartialServerInfo;
import com.astelon.octopusmanager.data.ServerInfo;
import com.astelon.octopusmanager.data.Server;
import com.astelon.octopusmanager.managers.ServerManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ServerController {

    private final ServerManager serverManager;

    public ServerController(ServerManager serverManager) {
        this.serverManager = serverManager;
    }

    @GetMapping("/servers")
    public List<PartialServerInfo> showServerList() {
        return serverManager.getServers();
    }

    @PostMapping("/servers/create/{serverName}")
    public ResponseEntity<?> createServer(@PathVariable String serverName, @RequestBody ServerInfo requestBody) {
        serverManager.createServer(serverName, requestBody);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/servers/remove/{serverName}")
    public ResponseEntity<?> removeServer(@PathVariable String serverName) {
        serverManager.removeServer(serverName);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/servers/edit/{serverName}")
    public ResponseEntity<?> updateServer(@PathVariable String serverName, @RequestBody ServerInfo requestBody) {
        serverManager.updateServer(serverName, requestBody);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/server/{serverName}/info")
    public ServerInfo getServerInfo(@PathVariable String serverName) {
        return serverManager.getServerInfo(serverName);
    }

    @GetMapping("/server/{serverName}/status")
    public Server.Status getServerStatus(@PathVariable String serverName) {
        return serverManager.getServerStatus(serverName);
    }

    @PostMapping("/server/{serverName}/start")
    public ResponseEntity<?> startServer(@PathVariable String serverName) {
        serverManager.startServer(serverName);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/stop")
    public ResponseEntity<?> stopServer(@PathVariable String serverName) {
        serverManager.stopServer(serverName);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/kill")
    public ResponseEntity<?> killServer(@PathVariable String serverName) {
        serverManager.killServer(serverName);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/server/{serverName}/restart")
    public ResponseEntity<?> restartServer(@PathVariable String serverName) {
        serverManager.restartServer(serverName);
        return ResponseEntity.noContent().build();
    }
}
