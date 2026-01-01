package com.examly.springapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

// import com.examly.springapp.DataSeeder;
import com.examly.springapp.model.FoodTruckVendor;
import com.examly.springapp.service.FoodTruckVendorService;

@RestController
public class FoodTruckVendorController {

    @Autowired
    public FoodTruckVendorService foodTruckVendorService;

    // @Autowired
    // public DataSeeder dataSeeder;

    @PostMapping("/addVendor")
    public ResponseEntity<FoodTruckVendor> createVendor(@RequestBody FoodTruckVendor foodTruckVendor) {
        FoodTruckVendor savedVendor = foodTruckVendorService.createVendor(foodTruckVendor);
        return new ResponseEntity<FoodTruckVendor>(savedVendor, HttpStatus.CREATED);
    }

    @PostMapping("/apply")
    public ResponseEntity<FoodTruckVendor> applyVendor(@RequestBody FoodTruckVendor foodTruckVendor) {
        FoodTruckVendor savedVendor = foodTruckVendorService.createVendor(foodTruckVendor);
        return new ResponseEntity<FoodTruckVendor>(savedVendor, HttpStatus.CREATED);
    }

    @GetMapping("/getAllVendors")
    public ResponseEntity<List<FoodTruckVendor>> getAllVendors() {
        List<FoodTruckVendor> foodTruckVendors = foodTruckVendorService.getAllVendors();
        return new ResponseEntity<>(foodTruckVendors, HttpStatus.OK);
    }

    @GetMapping("/getVendorById/{id}")
    public ResponseEntity<FoodTruckVendor> getVendorById(@PathVariable Integer id) {
        FoodTruckVendor foodTruckVendor = foodTruckVendorService.getVendorById(id);
        return new ResponseEntity<>(foodTruckVendor, HttpStatus.OK);
    }

    @PutMapping("/updateVendor/{id}")
    public ResponseEntity<FoodTruckVendor> updateVendor(@PathVariable Integer id,
            @RequestBody FoodTruckVendor foodTruckVendor) {
        FoodTruckVendor updatedVendor = foodTruckVendorService.updateVendor(id, foodTruckVendor);
        return new ResponseEntity<FoodTruckVendor>(updatedVendor, HttpStatus.OK);
    }

    @DeleteMapping("/deleteVendor/{id}")
    public ResponseEntity<String> deleteVendor(@PathVariable Integer id) {
        foodTruckVendorService.deleteVendor(id);
        return new ResponseEntity<>("Vendor with id " + id + " has been deleted.", HttpStatus.OK);
    }

    // @PostMapping("/seedData")
    // public ResponseEntity<String> initializeData() {
    //     dataSeeder.seedData();
    //     return new ResponseEntity<>("Initial data seeding triggered successfully.", HttpStatus.OK);
    // }
}