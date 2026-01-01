package com.examly.springapp.controller;

import com.examly.springapp.model.Application;
import com.examly.springapp.model.Review;
import com.examly.springapp.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<Review> getAll() {
        return reviewService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getById(@PathVariable Long id) {
        return reviewService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //used
    //get all reviews for a reviewer based on approved or rejected(not pending)
    //from reviewer app
    @GetMapping("/reviewer/{reviewerId}/paginated")
    public ResponseEntity<Page<Review>> getReviewsByReviewerPaginated(
            @PathVariable Long reviewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "reviewDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) String status) { //approved or rejected
        
        Page<Review> reviews;
        
        if (status != null && !status.isEmpty()) {
            try {
                Review.ReviewStatus reviewStatus = Review.ReviewStatus.valueOf(status.toUpperCase());
                reviews = reviewService.findByReviewerIdAndStatusPaginated(reviewerId, reviewStatus, page, size, sortBy, sortDirection);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            reviews = reviewService.findByReviewerIdPaginated(reviewerId, page, size, sortBy, sortDirection);
        }
        
        return ResponseEntity.ok(reviews);
    }

    
    //used
    //get reviewer statistics
    //from reviewerapp
    @GetMapping("/reviewer/{reviewerId}/stats")
    public ResponseEntity<ReviewService.ReviewStats> getReviewerStats(@PathVariable Long reviewerId) {
        ReviewService.ReviewStats stats = reviewService.getReviewerStats(reviewerId);
        return ResponseEntity.ok(stats);
    }

    //used
    //get pending reviews for reviewer
    //called from reviewerapp
    @GetMapping("/reviewer/{reviewerId}/pending")
    public ResponseEntity<Page<Review>> getPendingReviewsByReviewer(
            @PathVariable Long reviewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "reviewDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Page<Review> reviews = reviewService.findPendingReviewsByReviewer(reviewerId, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(reviews);
    }
    
    //used
    //to update the review status
    //from reviewer app
    @PutMapping("/{reviewId}/status/{status}")
    @Transactional
    public ResponseEntity<?> updateReviewStatus(@PathVariable Long reviewId, @PathVariable String status) {
        try {
            Review.ReviewStatus reviewStatus = Review.ReviewStatus.valueOf(status.toUpperCase());
            Review updatedReview = reviewService.updateReviewStatus(reviewId, reviewStatus);

            return ResponseEntity.ok(updatedReview);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status. Use APPROVED, REJECTED, or IN_PROGRESS"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
