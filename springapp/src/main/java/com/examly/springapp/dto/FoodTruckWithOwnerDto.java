package com.examly.springapp.dto;

public class FoodTruckWithOwnerDto {
    private Long id;
    private String brandName;
    private String vendorName;
    private String vendorEmail;
    private String operatingRegion;
    private String location;
    private String cuisineSpecialties;
    private String menuHighlights;

    public FoodTruckWithOwnerDto() {}

    public FoodTruckWithOwnerDto(Long id, String brandName, String vendorName, String vendorEmail, 
                                String operatingRegion, String location, String cuisineSpecialties, String menuHighlights) {
        this.id = id;
        this.brandName = brandName;
        this.vendorName = vendorName;
        this.vendorEmail = vendorEmail;
        this.operatingRegion = operatingRegion;
        this.location = location;
        this.cuisineSpecialties = cuisineSpecialties;
        this.menuHighlights = menuHighlights;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorEmail() { return vendorEmail; }
    public void setVendorEmail(String vendorEmail) { this.vendorEmail = vendorEmail; }

    public String getOperatingRegion() { return operatingRegion; }
    public void setOperatingRegion(String operatingRegion) { this.operatingRegion = operatingRegion; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCuisineSpecialties() { return cuisineSpecialties; }
    public void setCuisineSpecialties(String cuisineSpecialties) { this.cuisineSpecialties = cuisineSpecialties; }

    public String getMenuHighlights() { return menuHighlights; }
    public void setMenuHighlights(String menuHighlights) { this.menuHighlights = menuHighlights; }
}