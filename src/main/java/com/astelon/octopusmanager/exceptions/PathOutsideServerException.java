package com.astelon.octopusmanager.exceptions;

public class PathOutsideServerException extends RuntimeException {

    public PathOutsideServerException(String serverName, String pathText) {
        super("Path " + pathText + " is outside server " + serverName + ".");
    }
}
