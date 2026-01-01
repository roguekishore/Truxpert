package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.FoodTruck;

import java.util.List;

@Repository
public interface FoodTruckRepository extends JpaRepository<FoodTruck, Long> {
    // List<FoodTruck> findByBrandId(Integer brandId);

    @Query("SELECT f FROM FoodTruck f WHERE f.brand.id = :brandId")
    List<FoodTruck> findByBrandId(@Param("brandId") Long brandId);

    
}