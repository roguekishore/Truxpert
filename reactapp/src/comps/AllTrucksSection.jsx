import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Menu, ChevronRight, MapPin, Utensils, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useApi } from '../context/ApiContext';
import '../css/AllTrucksSection.css';

const AllTrucksSection = ({ onSelectFoodTruck, onSelectBrand, viewMode = 'trucks' }) => {
  const [brandsWithTrucks, setBrandsWithTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBrands, setExpandedBrands] = useState({});
  
  const { getBrandsByVendor, getFoodTrucksByBrand } = useApi();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const vendorId = localStorage.getItem('userId');
      if (!vendorId) throw new Error('No vendor ID found');
      
      // Fetch all brands first
      const brands = await getBrandsByVendor(vendorId);
      
      // Fetch trucks for each brand
      const brandsWithTrucksData = await Promise.all(
        brands.map(async (brand) => {
          try {
            const trucks = await getFoodTrucksByBrand(brand.id);
            return { ...brand, foodTrucks: trucks || [] };
          } catch (err) {
            console.error(`Failed to fetch trucks for brand ${brand.id}:`, err);
            return { ...brand, foodTrucks: [] };
          }
        })
      );
      
      setBrandsWithTrucks(brandsWithTrucksData);
      
      // Auto-expand all brands initially
      const expanded = {};
      brandsWithTrucksData.forEach(brand => {
        expanded[brand.id] = true;
      });
      setExpandedBrands(expanded);
      
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [getBrandsByVendor, getFoodTrucksByBrand]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const toggleBrandExpand = (brandId) => {
    setExpandedBrands(prev => ({
      ...prev,
      [brandId]: !prev[brandId]
    }));
  };

  const isApproved = (truck) => {
    return truck.applicationStatus === 'APPROVED';
  };

  const handleTruckClick = (truck, brand) => {
    if (viewMode === 'menu' && !isApproved(truck)) {
      setError('Cannot access menu until food truck application is approved.');
      return;
    }
    onSelectFoodTruck(truck, brand);
  };

  const getTotalTrucks = () => {
    return brandsWithTrucks.reduce((total, brand) => total + (brand.foodTrucks?.length || 0), 0);
  };

  const getApprovedTrucks = () => {
    return brandsWithTrucks.reduce((total, brand) => {
      return total + (brand.foodTrucks?.filter(t => t.applicationStatus === 'APPROVED')?.length || 0);
    }, 0);
  };

  const getPendingTrucks = () => {
    return brandsWithTrucks.reduce((total, brand) => {
      return total + (brand.foodTrucks?.filter(t => 
        t.applicationStatus === 'SUBMITTED' || t.applicationStatus === 'IN_REVIEW'
      )?.length || 0);
    }, 0);
  };

  if (loading) {
    return <div className="loading">Loading your food trucks...</div>;
  }

  return (
    <div className="all-trucks-container">
      <div className="all-trucks-header">
        <h2>
          {viewMode === 'menu' ? 'Select a Food Truck to View Menu' : 'All Your Food Trucks'}
        </h2>
        <p className="header-subtitle">
          {viewMode === 'menu' 
            ? 'Choose an approved food truck below to manage its menu items'
            : 'View and manage all your food trucks across all brands'
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="trucks-stats">
        <div className="stat-item">
          <span className="stat-value">{brandsWithTrucks.length}</span>
          <span className="stat-label">Brands</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getTotalTrucks()}</span>
          <span className="stat-label">Total Trucks</span>
        </div>
        <div className="stat-item approved">
          <span className="stat-value">{getApprovedTrucks()}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-item pending">
          <span className="stat-value">{getPendingTrucks()}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle className="icon" />
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      {brandsWithTrucks.length === 0 ? (
        <div className="no-data-message">
          <Truck className="empty-icon" />
          <h3>No Brands or Food Trucks Yet</h3>
          <p>Start by creating a brand, then add food trucks under it.</p>
        </div>
      ) : (
        <div className="brands-trucks-list">
          {brandsWithTrucks.map((brand) => (
            <div key={brand.id} className="brand-group">
              <div 
                className="brand-group-header"
                onClick={() => toggleBrandExpand(brand.id)}
              >
                <div className="brand-info">
                  <ChevronRight 
                    className={`expand-icon ${expandedBrands[brand.id] ? 'expanded' : ''}`} 
                  />
                  <h3>{brand.brandName}</h3>
                  <span className="truck-count">
                    {brand.foodTrucks?.length || 0} truck{brand.foodTrucks?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button 
                  className="manage-brand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBrand(brand);
                  }}
                >
                  Manage Brand
                </button>
              </div>
              
              {expandedBrands[brand.id] && (
                <div className="trucks-list">
                  {brand.foodTrucks?.length === 0 ? (
                    <div className="no-trucks-message">
                      <p>No food trucks for this brand yet.</p>
                      <button 
                        className="add-truck-link"
                        onClick={() => onSelectBrand(brand)}
                      >
                        + Add a food truck
                      </button>
                    </div>
                  ) : (
                    brand.foodTrucks.map((truck) => (
                      <div 
                        key={truck.id} 
                        className={`truck-item ${!isApproved(truck) ? 'truck-pending' : ''} ${viewMode === 'menu' && !isApproved(truck) ? 'truck-disabled' : ''}`}
                        onClick={() => handleTruckClick(truck, brand)}
                      >
                        <div className="truck-icon-wrapper">
                          {viewMode === 'menu' ? (
                            <Menu className="truck-icon" />
                          ) : (
                            <Truck className="truck-icon" />
                          )}
                        </div>
                        <div className="truck-details">
                          <div className="truck-main-info">
                            <span className="truck-region">{truck.operatingRegion}</span>
                            <StatusBadge status={truck.applicationStatus} />
                          </div>
                          <div className="truck-sub-info">
                            <span className="truck-location">
                              <MapPin className="mini-icon" />
                              {truck.location}
                            </span>
                            <span className="truck-cuisine">
                              <Utensils className="mini-icon" />
                              {truck.cuisineSpecialties}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="navigate-icon" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTrucksSection;
