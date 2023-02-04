package com.astelon.octopusmanager.data;

public class PartialServerInfo {

    private final String name;
    private final Server.Status status;

    public PartialServerInfo(String name, Server.Status status) {
        this.name = name;
        this.status = status;
    }

    public String getName() {
        return name;
    }

    public Server.Status getStatus() {
        return status;
    }
}
