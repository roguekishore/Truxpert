package com.examly.springapp.repository;

import com.examly.springapp.model.Inspection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    @Query("SELECT i FROM Inspection i WHERE i.inspector.id = :inspectorId")
    List<Inspection> getInspectionsByInspectorId(@Param("inspectorId") Long inspectorId);
    
    @Query("SELECT i FROM Inspection i WHERE i.result = :result")
    List<Inspection> getInspectionsByResult(@Param("result") Inspection.InspectionResult result);
    
    @Query("SELECT i FROM Inspection i WHERE i.inspector.id = :inspectorId AND i.result = :result")
    List<Inspection> getInspectionsByInspectorIdAndResult(@Param("inspectorId") Long inspectorId, @Param("result") Inspection.InspectionResult result);
    
    // Count methods for statistics
    long countByInspectorId(Long inspectorId);
    long countByInspectorIdAndResult(Long inspectorId, Inspection.InspectionResult result);
    
    // Paginated methods
    Page<Inspection> findByInspectorId(Pageable pageable, Long inspectorId);
    Page<Inspection> findByInspectorIdAndResult(Pageable pageable, Long inspectorId, Inspection.InspectionResult result);
    
    Optional<Inspection> findByFoodTruckId(Long foodTruckId);
}
