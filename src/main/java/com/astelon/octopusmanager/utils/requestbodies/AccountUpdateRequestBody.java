package com.astelon.octopusmanager.utils.requestbodies;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class AccountUpdateRequestBody {

    private String originalUsername;
    private String newUsername;
    private String newPassword;

    public String getOriginalUsername() {
        return originalUsername;
    }

    public void setOriginalUsername(String originalUsername) {
        this.originalUsername = originalUsername;
    }

    public String getNewUsername() {
        return newUsername;
    }

    public void setNewUsername(String newUsername) {
        this.newUsername = newUsername;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public void validate() {
        if (newUsername == null || newUsername.isEmpty() || newUsername.isBlank() ||
                (newPassword != null && (newPassword.isEmpty() || newPassword.isBlank())))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
}
