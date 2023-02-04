package com.astelon.octopusmanager.exceptions;

public class EmptyPathException extends IllegalArgumentException {

    public EmptyPathException() {
        super("Path cannot be empty or null.");
    }
}
