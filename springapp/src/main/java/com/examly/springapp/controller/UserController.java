package com.examly.springapp.controller;

import com.examly.springapp.model.User;
import com.examly.springapp.service.UserService;
import com.examly.springapp.exception.DuplicateUserEmailException;
import com.examly.springapp.exception.UserNotFoundException;
import com.examly.springapp.exception.InvalidUserPasswordException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    // Protected demo account emails that cannot be edited
    private static final java.util.Set<String> PROTECTED_EMAILS = java.util.Set.of(
        // System Users
        "superadmin@gmail.com",
        "admin1@gmail.com",
        "admin2@gmail.com",
        "inspector1@gmail.com",
        "inspector2@gmail.com",
        "inspector3@gmail.com",
        "reviewer1@gmail.com",
        "reviewer2@gmail.com",
        "reviewer3@gmail.com"
    );

    private boolean isProtectedEmail(String email) {
        return email != null && PROTECTED_EMAILS.contains(email.toLowerCase());
    }

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.register(user);
            return ResponseEntity.ok(registeredUser);
        } catch (DuplicateUserEmailException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            String role = credentials.get("role");

            User authenticatedUser = userService.login(email, password, role);
            return ResponseEntity.ok(authenticatedUser);
        } catch (UserNotFoundException | InvalidUserPasswordException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping
    public List<User> getAll() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User create(@RequestBody User user) {
        return userService.save(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            // Check if user exists and is protected
            User existingUser = userService.findById(id)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            
            // Prevent editing protected demo accounts
            if (isProtectedEmail(existingUser.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "This is a protected demo account and cannot be edited"));
            }
            
            User updated = userService.updateProfile(id, updatedUser);
            return ResponseEntity.ok(updated);
        } catch (DuplicateUserEmailException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to update user profile"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (userService.findById(id).isPresent()) {
            userService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    //used
    //get users by role(reviewer || admin || inspector)
    //called from adminapp - get no of reviewers for dashboard
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            List<User> users = userService.findByRole(userRole);
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    
}
