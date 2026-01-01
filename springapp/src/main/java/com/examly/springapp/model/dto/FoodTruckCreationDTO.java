package com.examly.springapp.model.dto;

import com.examly.springapp.model.FoodTruck;
import java.util.List;

public class FoodTruckCreationDTO {
    
    private FoodTruck foodTruck;
    private Long vendorId;
    private List<List<String>> documents; // List of [docName, docPath] pairs
    
    public FoodTruckCreationDTO() {
    }
    
    public FoodTruckCreationDTO(FoodTruck foodTruck, Long vendorId, List<List<String>> documents) {
        this.foodTruck = foodTruck;
        this.vendorId = vendorId;
        this.documents = documents;
    }
    
    public FoodTruck getFoodTruck() {
        return foodTruck;
    }
    
    public void setFoodTruck(FoodTruck foodTruck) {
        this.foodTruck = foodTruck;
    }
    
    public Long getVendorId() {
        return vendorId;
    }
    
    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }
    
    public List<List<String>> getDocuments() {
        return documents;
    }
    
    public void setDocuments(List<List<String>> documents) {
        this.documents = documents;
    }
}
