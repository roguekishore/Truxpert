package com.examly.springapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.Brand;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long>{
    // List<Brand> findByVendorId(Long vendorId);

    @Query("SELECT b FROM Brand b WHERE b.vendor.id = :vendorId")
    List<Brand> findByVendorId(@Param("vendorId") Long vendorId);
    
    Optional<Brand> findByBrandName(String brandName);
}