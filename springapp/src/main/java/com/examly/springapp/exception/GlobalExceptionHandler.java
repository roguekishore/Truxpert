package com.examly.springapp.exception;

import com.examly.springapp.exception.DuplicateUserEmailException;
import com.examly.springapp.exception.UserNotFoundException;
import com.examly.springapp.exception.InvalidUserPasswordException;
    
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidOperatingRegionException.class)
    public ResponseEntity<String> handleInvalidOperatingRegionException(InvalidOperatingRegionException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DuplicateVendorNameException.class)
    public ResponseEntity<String> handleDuplicateVendorNameException(DuplicateVendorNameException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleNotFoundException(RuntimeException ex) {
        return new ResponseEntity<String>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateUserEmailException.class)
    public ResponseEntity<String> handleDuplicateUserEmailException(DuplicateUserEmailException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidUserPasswordException.class)
    public ResponseEntity<String> handleInvalidUserPasswordException(InvalidUserPasswordException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }
}