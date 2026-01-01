import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FormModal from './FormModal';
import DynamicForm from './DynamicForm';
import { useApi } from '../context/ApiContext';
import '../css/MenuSection.css'
const MenuSection = ({ foodTruck, onBack }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { getMenuItemsByFoodTruck, createMenuItem, updateMenuItem, deleteMenuItem } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getMenuItemsByFoodTruck(foodTruck.id);
      setMenuItems(items);
    } catch (err) {
      setError('Failed to fetch menu items.');
      console.error('Failed to fetch menu items:', err);
    } finally {
      setLoading(false);
    }
  }, [getMenuItemsByFoodTruck, foodTruck.id]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleCreateMenuItem = async (formData) => {
    setLoading(true);
    try {
      const newItem = await createMenuItem(foodTruck.id, formData);
      setMenuItems(prev => [...prev, newItem]);
      setShowMenuItemForm(false);
      // Refresh the menu items list to ensure latest data
      await fetchMenuItems();
    } catch (err) {
      setError('Failed to create menu item.');
      console.error('Failed to create menu item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMenuItem = async (formData) => {
    setLoading(true);
    try {
      const updatedItem = await updateMenuItem(currentMenuItem.id, formData);
      
      // Update the local state immediately
      setMenuItems(prev => prev.map(item =>
        item.id === currentMenuItem.id ? updatedItem : item
      ));
      
      // Close the form and clear current item
      setShowMenuItemForm(false);
      setCurrentMenuItem(null);
      setIsEditing(false);
      
      // Refresh the menu items list to ensure latest data from server
      await fetchMenuItems();
    } catch (err) {
      setError('Failed to update menu item.');
      console.error('Failed to update menu item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      setLoading(true);
      try {
        await deleteMenuItem(itemId);
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
      } catch (err) {
        setError('Failed to delete menu item.');
        console.error('Failed to delete menu item:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (item) => {
    setCurrentMenuItem(item);
    setIsEditing(true);
    setShowMenuItemForm(true);
  };

  return (
    <div className="menu-items-container">
      <button onClick={onBack} className="back-btn">Back to Food Trucks</button>
      <div className="menu-items-header">
        <h2>Menu Items for Food Truck in {foodTruck.location}</h2>
        <button
          onClick={() => {
            setCurrentMenuItem(null);
            setIsEditing(false);
            setShowMenuItemForm(true);
          }}
          className="add-menu-item-btn"
          disabled={loading}
        >
          <Plus className="icon" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading menu items...</div>
      ) : (
        <div className="menu-items-grid">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-item-card">
              <div className="menu-item-content">
                <h3>{item.name}</h3>
                <p>Price: ${item.price}</p>
                <div className='menu-item-description'><p>Description: {item.description}</p></div>
                <div className="menu-item-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditClick(item)}
                    disabled={loading}
                  >
                    <Edit className="icon" />
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteMenuItem(item.id)}
                    disabled={loading}
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
        title={isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
        isOpen={showMenuItemForm}
        onClose={() => {
          setShowMenuItemForm(false);
          setCurrentMenuItem(null);
          setIsEditing(false);
        }}
      >
        <DynamicForm
          entityType="menuItem"
          initialData={currentMenuItem || {}}
          onSubmit={isEditing ? handleUpdateMenuItem : handleCreateMenuItem}
          onCancel={() => {
            setShowMenuItemForm(false);
            setCurrentMenuItem(null);
            setIsEditing(false);
          }}
          submitButtonText={isEditing ? 'Update Menu Item' : 'Create Menu Item'}
          isEditing={isEditing}
        />
      </FormModal>
    </div>
  );
};

export default MenuSection;