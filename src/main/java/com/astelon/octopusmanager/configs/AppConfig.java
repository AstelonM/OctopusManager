package com.astelon.octopusmanager.configs;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

@ConfigurationProperties("app")
public class AppConfig {

    private int consoleCacheSize;
    private DataSize maxFileSize;

    public int getConsoleCacheSize() {
        return consoleCacheSize;
    }

    public void setConsoleCacheSize(int consoleCacheSize) {
        this.consoleCacheSize = consoleCacheSize;
    }

    public DataSize getMaxFileSize() {
        return maxFileSize;
    }

    public long getMaxFileSizeBytes() {
        return maxFileSize.toBytes();
    }

    public void setMaxFileSize(DataSize maxFileSize) {
        this.maxFileSize = maxFileSize;
    }
}
