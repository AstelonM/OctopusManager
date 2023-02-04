package com.astelon.octopusmanager.advices;

import com.astelon.octopusmanager.exceptions.ServerNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ServerNotFoundAdvice {

    @ExceptionHandler(ServerNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String serverNotFoundHandler(ServerNotFoundException e) {
        return e.getMessage();
    }
}
