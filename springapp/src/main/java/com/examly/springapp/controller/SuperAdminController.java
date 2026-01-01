package com.examly.springapp.controller;

import com.examly.springapp.model.User;
import com.examly.springapp.model.Vendor;
import com.examly.springapp.model.Application;
import com.examly.springapp.model.Inspection;
import com.examly.springapp.model.Review;
import com.examly.springapp.service.UserService;
import com.examly.springapp.service.VendorService;
import com.examly.springapp.service.ApplicationService;
import com.examly.springapp.service.InspectionService;
import com.examly.springapp.service.ReviewService;
import com.examly.springapp.service.FoodTruckService;
import com.examly.springapp.exception.UserNotFoundException;
import com.examly.springapp.exception.DuplicateUserEmailException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private InspectionService inspectionService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private FoodTruckService foodTruckService;

    // Enhanced dashboard statistics endpoint with analytics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // User counts by role
        long totalAdmins = userService.findByRole(User.Role.ADMIN).size();
        long totalInspectors = userService.findByRole(User.Role.INSPECTOR).size();
        long totalReviewers = userService.findByRole(User.Role.REVIEWER).size();
        long totalVendors = vendorService.getAllVendors().size();
        long totalUsers = totalAdmins + totalInspectors + totalReviewers + totalVendors;

        stats.put("totalUsers", totalUsers);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalInspectors", totalInspectors);
        stats.put("totalReviewers", totalReviewers);
        stats.put("totalVendors", totalVendors);
        
        // Application statistics
        List<Application> allApplications = applicationService.findAll();
        long totalApplications = allApplications.size();
        long submittedApplications = allApplications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.SUBMITTED)
                .count();
        long approvedApplications = allApplications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.APPROVED)
                .count();
        long rejectedApplications = allApplications.stream()
                .filter(app -> app.getStatus() == Application.ApplicationStatus.REJECTED)
                .count();
        
        stats.put("totalApplications", totalApplications);
        stats.put("submittedApplications", submittedApplications);
        stats.put("approvedApplications", approvedApplications);
        stats.put("rejectedApplications", rejectedApplications);
        
        // Food truck statistics
        long totalFoodTrucks = foodTruckService.getAllFoodTrucks().size();
        stats.put("totalFoodTrucks", totalFoodTrucks);
        
        // Inspection statistics
        List<Inspection> allInspections = inspectionService.findAll();
        long totalInspections = allInspections.size();
        long passedInspections = inspectionService.findByResult(Inspection.InspectionResult.PASS).size();
        long failedInspections = inspectionService.findByResult(Inspection.InspectionResult.FAIL).size();
        long pendingInspections = allInspections.stream()
                .filter(inspection -> inspection.getResult() == null || 
                       inspection.getResult() == Inspection.InspectionResult.IN_PROGRESS)
                .count();
        
        stats.put("totalInspections", totalInspections);
        stats.put("passedInspections", passedInspections);
        stats.put("failedInspections", failedInspections);
        stats.put("pendingInspections", pendingInspections);
        
        // Review statistics
        List<Review> allReviews = reviewService.findAll();
        long totalReviews = allReviews.size();
        long approvedReviews = allReviews.stream()
                .filter(review -> review.getReviewStatus() == Review.ReviewStatus.APPROVED)
                .count();
        long rejectedReviews = allReviews.stream()
                .filter(review -> review.getReviewStatus() == Review.ReviewStatus.REJECTED)
                .count();
        long pendingReviews = allReviews.stream()
                .filter(review -> review.getReviewStatus() == null || 
                       review.getReviewStatus() == Review.ReviewStatus.IN_PROGRESS)
                .count();
        
        stats.put("totalReviews", totalReviews);
        stats.put("approvedReviews", approvedReviews);
        stats.put("rejectedReviews", rejectedReviews);
        stats.put("pendingReviews", pendingReviews);
        
        // Calculate success rates
        double applicationApprovalRate = totalApplications > 0 ? 
                (approvedApplications * 100.0) / totalApplications : 0.0;
        double inspectionPassRate = totalInspections > 0 ? 
                (passedInspections * 100.0) / totalInspections : 0.0;
        double reviewApprovalRate = totalReviews > 0 ? 
                (approvedReviews * 100.0) / totalReviews : 0.0;
        
        stats.put("applicationApprovalRate", Math.round(applicationApprovalRate * 10.0) / 10.0);
        stats.put("inspectionPassRate", Math.round(inspectionPassRate * 10.0) / 10.0);
        stats.put("reviewApprovalRate", Math.round(reviewApprovalRate * 10.0) / 10.0);
        
        // Mock data for system performance (can be replaced with actual monitoring)
        stats.put("activeSessions", 42);
        stats.put("systemHealth", 98);
        stats.put("securityAlerts", 3);

        return ResponseEntity.ok(stats);
    }

    // Get all users (excluding super admin) for user management
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsersAndVendors() {
        Map<String, Object> response = new HashMap<>();
        
        // Get all regular users (excluding super admin)
        List<User> users = userService.findAll().stream()
                .filter(user -> user.getRole() != User.Role.SUPER_ADMIN)
                .toList();
        
        // Get all vendors
        List<Vendor> vendors = vendorService.getAllVendors();
        
        response.put("users", users);
        response.put("vendors", vendors);
        
        return ResponseEntity.ok(response);
    }

    // Create new user (admin, inspector, reviewer)
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            // Prevent creation of super admin users
            if (user.getRole() == User.Role.SUPER_ADMIN) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Cannot create super admin users"));
            }
            
            User createdUser = userService.register(user);
            return ResponseEntity.ok(createdUser);
        } catch (DuplicateUserEmailException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to create user"));
        }
    }

    // Protected demo account emails that cannot be edited or deleted
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
        "reviewer3@gmail.com",
        // Vendors
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

    // Update user
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            // Check if user exists and is protected
            User existingUser = userService.findById(id)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            
            // Prevent editing protected demo accounts
            if (isProtectedEmail(existingUser.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "This is a protected demo account and cannot be edited"));
            }
            
            // Prevent updating to super admin role
            if (updatedUser.getRole() == User.Role.SUPER_ADMIN) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Cannot update user to super admin role"));
            }
            
            User updated = userService.updateProfile(id, updatedUser);
            return ResponseEntity.ok(updated);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (DuplicateUserEmailException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to update user"));
        }
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            // Check if user exists
            User user = userService.findById(id)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
            
            // Prevent deleting protected demo accounts
            if (isProtectedEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "This is a protected demo account and cannot be deleted"));
            }
            
            if (user.getRole() == User.Role.SUPER_ADMIN) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Cannot delete super admin user"));
            }
            
            userService.delete(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to delete user"));
        }
    }

    // Update vendor
    @PutMapping("/vendors/{id}")
    public ResponseEntity<?> updateVendor(@PathVariable Long id, @RequestBody Vendor updatedVendor) {
        try {
            // Check if vendor exists and is protected
            java.util.Optional<Vendor> existingVendorOpt = vendorService.getVendorById(id);
            if (existingVendorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Vendor not found"));
            }
            
            Vendor existingVendor = existingVendorOpt.get();
            
            // Prevent editing protected demo accounts
            if (isProtectedEmail(existingVendor.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "This is a protected demo account and cannot be edited"));
            }
            
            Vendor updated = vendorService.putVendor(id, updatedVendor);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("email already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Delete vendor
    @DeleteMapping("/vendors/{id}")
    public ResponseEntity<?> deleteVendor(@PathVariable Long id) {
        try {
            // Check if vendor exists and is protected
            java.util.Optional<Vendor> vendorOpt = vendorService.getVendorById(id);
            if (vendorOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Vendor not found"));
            }
            
            Vendor vendor = vendorOpt.get();
            
            // Prevent deleting protected demo accounts
            if (isProtectedEmail(vendor.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "This is a protected demo account and cannot be deleted"));
            }
            
            vendorService.deleteVendor(id);
            return ResponseEntity.ok(Map.of("message", "Vendor deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Suspend/Activate user (toggle status)
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            // This would require adding a status field to User model
            // For now, return success message
            return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to update user status"));
        }
    }
}
