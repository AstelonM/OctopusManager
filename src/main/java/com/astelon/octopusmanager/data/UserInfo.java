package com.astelon.octopusmanager.data;

public class UserInfo {

    private final String username;
    private final String role;

    public UserInfo(String username, String role) {
        this.username = username;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }
}
