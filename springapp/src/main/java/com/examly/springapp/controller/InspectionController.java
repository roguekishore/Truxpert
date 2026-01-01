package com.examly.springapp.controller;

import com.examly.springapp.model.Inspection;
import com.examly.springapp.service.InspectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {
    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @PostMapping
    public Inspection create(@RequestBody Inspection inspection) {
        return inspectionService.save(inspection);
    }
    
    //used
    //get all inspections
    //called from adminapp
    @GetMapping
    public List<Inspection> getAll() {
        return inspectionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inspection> getById(@PathVariable Long id) {
        return inspectionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inspection> update(@PathVariable Long id, @RequestBody Inspection updatedInspection) {
        return inspectionService.findById(id)
                .map(existing -> {
                    updatedInspection.setId(id);
                    return ResponseEntity.ok(inspectionService.save(updatedInspection));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (inspectionService.findById(id).isPresent()) {
            inspectionService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    //used
    //assign inspector to foodtruck
    //called from adminapp - assign inspector
    @PostMapping("/assign/{foodTruckId}/inspector/{inspectorId}")
    public ResponseEntity<?> assignInspector(@PathVariable Long foodTruckId, @PathVariable Long inspectorId) {
        try {
            Inspection inspection = inspectionService.assignInspectorToFoodTruck(foodTruckId, inspectorId);
            return ResponseEntity.ok(inspection);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    
    //used
    //get inspections assigned for inspector
    //called from inspectorapp
    @GetMapping("/inspector/{inspectorId}")
    public ResponseEntity<List<Inspection>> getInspectionsByInspector(@PathVariable Long inspectorId) {
        List<Inspection> inspections = inspectionService.findByInspectorId(inspectorId);
        return ResponseEntity.ok(inspections);
    }
    
    //used
    //get pending inspections assigned for inspector
    //called from inspectorapp
    @GetMapping("/inspector/{inspectorId}/pending")
    public ResponseEntity<List<Inspection>> getPendingInspectionsByInspector(@PathVariable Long inspectorId) {
        List<Inspection> inspections = inspectionService.findPendingInspectionsByInspector(inspectorId);
        return ResponseEntity.ok(inspections);
    }

    //used
    //get inspector statistics
    //called from inspectorapp
    @GetMapping("/inspector/{inspectorId}/stats")
    public ResponseEntity<InspectionService.InspectorStats> getInspectorStats(@PathVariable Long inspectorId) {
        InspectionService.InspectorStats stats = inspectionService.getInspectorStats(inspectorId);
        return ResponseEntity.ok(stats);
    }
    
    //used
    //update the inspection result
    //called from inspectorapp
    @PutMapping("/{inspectionId}/complete")
    public ResponseEntity<?> completeInspection(
            @PathVariable Long inspectionId,
            @RequestBody Map<String, Object> requestBody) {
        try {
            String result = (String) requestBody.get("result");
            String notes = (String) requestBody.get("notes");
            
            Inspection.InspectionResult inspectionResult = Inspection.InspectionResult.valueOf(result.toUpperCase());
            Inspection updatedInspection = inspectionService.updateInspectionWithDetails(inspectionId, inspectionResult, notes);
            return ResponseEntity.ok(updatedInspection);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid result. Use PASS or FAIL"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // @PutMapping("/{inspectionId}/result/{result}")
    // public ResponseEntity<?> updateInspectionResult(@PathVariable Long inspectionId, @PathVariable String result) {
    //     try {
    //         Inspection.InspectionResult inspectionResult = Inspection.InspectionResult.valueOf(result.toUpperCase());
    //         Inspection updatedInspection = inspectionService.updateInspectionResult(inspectionId, inspectionResult);
    //         return ResponseEntity.ok(updatedInspection);
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.badRequest().body(Map.of("error", "Invalid result. Use PASS, FAIL, or IN_PROGRESS"));
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    //     }
    // }
}
