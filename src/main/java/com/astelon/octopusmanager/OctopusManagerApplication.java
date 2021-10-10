package com.astelon.octopusmanager;

import com.astelon.octopusmanager.configs.AppConfig;
import com.astelon.octopusmanager.configs.ServerConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({ ServerConfig.class, AppConfig.class })
public class OctopusManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(OctopusManagerApplication.class, args);
    }
}
