package com.examly.springapp.repository;

import com.examly.springapp.model.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Page<Application> findByReviewIsNull(Pageable pageable);
    
    @Query("SELECT a FROM Application a WHERE a.status = :status")
    List<Application> getApplicationsByStatus(@Param("status") Application.ApplicationStatus status);
    
    Page<Application> findByStatus(Application.ApplicationStatus status, Pageable pageable);
    
    Optional<Application> findByFoodTruckId(Long foodTruckId);
    
    List<Application> findByStatus(Application.ApplicationStatus status);
}
