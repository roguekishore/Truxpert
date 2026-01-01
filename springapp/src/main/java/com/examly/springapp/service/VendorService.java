package com.examly.springapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examly.springapp.exception.DuplicateVendorNameException;
import com.examly.springapp.model.Vendor;
import com.examly.springapp.repository.VendorRepository;

import java.util.List;
import java.util.Optional;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Optional<Vendor> getVendorById(Long id) {
        return vendorRepository.findById(id);
    }

    public Vendor saveVendor(Vendor vendor) {
        String email = vendor.getEmail();
        Optional<Vendor> v = vendorRepository.findByEmailIgnoreCase(email);
        if(v.isPresent()) {
            throw new DuplicateVendorNameException("A vendor with this email already exists");
        }
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(Long id) {
        vendorRepository.deleteById(id);
    }

    public void deleteAllVendors() {
        vendorRepository.deleteAll();
    }

    public Vendor putVendor(Long id, Vendor updatedVendor) {
        Vendor existingVendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with ID: " + id));

        existingVendor.setName(updatedVendor.getName());
        existingVendor.setEmail(updatedVendor.getEmail());
        existingVendor.setPassword(updatedVendor.getPassword());
        return vendorRepository.save(existingVendor);
    }

    public Vendor patchVendor(Long id, Vendor updatedVendor) {
        Vendor existingVendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with ID: " + id));

        if (updatedVendor.getName() != null) {
            existingVendor.setName(updatedVendor.getName());
        }
    
        if (updatedVendor.getEmail() != null) {
            // Check if new email is already taken by another vendor
            Optional<Vendor> emailVendor = vendorRepository.findByEmailIgnoreCase(updatedVendor.getEmail());
            if (emailVendor.isPresent() && !emailVendor.get().getId().equals(id)) {
                throw new DuplicateVendorNameException("A vendor with this email already exists");
            }
            existingVendor.setEmail(updatedVendor.getEmail());
        }

        if (updatedVendor.getPassword() != null && !updatedVendor.getPassword().trim().isEmpty()) {
            existingVendor.setPassword(updatedVendor.getPassword());
        }

        return vendorRepository.save(existingVendor);
    }

    public List<Vendor> saveAllVendors(List<Vendor> vendors) {
        return vendorRepository.saveAll(vendors);
    }

    public Vendor loginVendor(String email, String password) {
        System.out.println("Searching for email: " + email);
        Vendor vendor = vendorRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        if (!vendor.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }
        
        return vendor;
    }
}