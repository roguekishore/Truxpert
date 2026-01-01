package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.model.Brand;
import com.examly.springapp.service.BrandService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @PostMapping("/{vendorId}")
    public ResponseEntity<Brand> createBrand(@PathVariable Long vendorId, @RequestBody Brand brand) {
        try {
            Brand savedBrand = brandService.saveBrand(vendorId, brand);
            return new ResponseEntity<>(savedBrand, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/{id}")
    public Optional<Brand> getBrandById(@PathVariable Long id) {
        return brandService.getBrandById(id);
    }
    
    @GetMapping
    public List<Brand> getAllBrands() {
        return brandService.getAllBrands();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllBrands() {
        brandService.deleteAllBrands();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Brand> getBrandsByVendorId(@PathVariable Long vendorId) {
        return brandService.getBrandsByVendorId(vendorId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Brand> putBrand(@PathVariable Long id, @RequestBody Brand brand) {
        try {
            Brand updatedBrand = brandService.putBrand(id, brand);
            return new ResponseEntity<>(updatedBrand, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Brand> patchBrand(@PathVariable Long id, @RequestBody Brand brand) {
        try {
            Brand patchedBrand = brandService.patchBrand(id, brand);
            return new ResponseEntity<>(patchedBrand, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/bulk/{vendorId}")
    public ResponseEntity<List<Brand>> saveAllBrands(@PathVariable Long vendorId, @RequestBody List<Brand> brands) {
        List<Brand> savedBrands = brandService.saveAllBrands(vendorId, brands);
        return new ResponseEntity<>(savedBrands, HttpStatus.CREATED);
    }
}
