package com.astelon.octopusmanager.advices;

import com.astelon.octopusmanager.exceptions.EmptyPathException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.nio.file.InvalidPathException;

@RestControllerAdvice
public class InvalidPathAdvice {

    @ExceptionHandler({ InvalidPathException.class, EmptyPathException.class })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleInvalidPath(IllegalArgumentException e) {
        return e.getMessage();
    }
}
