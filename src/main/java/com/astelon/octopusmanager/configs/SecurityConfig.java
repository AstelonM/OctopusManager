package com.astelon.octopusmanager.configs;

import com.astelon.octopusmanager.security.LogoutHandler;
import com.astelon.octopusmanager.security.RegisteredUserDetailsService;
import com.astelon.octopusmanager.security.AuthenticationHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    public static final PasswordEncoder PASSWORD_ENCODER = PasswordEncoderFactories.createDelegatingPasswordEncoder();

    private final RegisteredUserDetailsService userDetailsService;

    public SecurityConfig(RegisteredUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests()
                .requestMatchers("/built/**", "/stylesheets/**", "/favicon.ico").permitAll()
                .requestMatchers("/api/login").permitAll()
                .requestMatchers("/", "/api/initialize", "/api/initialized").permitAll()
                .requestMatchers("/api/accounts/create", "/api/accounts/update", "/api/accounts/delete")
                .hasAnyRole("ADMIN", "ROOT")
                .requestMatchers("/api/accounts/create/admin", "/api/accounts/update/admin",
                        "/api/accounts/delete/admin").hasRole("ROOT")
                .requestMatchers("/api/servers/create/**", "/api/servers/remove/**",
                        "/api/servers/edit/**").hasAnyRole("ADMIN", "ROOT")
                .anyRequest().authenticated()
                .and()
                .httpBasic().disable()
                .formLogin().loginPage("/").loginProcessingUrl("/api/login")
                .successHandler(authenticationHandler()).failureHandler(authenticationHandler())
                .and()
                .logout().logoutUrl("/api/logout")
                .logoutSuccessHandler(logoutHandler())
                .and()
                .rememberMe().rememberMeParameter("rememberMe").authenticationSuccessHandler(authenticationHandler())
                .and()
                .csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder builder = http.getSharedObject(AuthenticationManagerBuilder.class);
        builder.userDetailsService(userDetailsService).passwordEncoder(PASSWORD_ENCODER);
        return builder.build();
    }

    @Bean
    public AuthenticationHandler authenticationHandler() {
        return new AuthenticationHandler();
    }

    @Bean
    public LogoutHandler logoutHandler() {
        return new LogoutHandler();
    }
}
