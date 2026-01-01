package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.MenuItem;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long>{
    @Query("SELECT m FROM MenuItem m WHERE m.foodTruck.id = :truckId")
    List<MenuItem> findByTruckId(@Param("truckId") Long truckId);
    
    List<MenuItem> findByFoodTruckId(Long foodTruckId);
}
