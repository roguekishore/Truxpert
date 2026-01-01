package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "application_id")
    @JsonIgnoreProperties({"review"}) // Only ignore the back-reference to avoid circular reference
    private Application application;

    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    @JsonIgnoreProperties({"password", "reviews"}) // Exclude sensitive data and avoid circular reference
    private User reviewer;

    private LocalDateTime reviewDate;
    
    @Enumerated(EnumType.STRING)
    private ReviewStatus reviewStatus;

    public enum ReviewStatus {
        APPROVED, REJECTED, IN_PROGRESS
    }

    // No-args constructor
    public Review() {
    }

    // All-args constructor
    public Review(Long id, Application application, User reviewer, LocalDateTime reviewDate, ReviewStatus reviewStatus) {
        this.id = id;
        this.application = application;
        this.reviewer = reviewer;
        this.reviewDate = reviewDate;
        this.reviewStatus = reviewStatus;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public User getReviewer() {
        return reviewer;
    }

    public void setReviewer(User reviewer) {
        this.reviewer = reviewer;
    }

    public LocalDateTime getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(LocalDateTime reviewDate) {
        this.reviewDate = reviewDate;
    }

    public ReviewStatus getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(ReviewStatus reviewStatus) {
        this.reviewStatus = reviewStatus;
    }
}
