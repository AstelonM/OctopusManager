package com.astelon.octopusmanager.configs;

import com.astelon.octopusmanager.security.LogoutHandler;
import com.astelon.octopusmanager.security.RegisteredUserDetailsService;
import com.astelon.octopusmanager.security.AuthenticationHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    public static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    private final RegisteredUserDetailsService userDetailsService;

    public SecurityConfig(RegisteredUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers("/built/**", "/stylesheets/**", "/favicon.ico").permitAll()
                .antMatchers("/api/login").permitAll()
                .antMatchers("/", "/api/initialize", "/api/initialized").permitAll()
                .antMatchers("/api/accounts/create", "/api/accounts/update", "/api/accounts/delete")
                .hasAnyRole("ADMIN", "ROOT")
                .antMatchers("/api/accounts/create/admin", "/api/accounts/update/admin",
                        "/api/accounts/delete/admin").hasRole("ROOT")
                .antMatchers("/api/servers/create/**", "/api/servers/remove/**",
                        "/api/servers/edit/**").hasAnyRole("ADMIN", "ROOT")
                .anyRequest().authenticated()
                .and().httpBasic().disable()
                .formLogin().loginPage("/").loginProcessingUrl("/api/login")
                .successHandler(authenticationHandler()).failureHandler(authenticationHandler())
                .and().logout().logoutUrl("/api/logout")
                .logoutSuccessHandler(logoutHandler())
                .and().rememberMe().rememberMeParameter("rememberMe").authenticationSuccessHandler(authenticationHandler())
                .and().csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(PASSWORD_ENCODER);
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
