package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.model.FoodTruck;
import com.examly.springapp.model.dto.FoodTruckCreationDTO;
import com.examly.springapp.service.FoodTruckService;

import java.util.List;

@RestController
@RequestMapping("/api/foodtrucks")
public class FoodTruckController {

    @Autowired
    private FoodTruckService foodTruckService;

    @PostMapping("/{brandId}")
    public ResponseEntity<FoodTruck> createFoodTruck(@PathVariable Long brandId, @RequestBody FoodTruckCreationDTO creationDTO) {
        try {
            FoodTruck savedFoodTruck = foodTruckService.saveFoodTruckWithApplication(brandId, creationDTO);
            return new ResponseEntity<>(savedFoodTruck, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodTruck> getFoodTruckById(@PathVariable Long id) {
        return foodTruckService.getFoodTruckById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<FoodTruck> getAllFoodTrucks() {
        return foodTruckService.getAllFoodTrucks();
    }

    @GetMapping("/brand/{brandId}")
    public List<FoodTruck> getFoodTrucksByBrandId(@PathVariable Long brandId) {
        return foodTruckService.getFoodTrucksByBrandId(brandId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodTruck(@PathVariable Long id) {
        foodTruckService.deleteFoodTruck(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    // @DeleteMapping("/all")
    // public ResponseEntity<Void> deleteAllFoodTrucks() {
    //     foodTruckService.deleteAllFoodTrucks();
    //     return new ResponseEntity<>(HttpStatus.OK);
    // }

    @PutMapping("/{id}")
    public ResponseEntity<FoodTruck> putFoodTruck(@PathVariable Long id, @RequestBody FoodTruck foodTruck) {
        try {
            FoodTruck updatedFoodTruck = foodTruckService.putFoodTruck(id, foodTruck);
            return new ResponseEntity<>(updatedFoodTruck, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<FoodTruck> patchFoodTruck(@PathVariable Long id, @RequestBody FoodTruck foodTruck) {
        try {
            FoodTruck patchedFoodTruck = foodTruckService.patchFoodTruck(id, foodTruck);
            return new ResponseEntity<>(patchedFoodTruck, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // New endpoint for updating food truck with optional documents
    @PutMapping("/{id}/with-documents")
    public ResponseEntity<FoodTruck> updateFoodTruckWithDocuments(@PathVariable Long id, @RequestBody FoodTruckCreationDTO updateDTO) {
        try {
            FoodTruck updatedFoodTruck = foodTruckService.updateFoodTruckWithDocuments(id, updateDTO);
            return new ResponseEntity<>(updatedFoodTruck, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/bulk/{brandId}")
    public ResponseEntity<List<FoodTruck>> saveAllFoodTrucks(@PathVariable Long brandId,
            @RequestBody List<FoodTruck> foodTrucks) {
        List<FoodTruck> savedTrucks = foodTruckService.saveAllFoodTrucks(brandId, foodTrucks);
        return new ResponseEntity<>(savedTrucks, HttpStatus.CREATED);
    }

    
}
