package com.astelon.octopusmanager.utils;

import com.astelon.octopusmanager.data.RegisteredUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public final class Utils {

    public static String getRole(Authentication authentication) {
        List<String> roles = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        return roles.get(0).replace("ROLE_", "");
    }

    public static String getRole(RegisteredUser registeredUser) {
        if (registeredUser.isRoot())
            return "ROOT";
        else if (registeredUser.isAdmin())
            return "ADMIN";
        else
            return "USER";
    }

    public static boolean isRoot(Authentication authentication) {
        return getRole(authentication).equals("ROOT");
    }

    public static boolean isAdmin(Authentication authentication) {
        String role = getRole(authentication);
        return role.equals("ROOT") || role.equals("ADMIN");
    }

    public static boolean isAdmin(RegisteredUser registeredUser) {
        String role = getRole(registeredUser);
        return role.equals("ROOT") || role.equals("ADMIN");
    }

    public static List<String> parseCommand(String command) {
        List<String> result = new ArrayList<>();
        StringBuilder currentArg = new StringBuilder();
        boolean quote = false;
        for (int i = 0; i < command.length(); i++) {
            char c = command.charAt(i);
            if (c == '"') {
                quote = !quote;
                currentArg.append(c);
            } else if (c == ' ') {
                if (quote) {
                    currentArg.append(c);
                } else {
                    result.add(currentArg.toString());
                    currentArg = new StringBuilder();
                }
            } else
                currentArg.append(c);
        }
        String lastArg = currentArg.toString();
        if (!lastArg.isEmpty() && !lastArg.isBlank())
            result.add(lastArg);
        return result;
    }
}
