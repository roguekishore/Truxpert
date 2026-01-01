import React, { useState } from 'react';
import VendorScreen from '../comps/VendorScreen';
import BrandsSection from '../comps/BrandsSection';
import FoodTrucksSection from '../comps/TrucksSection';
import AllTrucksSection from '../comps/AllTrucksSection';
import MenuItemsSection from '../comps/MenuSection';
import VendorNavigation from '../navigation/VendorNavigation';
import { ApiProvider } from '../context/ApiContext';
// import './App.css';

const FoodTruckVendorApp = ({ user, onLogout, onProfileUpdate }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedFoodTruck, setSelectedFoodTruck] = useState(null);

  const handleNavLinkClick = (section) => {
    setActiveSection(section);
    // Only reset selections when navigating away completely
    if (section === 'home') {
      setSelectedBrand(null);
      setSelectedFoodTruck(null);
    }
  };

  const handleLogout = () => {
    // Reset local state
    setActiveSection('home');
    setSelectedBrand(null);
    setSelectedFoodTruck(null);
    
    // Call parent logout handler
    onLogout();
  };

  // Navigate to a specific brand's trucks (from all trucks view or brands)
  const handleSelectBrandForTrucks = (brand) => {
    setSelectedBrand(brand);
    setSelectedFoodTruck(null);
    setActiveSection('brands'); // Switch to brands context
  };

  // Navigate to menu from any truck selection
  const handleSelectTruckForMenu = (truck, brand = null) => {
    setSelectedFoodTruck(truck);
    if (brand) setSelectedBrand(brand);
  };

  // Back navigation handlers
  const handleBackFromTrucks = () => {
    setSelectedBrand(null);
    setSelectedFoodTruck(null);
  };

  const handleBackFromMenu = () => {
    setSelectedFoodTruck(null);
  };

  const renderContent = () => {
    // If a food truck is selected, show its menu
    if (selectedFoodTruck) {
      return (
        <MenuItemsSection
          foodTruck={selectedFoodTruck}
          onBack={handleBackFromMenu}
        />
      );
    }

    // If a brand is selected, show its trucks
    if (selectedBrand) {
      return (
        <FoodTrucksSection
          brand={selectedBrand}
          onSelectFoodTruck={handleSelectTruckForMenu}
          onBack={handleBackFromTrucks}
        />
      );
    }

    // Otherwise render based on active section
    switch (activeSection) {
      case 'home':
        return (
          <VendorScreen 
            setActiveSection={setActiveSection} 
            onSelectBrand={setSelectedBrand}
          />
        );
      case 'brands':
        return <BrandsSection onSelectBrand={setSelectedBrand} />;
      case 'trucks':
        return (
          <AllTrucksSection 
            onSelectFoodTruck={handleSelectTruckForMenu}
            onSelectBrand={handleSelectBrandForTrucks}
          />
        );
      case 'menu':
        return (
          <AllTrucksSection 
            onSelectFoodTruck={handleSelectTruckForMenu}
            onSelectBrand={handleSelectBrandForTrucks}
            viewMode="menu"
          />
        );
      default:
        return (
          <VendorScreen 
            setActiveSection={setActiveSection}
            onSelectBrand={setSelectedBrand} 
          />
        );
    }
  };

  return (
    <ApiProvider>
      <div>
        <VendorNavigation
          activeSection={activeSection}
          setActiveSection={handleNavLinkClick}
          onLogout={handleLogout}
          onProfileUpdate={onProfileUpdate}
          user={user}
        />
        <div className='app-wrapper'>
          <div className="app-container">
            {renderContent()}
          </div>
        </div>
      </div>
    </ApiProvider>
  );
};

export default FoodTruckVendorApp;