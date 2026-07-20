package com.placehub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class BlacklistedUserException extends RuntimeException {
    public BlacklistedUserException(String message) {
        super(message);
    }
}
