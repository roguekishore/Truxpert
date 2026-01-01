package com.examly.springapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Seed Controller for running the comprehensive data seeder
 * Endpoints:
 *   POST /api/seed/run   - Run seeder (safe, won't duplicate if already run)
 *   POST /api/seed/force - Force re-run seeder (may create duplicates)
 * 
 * Requires password in request body: { "password": "your-seed-password" }
 */
@RestController
@RequestMapping("/api/seed")
public class SeedController {

    @Autowired
    private DataSeeder dataSeeder;
    
    @Value("${app.seed.password}")
    private String seedPassword;

    @PostMapping("/run")
    public ResponseEntity<Map<String, Object>> runDataSeeder(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        // Validate password
        String providedPassword = request.get("password");
        if (providedPassword == null || !providedPassword.equals(seedPassword)) {
            response.put("success", false);
            response.put("message", "Invalid password. Access denied.");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            boolean seeded = dataSeeder.seedData();
            if (seeded) {
                response.put("success", true);
                response.put("message", "DataSeeder completed successfully! All demo data has been seeded including vendors, brands, food trucks, applications, reviews, inspections, and menu items.");
            } else {
                response.put("success", false);
                response.put("message", "Data was already seeded in this session. Use Force Seed to re-seed.");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error running DataSeeder: " + e.getMessage());
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/force")
    public ResponseEntity<Map<String, Object>> forceRunDataSeeder(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        // Validate password
        String providedPassword = request.get("password");
        if (providedPassword == null || !providedPassword.equals(seedPassword)) {
            response.put("success", false);
            response.put("message", "Invalid password. Access denied.");
            return ResponseEntity.status(401).body(response);
        }
        
        try {
            dataSeeder.forceSeedData();
            response.put("success", true);
            response.put("message", "DataSeeder force-run completed! All demo data has been seeded (may create duplicates if run multiple times).");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error running DataSeeder: " + e.getMessage());
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(response);
    }
}
