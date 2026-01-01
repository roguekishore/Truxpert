package com.examly.springapp.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "food_trucks")
public class FoodTruck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER) // Change to EAGER to ensure brand is loaded
    @JoinColumn(name = "brand_id", nullable = false)
    @ToString.Exclude
    @JsonBackReference
    private Brand brand;

    @Column(nullable = false)
    private String operatingRegion;

    private String location;
    private String cuisineSpecialties;
    private String menuHighlights;

    // Add application status field
    @Enumerated(EnumType.STRING)
    @Column(name = "application_status")
    private Application.ApplicationStatus applicationStatus = Application.ApplicationStatus.SUBMITTED;

    @OneToMany(mappedBy = "foodTruck", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"foodTruck"}) // Prevent circular reference
    private List<Application> applications;

    @OneToMany(mappedBy = "foodTruck" , cascade = CascadeType.ALL , orphanRemoval = true)
    private List<MenuItem> menuItems;

    // Add these custom getters for JSON serialization
    @JsonGetter("brandName")
    public String getBrandName() {
        return brand != null ? brand.getBrandName() : null;
    }

    @JsonGetter("brandId")
    public Long getBrandId() {
        return brand != null ? brand.getId() : null;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FoodTruck() {
    }

    public Brand getBrand() {
        return brand;
    }

    public void setBrand(Brand brand) {
        this.brand = brand;
    }

    public String getOperatingRegion() {
        return operatingRegion;
    }

    public void setOperatingRegion(String operatingRegion) {
        this.operatingRegion = operatingRegion;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCuisineSpecialties() {
        return cuisineSpecialties;
    }

    public void setCuisineSpecialties(String cuisineSpecialties) {
        this.cuisineSpecialties = cuisineSpecialties;
    }

    public String getMenuHighlights() {
        return menuHighlights;
    }

    public void setMenuHighlights(String menuHighlights) {
        this.menuHighlights = menuHighlights;
    }

    public List<MenuItem> getMenuItems() {
        return menuItems;
    }

    public void setMenuItems(List<MenuItem> menuItems) {
        this.menuItems = menuItems;
    }

    public Application.ApplicationStatus getApplicationStatus() {
        return applicationStatus;
    }

    public void setApplicationStatus(Application.ApplicationStatus applicationStatus) {
        this.applicationStatus = applicationStatus;
    }

    public FoodTruck(Long id, Brand brand, String operatingRegion, String location,
            String cuisineSpecialties, String menuHighlights, List<MenuItem> menuItems) {
        this.id = id;
        this.brand = brand;
        this.operatingRegion = operatingRegion;
        this.location = location;
        this.cuisineSpecialties = cuisineSpecialties;
        this.menuHighlights = menuHighlights;
        this.menuItems = menuItems;
    }
}
