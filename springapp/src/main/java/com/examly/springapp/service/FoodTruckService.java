package com.examly.springapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.examly.springapp.model.Application;
import com.examly.springapp.model.Brand;
import com.examly.springapp.model.Document;
import com.examly.springapp.model.FoodTruck;
import com.examly.springapp.model.Vendor;
import com.examly.springapp.model.dto.FoodTruckCreationDTO;
import com.examly.springapp.repository.ApplicationRepository;
import com.examly.springapp.repository.BrandRepository;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.repository.FoodTruckRepository;
import com.examly.springapp.repository.VendorRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FoodTruckService {
    @Autowired
    private FoodTruckRepository foodTruckRepository;
    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private VendorRepository vendorRepository;

    public FoodTruck saveFoodTruck(Long brandId, FoodTruck foodTruck) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found with ID: " + brandId));
        foodTruck.setBrand(brand);
        return foodTruckRepository.save(foodTruck);
    }

    public FoodTruck saveFoodTruckWithApplication(Long brandId, FoodTruckCreationDTO creationDTO) {
        // First, save the FoodTruck
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found with ID: " + brandId));
        
        FoodTruck foodTruck = creationDTO.getFoodTruck();
        foodTruck.setBrand(brand);
        FoodTruck savedFoodTruck = foodTruckRepository.save(foodTruck);

        // Get the vendor
        Vendor vendor = vendorRepository.findById(creationDTO.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found with ID: " + creationDTO.getVendorId()));

        // Create Application
        Application application = new Application();
        application.setFoodTruck(savedFoodTruck);
        application.setVendor(vendor);
        application.setSubmissionDate(LocalDateTime.now());
        application.setStatus(Application.ApplicationStatus.SUBMITTED);
        application.setReview(null);

        // Initialize documents list
        List<Document> documents = new ArrayList<>();
        
        // Create documents from the list of list of strings
        if (creationDTO.getDocuments() != null) {
            for (List<String> documentData : creationDTO.getDocuments()) {
                if (documentData.size() >= 2) {
                    Document document = new Document();
                    document.setDocumentName(documentData.get(0)); // docName
                    document.setFilePath(documentData.get(1)); // docPath
                    document.setApplication(application);
                    documents.add(document);
                }
            }
        }

        // Set documents to application
        application.setDocuments(documents);

        // Save application (this will cascade and save documents too)
        applicationRepository.save(application);

        return savedFoodTruck;
    }

    public List<FoodTruck> getAllFoodTrucks() {
        return foodTruckRepository.findAll();
    }

    public Optional<FoodTruck> getFoodTruckById(Long id) {
        return foodTruckRepository.findById(id);
    }

    public List<FoodTruck> getFoodTrucksByBrandId(Long brandId) {
        return foodTruckRepository.findByBrandId(brandId);
    }

    public void deleteFoodTruck(Long id) {
        foodTruckRepository.deleteById(id);
    }

    public void deleteAllFoodTrucks() {
        foodTruckRepository.deleteAll();
    }

    public FoodTruck putFoodTruck(Long id, FoodTruck updatedFoodTruck) {
        FoodTruck existingFoodTruck = foodTruckRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FoodTruck not found with ID: " + id));

        existingFoodTruck.setOperatingRegion(updatedFoodTruck.getOperatingRegion());
        existingFoodTruck.setLocation(updatedFoodTruck.getLocation());
        existingFoodTruck.setCuisineSpecialties(updatedFoodTruck.getCuisineSpecialties());
        existingFoodTruck.setMenuHighlights(updatedFoodTruck.getMenuHighlights());

        return foodTruckRepository.save(existingFoodTruck);
    }

    public FoodTruck patchFoodTruck(Long id, FoodTruck updatedFoodTruck) {
        FoodTruck existingFoodTruck = foodTruckRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FoodTruck not found with ID: " + id));

        if (updatedFoodTruck.getOperatingRegion() != null) {
            existingFoodTruck.setOperatingRegion(updatedFoodTruck.getOperatingRegion());
        }
        if (updatedFoodTruck.getLocation() != null) {
            existingFoodTruck.setLocation(updatedFoodTruck.getLocation());
        }
        if (updatedFoodTruck.getCuisineSpecialties() != null) {
            existingFoodTruck.setCuisineSpecialties(updatedFoodTruck.getCuisineSpecialties());
        }
        if (updatedFoodTruck.getMenuHighlights() != null) {
            existingFoodTruck.setMenuHighlights(updatedFoodTruck.getMenuHighlights());
        }

        return foodTruckRepository.save(existingFoodTruck);
    }

    @Transactional
    public FoodTruck updateFoodTruckWithDocuments(Long id, FoodTruckCreationDTO updateDTO) {
        FoodTruck existingFoodTruck = foodTruckRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FoodTruck not found with ID: " + id));

        FoodTruck updatedData = updateDTO.getFoodTruck();
        
        // Update food truck fields
        if (updatedData.getOperatingRegion() != null) {
            existingFoodTruck.setOperatingRegion(updatedData.getOperatingRegion());
        }
        if (updatedData.getLocation() != null) {
            existingFoodTruck.setLocation(updatedData.getLocation());
        }
        if (updatedData.getCuisineSpecialties() != null) {
            existingFoodTruck.setCuisineSpecialties(updatedData.getCuisineSpecialties());
        }
        if (updatedData.getMenuHighlights() != null) {
            existingFoodTruck.setMenuHighlights(updatedData.getMenuHighlights());
        }

        // Handle documents if provided
        if (updateDTO.getDocuments() != null && !updateDTO.getDocuments().isEmpty()) {
            // Find the existing application for this food truck
            Application application = applicationRepository.findByFoodTruckId(id)
                    .orElseThrow(() -> new RuntimeException("Application not found for food truck with ID: " + id));

            // Create new documents
            List<Document> newDocuments = new ArrayList<>();
            for (List<String> docData : updateDTO.getDocuments()) {
                if (docData.size() >= 2) {
                    Document document = new Document();
                    document.setDocumentName(docData.get(0));
                    document.setFilePath(docData.get(1));
                    document.setApplication(application);
                    newDocuments.add(document);
                }
            }

            // Replace existing documents with new ones
            if (!newDocuments.isEmpty()) {
                // Remove old documents
                if (application.getDocuments() != null) {
                    application.getDocuments().clear();
                }
                // Add new documents
                application.setDocuments(newDocuments);
                applicationRepository.save(application);
            }
        }

        return foodTruckRepository.save(existingFoodTruck);
    }

    public List<FoodTruck> saveAllFoodTrucks(Long brandId, List<FoodTruck> foodTrucks) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found with ID: " + brandId));

        for (FoodTruck foodTruck : foodTrucks) {
            foodTruck.setBrand(brand);
        }

        return foodTruckRepository.saveAll(foodTrucks);
    }

    @Transactional
    public FoodTruck createFoodTruck(Long brandId, FoodTruckCreationDTO dto) {
        try {
            FoodTruck foodTruck = dto.getFoodTruck();
            
            // Set brand
            Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
            foodTruck.setBrand(brand);
            
            // Set default application status
            foodTruck.setApplicationStatus(Application.ApplicationStatus.SUBMITTED);
            
            // Save food truck first
            FoodTruck savedFoodTruck = foodTruckRepository.save(foodTruck);
            
            // Create application
            Application application = new Application();
            application.setFoodTruck(savedFoodTruck);
            application.setSubmissionDate(LocalDateTime.now());
            application.setStatus(Application.ApplicationStatus.SUBMITTED);
            
            // Save application
            applicationService.save(application);
            
            // Process documents if any
            if (dto.getDocuments() != null && !dto.getDocuments().isEmpty()) {
                // Process documents logic here
            }
            
            return savedFoodTruck;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create food truck: " + e.getMessage());
        }
    }
}
