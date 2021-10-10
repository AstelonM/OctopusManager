package com.astelon.octopusmanager.exceptions;

public class ServerNotFoundException extends RuntimeException {

    public ServerNotFoundException(String name) {
        super("Could not find a server with the name " + name + ".");
    }
}
