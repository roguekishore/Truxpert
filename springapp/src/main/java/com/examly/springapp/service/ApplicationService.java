package com.examly.springapp.service;

import com.examly.springapp.model.Application;
import com.examly.springapp.model.FoodTruck;
import com.examly.springapp.model.Review;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.ApplicationRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.repository.ReviewRepository;
import com.examly.springapp.repository.FoodTruckRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ApplicationService {
    
    private final ApplicationRepository applicationRepository;
    private final FoodTruckRepository foodTruckRepository; // Add this
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;

    public ApplicationService(ApplicationRepository applicationRepository, 
                            FoodTruckRepository foodTruckRepository) {
        this.applicationRepository = applicationRepository;
        this.foodTruckRepository = foodTruckRepository;
    }

    public List<Application> findAll() {
        return applicationRepository.findAll();
    }

    // New method for paginated and sorted applications
    public Page<Application> findAllPaginated(int page, int size, String sortBy, String sortDirection, Application.ApplicationStatus status) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        if (status != null) {
            return applicationRepository.findByStatus(status, pageable);
        } else {
            return applicationRepository.findAll(pageable);
        }
    }

    // New method to find applications without reviewers
    public Page<Application> findApplicationsWithoutReviewer(int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return applicationRepository.findByReviewIsNull(pageable);
    }

    public Optional<Application> findById(Long id) {
        return applicationRepository.findById(id);
    }

    @Transactional
    public Application save(Application application) {
        Application savedApplication = applicationRepository.save(application);
        
        // Synchronize status with FoodTruck
        if (savedApplication.getFoodTruck() != null) {
            FoodTruck foodTruck = savedApplication.getFoodTruck();
            foodTruck.setApplicationStatus(savedApplication.getStatus());
            foodTruckRepository.save(foodTruck);
        }
        
        return savedApplication;
    }

    public void delete(Long id) {
        applicationRepository.deleteById(id);
    }

    @Transactional
    public Application assignReviewer(Long applicationId, Long reviewerId) {
        // Fetch the application
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
        
        // Fetch the reviewer
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + reviewerId));
        
        // Validate that the user is a reviewer
        if (!reviewer.getRole().equals(User.Role.REVIEWER)) {
            throw new IllegalArgumentException("User with id " + reviewerId + " is not a reviewer");
        }
        
        // Check if application already has a review
        if (application.getReview() != null) {
            throw new IllegalArgumentException("Application already has a review assigned");
        }
        
        // Create new review entity
        Review review = new Review();
        review.setApplication(application);
        review.setReviewer(reviewer);
        review.setReviewDate(LocalDateTime.now()); // or setAssignedDate if you rename it
        review.setReviewStatus(Review.ReviewStatus.IN_PROGRESS); // Use enum instead of boolean
        
        // Save the review
        Review savedReview = reviewRepository.save(review);
        
        // Update application with review
        application.setReview(savedReview);
        application.setStatus(Application.ApplicationStatus.IN_REVIEW);
        
        // Save and return the updated application
        return applicationRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<FoodTruck> getFoodTrucksByApplicationStatus(Application.ApplicationStatus status) {
        return applicationRepository.getApplicationsByStatus(status)
                .stream()
                .map(Application::getFoodTruck)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<com.examly.springapp.dto.FoodTruckWithOwnerDto> getFoodTrucksByApplicationStatusWithOwner(Application.ApplicationStatus status) {
        return applicationRepository.getApplicationsByStatus(status)
                .stream()
                .map(Application::getFoodTruck)
                .distinct()
                .map(truck -> new com.examly.springapp.dto.FoodTruckWithOwnerDto(
                        truck.getId(),
                        truck.getBrand() != null ? truck.getBrand().getBrandName() : null,
                        truck.getBrand() != null && truck.getBrand().getVendor() != null ? truck.getBrand().getVendor().getName() : null,
                        truck.getBrand() != null && truck.getBrand().getVendor() != null ? truck.getBrand().getVendor().getEmail() : null,
                        truck.getOperatingRegion(),
                        truck.getLocation(),
                        truck.getCuisineSpecialties(),
                        truck.getMenuHighlights()
                ))
                .collect(Collectors.toList());
    }

    // New method to get all reviewers
    public List<User> getAllReviewers() {
        return userRepository.findByRole(User.Role.REVIEWER);
    }

    @Transactional(readOnly = true)
    public Page<Application> findAllPaginated(Pageable pageable) {
        return applicationRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Application> findByStatusPaginated(Application.ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<com.examly.springapp.dto.ApplicationWithDetailsDto> findAllApplicationsWithDetails(Pageable pageable) {
        Page<Application> applications = applicationRepository.findAll(pageable);
        return applications.map(this::convertToApplicationWithDetailsDto);
    }

    @Transactional(readOnly = true)
    public Page<com.examly.springapp.dto.ApplicationWithDetailsDto> findApplicationsWithDetailsByStatus(
            Application.ApplicationStatus status, Pageable pageable) {
        Page<Application> applications = applicationRepository.findByStatus(status, pageable);
        return applications.map(this::convertToApplicationWithDetailsDto);
    }

    private com.examly.springapp.dto.ApplicationWithDetailsDto convertToApplicationWithDetailsDto(Application app) {
        return new com.examly.springapp.dto.ApplicationWithDetailsDto(
            app.getId(),
            app.getSubmissionDate(),
            app.getStatus(),
            app.getFoodTruck() != null ? app.getFoodTruck().getId() : null,
            app.getFoodTruck() != null ? app.getFoodTruck().getLocation() : null,
            app.getFoodTruck() != null ? app.getFoodTruck().getOperatingRegion() : null,
            app.getFoodTruck() != null ? app.getFoodTruck().getCuisineSpecialties() : null,
            app.getFoodTruck() != null && app.getFoodTruck().getBrand() != null ? 
                app.getFoodTruck().getBrand().getBrandName() : null,
            app.getFoodTruck() != null && app.getFoodTruck().getBrand() != null && 
                app.getFoodTruck().getBrand().getVendor() != null ? 
                app.getFoodTruck().getBrand().getVendor().getName() : null,
            app.getFoodTruck() != null && app.getFoodTruck().getBrand() != null && 
                app.getFoodTruck().getBrand().getVendor() != null ? 
                app.getFoodTruck().getBrand().getVendor().getEmail() : null,
            app.getReview() != null ? app.getReview().getId() : null,
            app.getReview() != null && app.getReview().getReviewer() != null ? 
                app.getReview().getReviewer().getName() : null
        );
    }

    @Transactional
    public Application updateApplicationStatus(Long applicationId, Application.ApplicationStatus newStatus) {
        Optional<Application> applicationOpt = applicationRepository.findById(applicationId);
        if (applicationOpt.isEmpty()) {
            throw new RuntimeException("Application not found");
        }
        
        Application application = applicationOpt.get();
        application.setStatus(newStatus);
        
        // Save and synchronize
        return save(application);
    }
}
