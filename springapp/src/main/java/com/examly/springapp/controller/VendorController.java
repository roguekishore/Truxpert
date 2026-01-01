package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.model.Vendor;
import com.examly.springapp.service.VendorService;

import lombok.Data;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/api/vendors")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    // Protected demo vendor emails that cannot be edited
    private static final java.util.Set<String> PROTECTED_EMAILS = java.util.Set.of(
        "vendor@gmail.com",
        "maria.kitchen@gmail.com",
        "chen.flavors@gmail.com",
        "rodriguez.foods@gmail.com",
        "gourmet.group@gmail.com",
        "street.eats@gmail.com",
        "urban.bites@gmail.com"
    );

    private boolean isProtectedEmail(String email) {
        return email != null && PROTECTED_EMAILS.contains(email.toLowerCase());
    }

    @PostMapping("/register")
    public ResponseEntity<Vendor> createVendor(@RequestBody Vendor vendor) {
        Vendor savedVendor = vendorService.saveVendor(vendor);
        return new ResponseEntity<>(savedVendor, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginVendor(@RequestBody LoginRequest credentials) {
        try {
            Vendor vendor = vendorService.loginVendor(
                    credentials.getEmail(),
                    credentials.getPassword());
            return ResponseEntity.ok(vendor);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @GetMapping("/{id}")
    public Optional<Vendor> getVendorById(@PathVariable Long id) {
        return vendorService.getVendorById(id);
    }

    @GetMapping
    public List<Vendor> getAllVendors() {
        return vendorService.getAllVendors();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllVendors() {
        vendorService.deleteAllVendors();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> putVendor(@PathVariable Long id, @RequestBody Vendor vendor) {
        try {
            // Check if vendor exists and is protected
            Optional<Vendor> existingVendorOpt = vendorService.getVendorById(id);
            if (existingVendorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "Vendor not found"));
            }
            
            // Prevent editing protected demo accounts
            if (isProtectedEmail(existingVendorOpt.get().getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Collections.singletonMap("message", "This is a protected demo account and cannot be edited"));
            }
            
            Vendor updatedVendor = vendorService.putVendor(id, vendor);
            return new ResponseEntity<>(updatedVendor, HttpStatus.OK);
        } catch (RuntimeException e) {
            // Check if it's a duplicate email error
            if (e.getMessage().contains("email already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patchVendor(@PathVariable Long id, @RequestBody Vendor vendor) {
        try {
            Vendor patchedVendor = vendorService.patchVendor(id, vendor);
            return new ResponseEntity<>(patchedVendor, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Vendor>> saveAllVendors(@RequestBody List<Vendor> vendors) {
        List<Vendor> savedVendors = vendorService.saveAllVendors(vendors);
        return new ResponseEntity<>(savedVendors, HttpStatus.CREATED);
    }
}