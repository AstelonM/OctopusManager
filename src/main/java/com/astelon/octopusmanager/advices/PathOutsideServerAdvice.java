package com.astelon.octopusmanager.advices;

import com.astelon.octopusmanager.exceptions.PathOutsideServerException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class PathOutsideServerAdvice {

    @ExceptionHandler(PathOutsideServerException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handlePathOutsideServerAdvice(PathOutsideServerException e) {
        return e.getMessage();
    }
}
