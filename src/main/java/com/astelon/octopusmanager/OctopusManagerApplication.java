package com.astelon.octopusmanager;

import com.astelon.octopusmanager.configs.AppConfig;
import com.astelon.octopusmanager.configs.ServerConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
@EnableConfigurationProperties({ ServerConfig.class, AppConfig.class })
public class OctopusManagerApplication {

    public static void main(String[] args) {
        try {
            Path config = Path.of("config.yml");
            if (!Files.exists(config)) {
                System.out.println("Could not find config.yml, creating a default one.");
                InputStream defaultConfig = OctopusManagerApplication.class.getClassLoader().getResourceAsStream("config.yml");
                if (defaultConfig == null) {
                    System.out.println("Could not find the default config.yml somehow. You may want to download OctopusManager again.");
                    return;
                }
                Files.copy(defaultConfig, config);
            }
            SpringApplication.run(OctopusManagerApplication.class, args);
        } catch (IOException e) {
            System.out.println("Could not create config.yml. You may want to download it or create it yourself.");
            e.printStackTrace();
        }
    }
}
