package com.examly.springapp.controller;

import com.examly.springapp.model.Application;
import com.examly.springapp.model.User;
import com.examly.springapp.model.Review; // Add this import
import com.examly.springapp.repository.UserRepository; // Add this import
import com.examly.springapp.repository.ReviewRepository; // Add this import
import com.examly.springapp.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired; // Add this import
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime; // Add this import
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
@Transactional(readOnly = true)
public class ApplicationController {
    private final ApplicationService applicationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<Application> getAll() {
        return applicationService.findAll();
    }

    // used
    // get applications by status (approved or rejected or submitted or in_review)
    // called from adminapp - to get number in dashboard
    @GetMapping("/by-status")
    public ResponseEntity<Page<Application>> getApplicationsByStatus(
            @RequestParam String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        try {
            Application.ApplicationStatus appStatus = Application.ApplicationStatus.valueOf(status.toUpperCase());

            Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            Page<Application> applications = applicationService.findByStatusPaginated(appStatus, pageable);
            return ResponseEntity.ok(applications);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // used
    // get paginated applications
    // called from adminapp
    @GetMapping("/paginated")
    public ResponseEntity<Page<Application>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submissionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) String status) {
        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            Page<Application> applications;

            if (status != null && !status.isEmpty()) {
                // Filter by status if provided
                Application.ApplicationStatus applicationStatus = Application.ApplicationStatus
                        .valueOf(status.toUpperCase());
                applications = applicationService.findByStatusPaginated(applicationStatus, pageable);
            } else {
                // Get all applications if no status filter
                applications = applicationService.findAllPaginated(pageable);
            }

            return ResponseEntity.ok(applications);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // used
    // to fetch details (application, food truck, review, brand, vendor)
    // called from adminapp - to display to assign reviewers
    @GetMapping("/with-details")
    public ResponseEntity<Page<com.examly.springapp.dto.ApplicationWithDetailsDto>> getApplicationsWithDetails(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submissionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) String status) {

        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            Page<Application> applications;

            if (status != null && !status.isEmpty()) {
                Application.ApplicationStatus applicationStatus = Application.ApplicationStatus
                        .valueOf(status.toUpperCase());
                applications = applicationService.findByStatusPaginated(applicationStatus, pageable);
            } else {
                applications = applicationService.findAllPaginated(pageable);
            }

            Page<com.examly.springapp.dto.ApplicationWithDetailsDto> applicationsWithDetails = applications
                    .map(app -> new com.examly.springapp.dto.ApplicationWithDetailsDto(
                            app.getId(),
                            app.getSubmissionDate(),
                            app.getStatus(),
                            app.getFoodTruck() != null ? app.getFoodTruck().getId() : null,
                            app.getFoodTruck() != null ? app.getFoodTruck().getLocation() : null,
                            app.getFoodTruck() != null ? app.getFoodTruck().getOperatingRegion() : null,
                            app.getFoodTruck() != null ? app.getFoodTruck().getCuisineSpecialties() : null, // Missing
                                                                                                            // parameter
                            app.getFoodTruck() != null && app.getFoodTruck().getBrand() != null
                                    ? app.getFoodTruck().getBrand().getBrandName()
                                    : null,
                            app.getFoodTruck() != null && app.getFoodTruck().getBrand() != null &&
                                    app.getFoodTruck().getBrand().getVendor() != null
                                            ? app.getFoodTruck().getBrand().getVendor().getName()
                                            : null,
                            app.getFoodTruck() != null && app.getFoodTruck().getBrand() != null &&
                                    app.getFoodTruck().getBrand().getVendor() != null
                                            ? app.getFoodTruck().getBrand().getVendor().getEmail()
                                            : null,
                            app.getReview() != null ? app.getReview().getId() : null,
                            app.getReview() != null && app.getReview().getReviewer() != null
                                    ? app.getReview().getReviewer().getName()
                                    : null));

            return ResponseEntity.ok(applicationsWithDetails);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // used
    // to assign reviewer
    // from adminapp
    @PostMapping("/{applicationId}/assign-reviewer/{reviewerId}")
    @Transactional
    public ResponseEntity<?> assignReviewerNew(@PathVariable Long applicationId, @PathVariable Long reviewerId) {
        try {
            // Fetch the application
            Application application = applicationService.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            // Check if application is already APPROVED or REJECTED - prevent reassignment
            if (application.getStatus() == Application.ApplicationStatus.APPROVED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Cannot assign reviewer - application has already been approved"));
            }
            
            if (application.getStatus() == Application.ApplicationStatus.REJECTED) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Cannot assign reviewer - application has already been rejected"));
            }

            // Check if a review already exists and has been completed (APPROVED or REJECTED)
            if (application.getReview() != null) {
                Review existingReview = application.getReview();
                if (existingReview.getReviewStatus() == Review.ReviewStatus.APPROVED || 
                    existingReview.getReviewStatus() == Review.ReviewStatus.REJECTED) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Cannot reassign reviewer - this application has already been reviewed. Status: " + existingReview.getReviewStatus()));
                }
            }

            // Fetch the reviewer
            User reviewer = userRepository.findById(reviewerId)
                    .orElseThrow(() -> new RuntimeException("Reviewer not found"));

            // Validate that the user is a reviewer
            if (!reviewer.getRole().equals(User.Role.REVIEWER)) {
                throw new IllegalArgumentException("User is not a reviewer");
            }

            // Check if application already has an IN_PROGRESS review - can reassign reviewer
            if (application.getReview() != null) {
                // Update existing review (only if still IN_PROGRESS)
                Review existingReview = application.getReview();
                existingReview.setReviewer(reviewer);
                existingReview.setReviewDate(LocalDateTime.now());
                reviewRepository.save(existingReview);
            } else {
                // Create new review
                Review review = new Review();
                review.setApplication(application);
                review.setReviewer(reviewer);
                review.setReviewDate(LocalDateTime.now());
                review.setReviewStatus(Review.ReviewStatus.IN_PROGRESS);

                Review savedReview = reviewRepository.save(review);
                application.setReview(savedReview);
            }

            // Update application status
            application.setStatus(Application.ApplicationStatus.IN_REVIEW);
            Application updatedApplication = applicationService.save(application);

            return ResponseEntity.ok(updatedApplication);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //used
    //to fetch approved foodtrucks to assign inspector
    //called from adminapp - assignInspectors
    @GetMapping("/foodtrucks/status/{status}")
    public ResponseEntity<?> getFoodTrucksByApplicationStatus(@PathVariable String status) {
        try {
            Application.ApplicationStatus applicationStatus = Application.ApplicationStatus
                    .valueOf(status.toUpperCase());
            List<com.examly.springapp.dto.FoodTruckWithOwnerDto> foodTrucks = applicationService
                    .getFoodTrucksByApplicationStatusWithOwner(applicationStatus);
            return ResponseEntity.ok(foodTrucks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status. Use SUBMITTED, IN_REVIEW, APPROVED, or REJECTED"));
        }
    }












    // New endpoint for applications without reviewers
    @GetMapping("/unassigned")
    public ResponseEntity<Page<Application>> getUnassignedApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submittedDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        Page<Application> applications = applicationService.findApplicationsWithoutReviewer(page, size, sortBy,
                sortDirection);
        return ResponseEntity.ok(applications);
    }

    // New endpoint to get all reviewers
    @GetMapping("/reviewers")
    public ResponseEntity<List<User>> getAllReviewers() {
        List<User> reviewers = applicationService.getAllReviewers();
        return ResponseEntity.ok(reviewers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getById(@PathVariable Long id) {
        return applicationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public Application create(@RequestBody Application application) {
        return applicationService.save(application);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Application> update(@PathVariable Long id, @RequestBody Application updatedApplication) {
        return applicationService.findById(id)
                .map(existing -> {
                    updatedApplication.setId(id);
                    return ResponseEntity.ok(applicationService.save(updatedApplication));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (applicationService.findById(id).isPresent()) {
            applicationService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    

    

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Application.ApplicationStatus newStatus = Application.ApplicationStatus.valueOf(status.toUpperCase());

            Application updatedApplication = applicationService.updateApplicationStatus(id, newStatus);

            return ResponseEntity.ok(updatedApplication);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Add these new endpoints

    @GetMapping("/with-details/paginated")
    public ResponseEntity<Page<com.examly.springapp.dto.ApplicationWithDetailsDto>> getApplicationsWithDetailsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submissionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            Page<com.examly.springapp.dto.ApplicationWithDetailsDto> applicationsWithDetails = applicationService
                    .findAllApplicationsWithDetails(pageable);

            return ResponseEntity.ok(applicationsWithDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/with-details/by-status")
    public ResponseEntity<Page<com.examly.springapp.dto.ApplicationWithDetailsDto>> getApplicationsWithDetailsByStatus(
            @RequestParam String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "submissionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        try {
            Application.ApplicationStatus applicationStatus = Application.ApplicationStatus
                    .valueOf(status.toUpperCase());
            Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            Page<com.examly.springapp.dto.ApplicationWithDetailsDto> applicationsWithDetails = applicationService
                    .findApplicationsWithDetailsByStatus(applicationStatus, pageable);

            return ResponseEntity.ok(applicationsWithDetails);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
