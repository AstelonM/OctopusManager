package com.astelon.octopusmanager.controllers.api;

import com.astelon.octopusmanager.data.RegisteredUser;
import com.astelon.octopusmanager.data.UserInfo;
import com.astelon.octopusmanager.repositories.RegisteredUserRepository;
import com.astelon.octopusmanager.utils.Utils;
import com.astelon.octopusmanager.utils.requestbodies.AccountRequestBody;
import com.astelon.octopusmanager.utils.requestbodies.AccountUpdateAdminRequestBody;
import com.astelon.octopusmanager.utils.requestbodies.AccountUpdateRequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AccountController {

    private final RegisteredUserRepository repository;

    public AccountController(RegisteredUserRepository repository) {
        this.repository = repository;
    }

    @GetMapping("initialized")
    public ResponseEntity<?> isInitialized() {
        RegisteredUser root = repository.findFirstByRootTrue();
        if (root != null)
            return ResponseEntity.noContent().build();
        else
            return ResponseEntity.notFound().build();
    }

    @PostMapping("initialize")
    public ResponseEntity<?> initialize(@RequestBody AccountRequestBody requestBody) {
        RegisteredUser root = repository.findFirstByRootTrue();
        if (root != null)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The manager is already initialized.");
        RegisteredUser user = new RegisteredUser(requestBody.getUsername(), requestBody.getPassword(), true, true);
        repository.saveAndFlush(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("user")
    public UserInfo check(Authentication authentication) {
        return new UserInfo(authentication.getName(), Utils.getRole(authentication));
    }

    @GetMapping("users")
    public List<UserInfo> getUsers() {
        return repository.findAll().stream().map(user -> new UserInfo(user.getUsername(), Utils.getRole(user))).collect(Collectors.toList());
    }

    @PostMapping("accounts/create")
    public ResponseEntity<?> createAccount(@RequestBody AccountRequestBody requestBody) {
        requestBody.validate();
        RegisteredUser possibleUser = repository.findByUsername(requestBody.getUsername());
        if (possibleUser != null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "There already is a user with that username.");
        RegisteredUser user = new RegisteredUser(requestBody.getUsername(), requestBody.getPassword(), false);
        repository.saveAndFlush(user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("accounts/create/admin")
    public ResponseEntity<?> createAdminAccount(@RequestBody AccountRequestBody requestBody) {
        requestBody.validate();
        RegisteredUser possibleUser = repository.findByUsername(requestBody.getUsername());
        if (possibleUser != null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "There already is a user with that username.");
        RegisteredUser user = new RegisteredUser(requestBody.getUsername(), requestBody.getPassword(), true);
        repository.saveAndFlush(user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("accounts/update")
    public ResponseEntity<?> updateAccount(@RequestBody AccountUpdateRequestBody requestBody, Authentication authentication) {
        validateRequest(requestBody);
        if (!authentication.getName().equals(requestBody.getOriginalUsername())) {
            RegisteredUser modifiedUser = repository.findByUsername(requestBody.getOriginalUsername());
            if (isEqualOrBelow(authentication, modifiedUser))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        return updateAccountInternal(requestBody);
    }

    @PatchMapping("accounts/update/admin")
    public ResponseEntity<?> updateAccountAdmin(@RequestBody AccountUpdateAdminRequestBody requestBody, Authentication authentication) {
        validateRequest(requestBody);
        if (authentication.getName().equals(requestBody.getOriginalUsername())) {
            return updateAccountAdminInternal(requestBody, false);
        } else {
            return updateAccountAdminInternal(requestBody, true);
        }
    }

    @DeleteMapping("accounts/{username}/delete")
    public ResponseEntity<?> deleteUser(@PathVariable String username, Authentication authentication) {
        if (authentication.getName().equals(username))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        RegisteredUser user = repository.findByUsername(username);
        if (user != null) {
            if (isEqualOrBelow(authentication, user))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            repository.delete(user);
        }
        return ResponseEntity.noContent().build();
    }

    private boolean isEqualOrBelow(Authentication authentication, RegisteredUser user) {
        if (Utils.isRoot(authentication))
            return false;
        else if (!Utils.isAdmin(authentication))
            return true;
        return Utils.isAdmin(user);
    }

    private ResponseEntity<?> updateAccountInternal(AccountUpdateRequestBody requestBody) {
        if (requestBody.getOriginalUsername().equals(requestBody.getNewUsername())) {
            if (requestBody.getNewPassword() == null)
                return ResponseEntity.noContent().build();
            RegisteredUser user = repository.findByUsername(requestBody.getOriginalUsername());
            user.setPassword(requestBody.getNewPassword());
            repository.saveAndFlush(user);
        } else {
            RegisteredUser possibleUser = repository.findByUsername(requestBody.getNewUsername());
            if (possibleUser != null)
                throw new ResponseStatusException(HttpStatus.CONFLICT, "There already is a user with that username.");
            RegisteredUser user = repository.findByUsername(requestBody.getOriginalUsername());
            user.setUsername(requestBody.getNewUsername());
            if (requestBody.getNewPassword() != null)
                user.setPassword(requestBody.getNewPassword());
            repository.saveAndFlush(user);
        }
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<?> updateAccountAdminInternal(AccountUpdateAdminRequestBody requestBody, boolean other) {
        if (requestBody.getOriginalUsername().equals(requestBody.getNewUsername())) {
            RegisteredUser user = repository.findByUsername(requestBody.getOriginalUsername());
            if (requestBody.getNewPassword() != null)
                user.setPassword(requestBody.getNewPassword());
            if (other)
                user.setAdmin(requestBody.isAdmin());
            repository.saveAndFlush(user);
        } else {
            RegisteredUser possibleUser = repository.findByUsername(requestBody.getNewUsername());
            if (possibleUser != null)
                throw new ResponseStatusException(HttpStatus.CONFLICT, "There already is a user with that username.");
            RegisteredUser user = repository.findByUsername(requestBody.getOriginalUsername());
            if (other)
                user.setAdmin(requestBody.isAdmin());
            user.setUsername(requestBody.getNewUsername());
            if (requestBody.getNewPassword() != null)
                user.setPassword(requestBody.getNewPassword());
            repository.saveAndFlush(user);
        }
        return ResponseEntity.noContent().build();
    }

    private void validateRequest(AccountUpdateRequestBody requestBody) {
        requestBody.validate();
        if (repository.findByUsername(requestBody.getOriginalUsername()) == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
}
