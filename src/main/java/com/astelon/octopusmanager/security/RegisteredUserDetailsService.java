package com.astelon.octopusmanager.security;

import com.astelon.octopusmanager.data.RegisteredUser;
import com.astelon.octopusmanager.repositories.RegisteredUserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RegisteredUserDetailsService implements UserDetailsService {

    private final RegisteredUserRepository repository;

    public RegisteredUserDetailsService(RegisteredUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        RegisteredUser registeredUser = repository.findByUsername(username);
        if (registeredUser == null)
            throw new UsernameNotFoundException("No user found with the name " + username + ".");
        List<GrantedAuthority> authorities;
        if (registeredUser.isRoot())
            authorities = AuthorityUtils.createAuthorityList("ROLE_ROOT");
        else if (registeredUser.isAdmin())
            authorities = AuthorityUtils.createAuthorityList("ROLE_ADMIN");
        else
            authorities = AuthorityUtils.createAuthorityList("ROLE_USER");
        return new User(registeredUser.getUsername(), registeredUser.getPassword(), authorities);
    }
}
