package com.examly.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspections")
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "food_truck_id")
    private FoodTruck foodTruck;

    @ManyToOne
    @JoinColumn(name = "inspector_id")
    private User inspector;

    private LocalDateTime inspectionDate;

    @Enumerated(EnumType.STRING)
    private InspectionResult result; // PASS, FAIL

    public enum InspectionResult {
        PASS, FAIL, IN_PROGRESS
    }

    // No-args constructor
    public Inspection() {
    }

    // All-args constructor
    public Inspection(Long id, FoodTruck foodTruck, User inspector, LocalDateTime inspectionDate, InspectionResult result) {
        this.id = id;
        this.foodTruck = foodTruck;
        this.inspector = inspector;
        this.inspectionDate = inspectionDate;
        this.result = result;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FoodTruck getFoodTruck() {
        return foodTruck;
    }

    public void setFoodTruck(FoodTruck foodTruck) {
        this.foodTruck = foodTruck;
    }

    public User getInspector() {
        return inspector;
    }

    public void setInspector(User inspector) {
        this.inspector = inspector;
    }

    public LocalDateTime getInspectionDate() {
        return inspectionDate;
    }

    public void setInspectionDate(LocalDateTime inspectionDate) {
        this.inspectionDate = inspectionDate;
    }

    public InspectionResult getResult() {
        return result;
    }

    public void setResult(InspectionResult result) {
        this.result = result;
    }
}
