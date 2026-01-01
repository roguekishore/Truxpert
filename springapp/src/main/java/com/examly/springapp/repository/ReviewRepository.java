package com.examly.springapp.repository;

import com.examly.springapp.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // List<Review> findByReviewerId(Long reviewerId);
    // List<Review> findByReviewStatus(Review.ReviewStatus reviewStatus);
    
    // Paginated methods
    Page<Review> findByReviewerId(Pageable pageable, Long reviewerId);
    Page<Review> findByReviewerIdAndReviewStatus(Pageable pageable, Long reviewerId, Review.ReviewStatus reviewStatus);
    
    // Count methods for statistics
    long countByReviewerId(Long reviewerId);
    long countByReviewerIdAndReviewStatus(Long reviewerId, Review.ReviewStatus reviewStatus);
}
