package com.astelon.octopusmanager.repositories;

import com.astelon.octopusmanager.data.RegisteredUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegisteredUserRepository extends JpaRepository<RegisteredUser, Integer> {

    RegisteredUser findByUsername(String name);

    RegisteredUser findFirstByRootTrue();
}
