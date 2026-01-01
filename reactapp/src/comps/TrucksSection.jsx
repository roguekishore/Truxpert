import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Menu, ArrowLeft, AlertCircle } from 'lucide-react';
import FormModal from './FormModal';
import DynamicForm from './DynamicForm';
import StatusBadge from './StatusBadge';
import { useApi } from '../context/ApiContext';
import '../css/TrucksSection.css';

const TrucksSection = ({ brand, onSelectFoodTruck, onBack }) => {
  const [foodTrucks, setFoodTrucks] = useState([]);
  const [showTruckForm, setShowTruckForm] = useState(false);
  const [currentTruck, setCurrentTruck] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    getFoodTrucksByBrand, 
    createFoodTruck, 
    updateFoodTruck, 
    deleteFoodTruck
  } = useApi();

  const fetchFoodTrucks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trucks = await getFoodTrucksByBrand(brand.id);
      setFoodTrucks(trucks);
    } catch (err) {
      setError('Failed to fetch food trucks.');
      console.error('Failed to fetch food trucks:', err);
    } finally {
      setLoading(false);
    }
  }, [getFoodTrucksByBrand, brand.id]);

  useEffect(() => {
    fetchFoodTrucks();
  }, [fetchFoodTrucks]);

  const isApproved = (truck) => {
    return truck.applicationStatus === 'APPROVED';
  };

  const getStatusMessage = (truck) => {
    switch (truck.applicationStatus) {
      case 'SUBMITTED':
        return 'Application submitted - waiting for review';
      case 'IN_REVIEW':
        return 'Application under review';
      case 'APPROVED':
        return 'Application approved - all features available';
      case 'REJECTED':
        return 'Application rejected - contact support';
      default:
        return 'Status unknown';
    }
  };

  const handleCreateTruck = async (formData) => {
    setLoading(true);
    try {
      const newTruck = await createFoodTruck(brand.id, formData);
      setFoodTrucks(prev => [...prev, newTruck]);
      setShowTruckForm(false);
      // Refresh the food trucks list to ensure latest data
      await fetchFoodTrucks();
    } catch (err) {
      setError('Failed to create food truck.');
      console.error('Failed to create food truck:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTruck = async (formData) => {
    if (!isApproved(currentTruck)) {
      setError('Cannot edit food truck until application is approved.');
      return;
    }
    
    console.log('TrucksSection - updating truck:', currentTruck.id, 'with data:', formData);
    setLoading(true);
    try {
      const updatedTruck = await updateFoodTruck(currentTruck.id, formData);
      console.log('TrucksSection - update successful:', updatedTruck);
      
      // Update the local state immediately
      setFoodTrucks(prev => prev.map(truck =>
        truck.id === currentTruck.id ? updatedTruck : truck
      ));
      
      // Close the form and clear current truck
      setShowTruckForm(false);
      setCurrentTruck(null);
      setIsEditing(false);
      
      // Refresh the food trucks list to ensure latest data from server
      await fetchFoodTrucks();
    } catch (err) {
      console.error('TrucksSection - update failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update food truck.';
      setError(`Failed to update food truck: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTruck = async (truck) => {
    if (!isApproved(truck)) {
      setError('Cannot delete food truck until application is approved.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this food truck?')) {
      setLoading(true);
      try {
        await deleteFoodTruck(truck.id);
        setFoodTrucks(prev => prev.filter(t => t.id !== truck.id));
      } catch (err) {
        setError('Failed to delete food truck.');
        console.error('Failed to delete food truck:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (truck) => {
    if (!isApproved(truck)) {
      setError('Cannot edit food truck until application is approved.');
      return;
    }
    setCurrentTruck(truck);
    setIsEditing(true);
    setShowTruckForm(true);
  };

  const handleViewMenu = (truck) => {
    if (!isApproved(truck)) {
      setError('Cannot view menu until food truck application is approved.');
      return;
    }
    onSelectFoodTruck(truck);
  };

  return (
    <div className="trucks-container">
      <div className="trucks-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeft className="icon" />
          Back to Brands
        </button>
        <h2>Food Trucks for {brand.brandName}</h2>
        <button
          onClick={() => {
            setCurrentTruck(null);
            setIsEditing(false);
            setShowTruckForm(true);
          }}
          className="add-truck-btn"
          disabled={loading}
        >
          <Plus className="icon" />
          <span>Add Food Truck</span>
        </button>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle className="icon" />
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      {loading && !foodTrucks.length ? (
        <div className="loading">Loading food trucks...</div>
      ) : (
        <div className="trucks-grid">
          {foodTrucks.map((truck) => (
            <div key={truck.id} className={`truck-card ${!isApproved(truck) ? 'truck-disabled' : ''}`}>
              <div className="truck-content">
                <div className="truck-header">
                  <h3>{truck.operatingRegion}</h3>
                  <StatusBadge status={truck.applicationStatus} />
                </div>
                
                <div className="truck-details">
                  <p><strong>Location:</strong> {truck.location}</p>
                  <p><strong>Cuisine:</strong> {truck.cuisineSpecialties}</p>
                  <p><strong>Highlights:</strong> {truck.menuHighlights}</p>
                </div>

                <div className="status-info">
                  <p className={`status-message ${truck.applicationStatus.toLowerCase()}`}>
                    {getStatusMessage(truck)}
                  </p>
                </div>

                <div className="truck-actions">
                  <button
                    className={`view-menu-btn ${!isApproved(truck) ? 'disabled' : ''}`}
                    onClick={() => handleViewMenu(truck)}
                    disabled={!isApproved(truck) || loading}
                    title={!isApproved(truck) ? 'Available after approval' : 'View menu items'}
                  >
                    <Menu className="icon" />
                    View Menu
                  </button>
                  <button
                    className={`edit-btn ${!isApproved(truck) ? 'disabled' : ''}`}
                    onClick={() => handleEditClick(truck)}
                    disabled={!isApproved(truck) || loading}
                    title={!isApproved(truck) ? 'Available after approval' : 'Edit food truck'}
                  >
                    <Edit className="icon" />
                    Edit
                  </button>
                  <button
                    className={`delete-btn ${!isApproved(truck) ? 'disabled' : ''}`}
                    onClick={() => handleDeleteTruck(truck)}
                    disabled={!isApproved(truck) || loading}
                    title={!isApproved(truck) ? 'Available after approval' : 'Delete food truck'}
                  >
                    <Trash2 className="icon" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormModal
        title={isEditing ? 'Edit Food Truck' : 'Add New Food Truck'}
        isOpen={showTruckForm}
        onClose={() => {
          setShowTruckForm(false);
          setCurrentTruck(null);
          setIsEditing(false);
        }}
      >
        <DynamicForm
          entityType="foodTruck"
          initialData={currentTruck || {}}
          onSubmit={isEditing ? handleUpdateTruck : handleCreateTruck}
          onCancel={() => {
            setShowTruckForm(false);
            setCurrentTruck(null);
            setIsEditing(false);
          }}
          submitButtonText={isEditing ? 'Update Food Truck' : 'Create Food Truck'}
          isEditing={isEditing}
        />
      </FormModal>
    </div>
  );
};

export default TrucksSection;