package com.examly.springapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examly.springapp.exception.DuplicateVendorNameException;
import com.examly.springapp.exception.InvalidOperatingRegionException;
import com.examly.springapp.model.FoodTruckVendor;
import com.examly.springapp.repository.FoodTruckVendorRepo;

@Service
public class FoodTruckVendorService {

    @Autowired
    public FoodTruckVendorRepo foodTruckVendorRepo;

    public FoodTruckVendor createVendor(FoodTruckVendor foodTruckVendor) {
        String operatingRegion = foodTruckVendor.getOperatingRegion().toLowerCase();

        // if (foodTruckVendorRepo.existsByName(foodTruckVendor.getName())) {
        //     throw new DuplicateVendorNameException("A vendor with the name '" + foodTruckVendor.getName() + "' already exists.");
        // }

        if(operatingRegion == null || (!operatingRegion.equalsIgnoreCase("chennai") && (!operatingRegion.equalsIgnoreCase("bangalore")))) {
            throw new InvalidOperatingRegionException("Invalid operating region. Must be either Chennai or Bangalore.");
        }

        return foodTruckVendorRepo.save(foodTruckVendor);
    }

    public FoodTruckVendor getVendorById(Integer id) {
        Optional<FoodTruckVendor> vendor = foodTruckVendorRepo.findById(id);
        if (vendor.isPresent()) {
            return vendor.get();
        } else {
            throw new RuntimeException("Vendor with id " + id + " not found.");
        }
    }

    public List<FoodTruckVendor> getAllVendors() {
        return foodTruckVendorRepo.findAll();
    }

    public FoodTruckVendor updateVendor(Integer id, FoodTruckVendor foodTruckVendor) {
        Optional<FoodTruckVendor> existingVendorOptional = foodTruckVendorRepo.findById(id);

        if (existingVendorOptional.isPresent()) {
            FoodTruckVendor existingVendor = existingVendorOptional.get();

            // if (!existingVendor.getName().equalsIgnoreCase(foodTruckVendor.getName()) && foodTruckVendorRepo.existsByName(foodTruckVendor.getName())) {
            //     throw new DuplicateVendorNameException("A vendor with the name '" + foodTruckVendor.getName() + "' already exists.");
            // }

            String operatingRegion = foodTruckVendor.getOperatingRegion().toLowerCase();
            if (operatingRegion == null || (!operatingRegion.equalsIgnoreCase("chennai") && (!operatingRegion.equalsIgnoreCase("bangalore")))) {
                throw new InvalidOperatingRegionException("Invalid operating region. Must be either Chennai or Bangalore.");
            }

            existingVendor.setName(foodTruckVendor.getName());
            existingVendor.setCuisineSpecialties(foodTruckVendor.getCuisineSpecialties());
            existingVendor.setOperatingRegion(foodTruckVendor.getOperatingRegion());
            existingVendor.setMenuHighlights(foodTruckVendor.getMenuHighlights());
            existingVendor.setPhoneNumber(foodTruckVendor.getPhoneNumber());

            return foodTruckVendorRepo.save(existingVendor);
        } else {
            throw new RuntimeException("Vendor with id " + id + " not found.");
        }
    }
    
    public void deleteVendor(Integer id) {
        if (foodTruckVendorRepo.existsById(id)) {
            foodTruckVendorRepo.deleteById(id);
        } else {
            throw new RuntimeException("Vendor with id " + id + " not found.");
        }
    }

    public void seedInitialData() {
        System.out.println("Seeding initial data for FoodTruckVendor via API request...");
        seedVendor("The Southern Spoon", "Southern Comfort Food", "Chennai", "Fried Chicken, Mac & Cheese", "+919876512345");
        seedVendor("Wok & Roll", "Asian, Chinese", "Bangalore", "Chow Mein, Spring Rolls, Kung Pao Chicken", "+919988776655");
        seedVendor("The Gilded Grill", "Gourmet Burgers, Sandwiches", "Bangalore", "Wagyu Burger, Truffle Fries", "+919123456789");
        seedVendor("Taco Tempo", "Mexican", "Chennai", "Al Pastor Tacos, Carne Asada Burrito", "+919012345678");
        System.out.println("Initial data seeding complete.");
    }

    private void seedVendor(String name, String cuisine, String region, String menu, String phone) {
        FoodTruckVendor vendor = new FoodTruckVendor();
        vendor.setName(name);
        vendor.setCuisineSpecialties(cuisine);
        vendor.setOperatingRegion(region);
        vendor.setMenuHighlights(menu);
        vendor.setPhoneNumber(phone);
        
        try {
            createVendor(vendor);
            System.out.println("  - Successfully added: " + name);
        } catch (DuplicateVendorNameException e) {
            System.out.println("  - Skipped (already exists): " + name);
        } catch (InvalidOperatingRegionException e) {
            System.out.println("  - Skipped (invalid region): " + name);
        } catch (Exception e) {
            System.err.println("  - Error seeding " + name + ": " + e.getMessage());
        }
    }
}
