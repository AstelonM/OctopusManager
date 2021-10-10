package com.astelon.octopusmanager.utils.requestbodies;

public class AccountUpdateAdminRequestBody extends AccountUpdateRequestBody {

    private boolean admin;

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }
}
