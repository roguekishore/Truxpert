package com.examly.springapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examly.springapp.model.Brand;
import com.examly.springapp.model.Vendor;
import com.examly.springapp.repository.BrandRepository;
import com.examly.springapp.repository.VendorRepository;

import java.util.List;
import java.util.Optional;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private VendorRepository vendorRepository;

    public Brand saveBrand(Long vendorId, Brand brand) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with ID: " + vendorId));
        brand.setVendor(vendor);
        return brandRepository.save(brand);
    }

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Optional<Brand> getBrandById(Long id) {
        return brandRepository.findById(id);
    }

    public List<Brand> getBrandsByVendorId(Long vendorId) {
        return brandRepository.findByVendorId(vendorId);
    }

    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }

    public void deleteAllBrands() {
        brandRepository.deleteAll();
    }

    public Brand putBrand(Long id, Brand updatedBrand) {
        Brand existingBrand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with ID: " + id));

        existingBrand.setBrandName(updatedBrand.getBrandName());

        return brandRepository.save(existingBrand);
    }

    public Brand patchBrand(Long id, Brand updatedBrand) {
        Brand existingBrand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with ID: " + id));

        if (updatedBrand.getBrandName() != null) {
            existingBrand.setBrandName(updatedBrand.getBrandName());
        }

        return brandRepository.save(existingBrand);
    }

    public List<Brand> saveAllBrands(Long vendorId, List<Brand> brands) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with ID: " + vendorId));

        for (Brand brand : brands) {
            brand.setVendor(vendor);
        }

        return brandRepository.saveAll(brands);
    }
}