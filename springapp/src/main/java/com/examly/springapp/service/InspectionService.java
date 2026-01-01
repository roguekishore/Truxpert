package com.examly.springapp.service;

import com.examly.springapp.model.FoodTruck;
import com.examly.springapp.model.Inspection;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.FoodTruckRepository;
import com.examly.springapp.repository.InspectionRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InspectionService {
    private final InspectionRepository inspectionRepository;

    @Autowired
    private FoodTruckRepository foodTruckRepository;

    @Autowired
    private UserRepository userRepository;

    public InspectionService(InspectionRepository inspectionRepository) {
        this.inspectionRepository = inspectionRepository;
    }

    public List<Inspection> findAll() {
        return inspectionRepository.findAll();
    }

    public Optional<Inspection> findById(Long id) {
        return inspectionRepository.findById(id);
    }

    public Inspection save(Inspection inspection) {
        return inspectionRepository.save(inspection);
    }

    public void delete(Long id) {
        inspectionRepository.deleteById(id);
    }

    // Find inspections by inspector ID
    public List<Inspection> findByInspectorId(Long inspectorId) {
        return inspectionRepository.getInspectionsByInspectorId(inspectorId);
    }

    // Find inspections by status
    public List<Inspection> findByResult(Inspection.InspectionResult result) {
        return inspectionRepository.getInspectionsByResult(result);
    }

    // Find pending inspections for an inspector
    public List<Inspection> findPendingInspectionsByInspector(Long inspectorId) {
        return inspectionRepository.getInspectionsByInspectorIdAndResult(inspectorId, Inspection.InspectionResult.IN_PROGRESS);
    }

    // Get inspector statistics
    public InspectorStats getInspectorStats(Long inspectorId) {
        long totalInspections = inspectionRepository.countByInspectorId(inspectorId);
        long pendingInspections = inspectionRepository.countByInspectorIdAndResult(inspectorId, Inspection.InspectionResult.IN_PROGRESS);
        long passedInspections = inspectionRepository.countByInspectorIdAndResult(inspectorId, Inspection.InspectionResult.PASS);
        long failedInspections = inspectionRepository.countByInspectorIdAndResult(inspectorId, Inspection.InspectionResult.FAIL);
        
        double successRate = totalInspections > 0 ? ((double) passedInspections / totalInspections) * 100 : 0.0;
        
        return new InspectorStats(totalInspections, pendingInspections, passedInspections, failedInspections, successRate);
    }

    @Transactional
    public Inspection assignInspectorToFoodTruck(Long foodTruckId, Long inspectorId) {
        // Fetch the food truck
        FoodTruck foodTruck = foodTruckRepository.findById(foodTruckId)
                .orElseThrow(() -> new RuntimeException("Food truck not found with id: " + foodTruckId));

        // Fetch the inspector
        User inspector = userRepository.findById(inspectorId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + inspectorId));

        // Validate that the user is an inspector
        if (!inspector.getRole().equals(User.Role.INSPECTOR)) {
            throw new IllegalArgumentException("User with id " + inspectorId + " is not an inspector");
        }

        // Create new inspection
        Inspection inspection = new Inspection();
        inspection.setFoodTruck(foodTruck);
        inspection.setInspector(inspector);
        inspection.setInspectionDate(LocalDateTime.now());
        inspection.setResult(Inspection.InspectionResult.IN_PROGRESS);

        // Save and return the inspection
        return inspectionRepository.save(inspection);
    }

    @Transactional
    public Inspection updateInspectionResult(Long inspectionId, Inspection.InspectionResult result) {
        // Find the inspection
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        // Update the result and date
        inspection.setResult(result);
        inspection.setInspectionDate(LocalDateTime.now());

        // Save and return the updated inspection
        return inspectionRepository.save(inspection);
    }

    @Transactional
    public Inspection updateInspectionWithDetails(Long inspectionId, Inspection.InspectionResult result, String notes) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new RuntimeException("Inspection not found with id: " + inspectionId));

        inspection.setResult(result);
        inspection.setInspectionDate(LocalDateTime.now());
        return inspectionRepository.save(inspection);
    }

    // Inner class for inspector statistics
    public static class InspectorStats {
        private long totalInspections;
        private long pendingInspections;
        private long passedInspections;
        private long failedInspections;
        private double successRate;

        public InspectorStats(long totalInspections, long pendingInspections, long passedInspections, long failedInspections, double successRate) {
            this.totalInspections = totalInspections;
            this.pendingInspections = pendingInspections;
            this.passedInspections = passedInspections;
            this.failedInspections = failedInspections;
            this.successRate = successRate;
        }

        // Getters
        public long getTotalInspections() { return totalInspections; }
        public long getPendingInspections() { return pendingInspections; }
        public long getPassedInspections() { return passedInspections; }
        public long getFailedInspections() { return failedInspections; }
        public double getSuccessRate() { return successRate; }
    }
}
