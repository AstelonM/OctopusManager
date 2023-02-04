package com.astelon.octopusmanager.utils.requestbodies;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class AccountRequestBody {

    private String username;
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void validate() {
        if (username == null || username.isEmpty() || username.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        if (password == null || password.isEmpty() || password.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
}
