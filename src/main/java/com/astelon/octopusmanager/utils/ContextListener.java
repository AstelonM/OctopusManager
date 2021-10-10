package com.astelon.octopusmanager.utils;

import com.astelon.octopusmanager.managers.ConsoleManager;
import com.astelon.octopusmanager.managers.ServerManager;
import org.springframework.stereotype.Service;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

@Service
public class ContextListener implements ServletContextListener {

    private final ServerManager serverManager;
    private final ConsoleManager consoleManager;

    public ContextListener(ServerManager serverManager, ConsoleManager consoleManager) {
        this.serverManager = serverManager;
        this.consoleManager = consoleManager;
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        serverManager.shutdown();
        consoleManager.shutdown();
    }
}
