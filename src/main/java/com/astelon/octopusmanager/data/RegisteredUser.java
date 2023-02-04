package com.astelon.octopusmanager.data;

import com.astelon.octopusmanager.configs.SecurityConfig;

import javax.persistence.*;
import java.util.Objects;

@Entity
public class RegisteredUser {

    @Id
    @GeneratedValue
    private int id;

    @Column(unique = true)
    private String username;

    private String password;

    private boolean root;

    private boolean admin;

    public RegisteredUser() {}

    public RegisteredUser(String username, String password, boolean root, boolean admin) {
        this.username = username;
        setPassword(password);
        this.root = root;
        this.admin = admin;
    }

    public RegisteredUser(String username, String password, boolean admin) {
        this.username = username;
        setPassword(password);
        root = false;
        this.admin = admin;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

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
        this.password = SecurityConfig.PASSWORD_ENCODER.encode(password);
    }

    public boolean isRoot() {
        return root;
    }

    public void setRoot(boolean root) {
        this.root = root;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        RegisteredUser that = (RegisteredUser) o;
        return getId() == that.getId() && isRoot() == that.isRoot() && isAdmin() == that.isAdmin() && getUsername().equals(that.getUsername()) && getPassword().equals(that.getPassword());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getUsername(), getPassword(), isRoot(), isAdmin());
    }
}
