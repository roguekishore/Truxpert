package com.examly.springapp.service;

import com.examly.springapp.model.Application;
import com.examly.springapp.model.Review;
import com.examly.springapp.repository.ApplicationRepository;
import com.examly.springapp.repository.ReviewRepository;
import com.examly.springapp.repository.FoodTruckRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private FoodTruckRepository foodTruckRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> findAll() {
        return reviewRepository.findAll();
    }

    public Optional<Review> findById(Long id) {
        return reviewRepository.findById(id);
    }

    public Review save(Review review) {
        return reviewRepository.save(review);
    }

    public void delete(Long id) {
        reviewRepository.deleteById(id);
    }

    // // New methods for enum-based queries
    // public List<Review> findByReviewStatus(Review.ReviewStatus reviewStatus) {
    //     return reviewRepository.findByReviewStatus(reviewStatus);
    // }

    // public List<Review> findByReviewerId(Long reviewerId) {
    //     return reviewRepository.findByReviewerId(reviewerId);
    // }

    // New paginated methods
    public Page<Review> findByReviewerIdPaginated(Long reviewerId, int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return reviewRepository.findByReviewerId(pageable, reviewerId);
    }

    public Page<Review> findByReviewerIdAndStatusPaginated(Long reviewerId, Review.ReviewStatus status, int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return reviewRepository.findByReviewerIdAndReviewStatus(pageable, reviewerId, status);
    }

    public Page<Review> findPendingReviewsByReviewer(Long reviewerId, int page, int size, String sortBy, String sortDirection) {
        return findByReviewerIdAndStatusPaginated(reviewerId, Review.ReviewStatus.IN_PROGRESS, page, size, sortBy, sortDirection);
    }

    // Get review statistics for a reviewer
    public ReviewStats getReviewerStats(Long reviewerId) {
        long totalReviews = reviewRepository.countByReviewerId(reviewerId);
        long pendingReviews = reviewRepository.countByReviewerIdAndReviewStatus(reviewerId, Review.ReviewStatus.IN_PROGRESS);
        long approvedReviews = reviewRepository.countByReviewerIdAndReviewStatus(reviewerId, Review.ReviewStatus.APPROVED);
        long rejectedReviews = reviewRepository.countByReviewerIdAndReviewStatus(reviewerId, Review.ReviewStatus.REJECTED);
        
        return new ReviewStats(totalReviews, pendingReviews, approvedReviews, rejectedReviews);
    }

    @Transactional
    public Review updateReviewStatus(Long reviewId, Review.ReviewStatus newStatus) {
        // Find the review
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        
        // Update review status and date
        review.setReviewStatus(newStatus);
        review.setReviewDate(LocalDateTime.now());
        
        // Update the linked application status based on review status
        Application application = review.getApplication();
        if (application != null) {
            switch (newStatus) {
                case APPROVED:
                    application.setStatus(Application.ApplicationStatus.APPROVED);
                    break;
                case REJECTED:
                    application.setStatus(Application.ApplicationStatus.REJECTED);
                    break;
                case IN_PROGRESS:
                    application.setStatus(Application.ApplicationStatus.IN_REVIEW);
                    break;
            }
            
            // Also update the FoodTruck application status to keep them synchronized
            if (application.getFoodTruck() != null) {
                application.getFoodTruck().setApplicationStatus(application.getStatus());
                foodTruckRepository.save(application.getFoodTruck());
            }
            
            applicationRepository.save(application);
        }
        
        // Save and return the updated review
        return reviewRepository.save(review);
    }

    // Inner class for review statistics
    public static class ReviewStats {
        private long totalReviews;
        private long pendingReviews;
        private long approvedReviews;
        private long rejectedReviews;

        public ReviewStats(long totalReviews, long pendingReviews, long approvedReviews, long rejectedReviews) {
            this.totalReviews = totalReviews;
            this.pendingReviews = pendingReviews;
            this.approvedReviews = approvedReviews;
            this.rejectedReviews = rejectedReviews;
        }

        // Getters
        public long getTotalReviews() { return totalReviews; }
        public long getPendingReviews() { return pendingReviews; }
        public long getApprovedReviews() { return approvedReviews; }
        public long getRejectedReviews() { return rejectedReviews; }
        
        public double getApprovalRate() {
            if (totalReviews == 0) return 0.0;
            return (double) approvedReviews / (approvedReviews + rejectedReviews) * 100;
        }
    }
}
