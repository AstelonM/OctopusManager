package com.astelon.octopusmanager.configs;

import com.astelon.octopusmanager.data.ServerInfo;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.Map;

@ConfigurationProperties("managed")
public class ServerConfig {

    private Map<String, ServerInfo> servers;

    public Map<String, ServerInfo> getServers() {
        if (servers == null)
            servers = new HashMap<>();
        return servers;
    }

    public void setServers(Map<String, ServerInfo> servers) {
        this.servers = servers;
    }

}
