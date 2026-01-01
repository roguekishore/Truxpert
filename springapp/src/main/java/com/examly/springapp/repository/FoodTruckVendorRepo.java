package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.FoodTruckVendor;

@Repository
public interface FoodTruckVendorRepo extends JpaRepository<FoodTruckVendor, Integer> {
    boolean existsByName(String name);
    FoodTruckVendor findByName(String name);
} 
