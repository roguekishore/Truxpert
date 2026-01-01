import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Users, Menu, ChevronRight, MapPin, Clock } from 'lucide-react';
import '../css/VendorScreen.css';

const VendorScreen = ({ setActiveSection, onSelectBrand }) => {
  const [stats, setStats] = useState({
    brands: 0,
    trucks: 0,
    menuItems: 0,
    pendingApprovals: 0
  });
  const [recentTrucks, setRecentTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_URL;

  const fetchVendorData = useCallback(async () => {
    try {
      setLoading(true);
      const vendorId = localStorage.getItem('userId');
      if (!vendorId) return;

      // Fetch brands
      const brandsResponse = await fetch(`${BASE_URL}/api/brands/vendor/${vendorId}`);
      const brands = await brandsResponse.json();

      // Fetch trucks for each brand
      let allTrucks = [];
      let totalMenuItems = 0;

      for (const brand of brands) {
        try {
          const trucksResponse = await fetch(`${BASE_URL}/api/foodtrucks/brand/${brand.id}`);
          const trucks = await trucksResponse.json();
          
          // Add brand info to each truck
          const trucksWithBrand = trucks.map(truck => ({
            ...truck,
            brandName: brand.brandName,
            brand: brand
          }));
          allTrucks = [...allTrucks, ...trucksWithBrand];

          // Count menu items for approved trucks
          for (const truck of trucks) {
            if (truck.applicationStatus === 'APPROVED') {
              try {
                const menuResponse = await fetch(`${BASE_URL}/api/menuitems/foodtruck/${truck.id}`);
                const menuItems = await menuResponse.json();
                totalMenuItems += menuItems.length;
              } catch (err) {
                console.error('Error fetching menu items:', err);
              }
            }
          }
        } catch (err) {
          console.error('Error fetching trucks for brand:', brand.id, err);
        }
      }

      // Calculate stats
      const pendingTrucks = allTrucks.filter(t => 
        t.applicationStatus === 'SUBMITTED' || t.applicationStatus === 'IN_REVIEW'
      );

      setStats({
        brands: brands.length,
        trucks: allTrucks.length,
        menuItems: totalMenuItems,
        pendingApprovals: pendingTrucks.length
      });

      // Get recent trucks (last 3)
      setRecentTrucks(allTrucks.slice(0, 3));

    } catch (err) {
      console.error('Error fetching vendor data:', err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#2e7d32';
      case 'REJECTED': return '#c62828';
      case 'IN_REVIEW': return '#1565c0';
      default: return '#e65100';
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-badge">Vendor Dashboard</div>
        <h1 className="hero-title">
          Manage Your <span className="highlight">Food Truck</span> Business
        </h1>
        <p className="hero-subtitle">
          Brands, trucks, and menus — all in one place.
        </p>
        <div className="hero-buttons">
          <button onClick={() => setActiveSection('brands')} className="primary">
            <Users className="btn-icon" />
            Manage Brands
          </button>
          <button onClick={() => setActiveSection('trucks')} className="secondary">
            <Truck className="btn-icon" />
            View Trucks
          </button>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="stats-section">
        <h2>Quick Overview</h2>
        <div className="stats-grid">
          <div className="stat-item" onClick={() => setActiveSection('brands')}>
            <div className="stat-value">{loading ? '...' : stats.brands}</div>
            <div className="stat-label">Active Brands</div>
          </div>
          <div className="stat-item" onClick={() => setActiveSection('trucks')}>
            <div className="stat-value">{loading ? '...' : stats.trucks}</div>
            <div className="stat-label">Food Trucks</div>
          </div>
          <div className="stat-item" onClick={() => setActiveSection('menu')}>
            <div className="stat-value">{loading ? '...' : stats.menuItems}</div>
            <div className="stat-label">Menu Items</div>
          </div>
          <div className="stat-item pending">
            <div className="stat-value">{loading ? '...' : stats.pendingApprovals}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
        </div>
      </div>

      {/* Recent Trucks Section */}
      {recentTrucks.length > 0 && (
        <div className="recent-section">
          <div className="recent-header">
            <h2>Your Food Trucks</h2>
            <button 
              className="view-all-btn"
              onClick={() => setActiveSection('trucks')}
            >
              View All <ChevronRight className="icon" />
            </button>
          </div>
          <div className="recent-trucks-grid">
            {recentTrucks.map(truck => (
              <div key={truck.id} className="recent-truck-card">
                <div className="truck-card-header">
                  <span className="brand-tag">{truck.brandName}</span>
                  <span 
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(truck.applicationStatus) }}
                    title={truck.applicationStatus}
                  />
                </div>
                <h3>{truck.operatingRegion}</h3>
                <div className="truck-card-info">
                  <span><MapPin className="mini-icon" /> {truck.location}</span>
                </div>
                <div className="truck-card-status">
                  <Clock className="mini-icon" />
                  <span>{truck.applicationStatus.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="features-grid">
        <div className="feature-card" onClick={() => setActiveSection('brands')}>
          <Users className="feature-icon" />
          <h3>Brand Management</h3>
          <p>Create and manage multiple brands under your vendor account. Each brand can have its own identity and food trucks.</p>
        </div>
        <div className="feature-card" onClick={() => setActiveSection('trucks')}>
          <Truck className="feature-icon" />
          <h3>Fleet Control</h3>
          <p>Monitor and manage your food trucks, track locations, and oversee operations across all your mobile units.</p>
        </div>
        <div className="feature-card" onClick={() => setActiveSection('menu')}>
          <Menu className="feature-icon" />
          <h3>Menu System</h3>
          <p>Design and update menus for each food truck with pricing, categories, and detailed item descriptions.</p>
        </div>
      </div>
    </div>
  );
};

export default VendorScreen;
