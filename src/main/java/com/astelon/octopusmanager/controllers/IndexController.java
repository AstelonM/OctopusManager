package com.astelon.octopusmanager.controllers;

import com.astelon.octopusmanager.configs.AppConfig;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

    private final AppConfig appConfig;

    public IndexController(AppConfig appConfig) {
        this.appConfig = appConfig;
    }

    //TODO find an alternative in PathPattern maybe?
    @GetMapping(value = {"/", "/{x:[\\w\\-]+}", "/{x:^(?!api$).*$}/**/{y:[\\w\\-]+}"})
    public String showIndex(Model model) {
        model.addAttribute("consoleCacheSize", appConfig.getConsoleCacheSize());
        model.addAttribute("maxFileSize", appConfig.getMaxFileSizeBytes());
        return "index";
    }
}
