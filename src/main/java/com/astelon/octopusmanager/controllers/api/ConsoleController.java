package com.astelon.octopusmanager.controllers.api;

import com.astelon.octopusmanager.managers.ConsoleManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ConsoleController {

    private final ConsoleManager consoleManager;

    public ConsoleController(ConsoleManager consoleManager) {
        this.consoleManager = consoleManager;
    }

    @GetMapping("/server/{serverName}/console")
    public List<String> getConsole(@PathVariable String serverName) {
        return consoleManager.getConsoleText(serverName);
    }

    @PostMapping("/server/{serverName}/console")
    public ResponseEntity<?> sendCommand(@PathVariable String serverName, @RequestBody Map<String, String> requestBody) {
        String command = requestBody.get("command");
        if (command == null || command.isEmpty() || command.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The command field is required.");
        consoleManager.writeToConsole(serverName, command);
        return ResponseEntity.noContent().build();
    }
}
