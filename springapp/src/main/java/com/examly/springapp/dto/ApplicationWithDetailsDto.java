package com.examly.springapp.dto;

import com.examly.springapp.model.Application;
import java.time.LocalDateTime;

public class ApplicationWithDetailsDto {
    private Long id;
    private LocalDateTime submissionDate;
    private Application.ApplicationStatus status;
    private Long foodTruckId;
    private String foodTruckLocation;
    private String operatingRegion;
    private String cuisineSpecialties;
    private String brandName;
    private String vendorName;
    private String vendorEmail;
    private Long reviewId;
    private String reviewerName;

    public ApplicationWithDetailsDto() {}

    public ApplicationWithDetailsDto(Long id, LocalDateTime submissionDate, Application.ApplicationStatus status,
                                   Long foodTruckId, String foodTruckLocation, String operatingRegion,
                                   String cuisineSpecialties, String brandName, String vendorName, String vendorEmail,
                                   Long reviewId, String reviewerName) {
        this.id = id;
        this.submissionDate = submissionDate;
        this.status = status;
        this.foodTruckId = foodTruckId;
        this.foodTruckLocation = foodTruckLocation;
        this.operatingRegion = operatingRegion;
        this.cuisineSpecialties = cuisineSpecialties;
        this.brandName = brandName;
        this.vendorName = vendorName;
        this.vendorEmail = vendorEmail;
        this.reviewId = reviewId;
        this.reviewerName = reviewerName;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

    public Application.ApplicationStatus getStatus() { return status; }
    public void setStatus(Application.ApplicationStatus status) { this.status = status; }

    public Long getFoodTruckId() { return foodTruckId; }
    public void setFoodTruckId(Long foodTruckId) { this.foodTruckId = foodTruckId; }

    public String getFoodTruckLocation() { return foodTruckLocation; }
    public void setFoodTruckLocation(String foodTruckLocation) { this.foodTruckLocation = foodTruckLocation; }

    public String getOperatingRegion() { return operatingRegion; }
    public void setOperatingRegion(String operatingRegion) { this.operatingRegion = operatingRegion; }

    public String getCuisineSpecialties() { return cuisineSpecialties; }
    public void setCuisineSpecialties(String cuisineSpecialties) { this.cuisineSpecialties = cuisineSpecialties; }

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorEmail() { return vendorEmail; }
    public void setVendorEmail(String vendorEmail) { this.vendorEmail = vendorEmail; }

    public Long getReviewId() { return reviewId; }
    public void setReviewId(Long reviewId) { this.reviewId = reviewId; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }
}