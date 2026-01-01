import React, { createContext, useContext } from 'react';
import axios from 'axios';

const ApiContext = createContext(null);
const BASE_URL = process.env.REACT_APP_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ApiProvider = ({ children }) => {
  // Utility function to get the vendor ID from localStorage
  const getVendorId = () => {
    const vendorId = localStorage.getItem('vendorId');
    if (!vendorId) {
      throw new Error('Vendor ID not found in localStorage.');
    }
    return vendorId;
  };

  // --- Vendor Endpoints ---
  const createVendor = async (data) => api.post('/vendors', data);
  const getVendorById = async (id) => api.get(`/vendors/${id}`);
  const updateVendor = async (id, data) => api.put(`/vendors/${id}`, data);
  const deleteVendor = async (id) => api.delete(`/vendors/${id}`);

  // --- User Endpoints ---
  const createUser = async (data) => api.post('/users', data);
  const loginUser = async (credentials) => api.post('/users/login', credentials);
  const getUserById = async (id) => api.get(`/users/${id}`);
  const updateUser = async (id, data) => api.put(`/users/${id}`, data);
  const deleteUser = async (id) => api.delete(`/users/${id}`);

  // --- Brand Endpoints ---
  const getBrandsByVendor = async (vendorId) => {
    try {
      const response = await api.get(`/brands/vendor/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching brands by vendor ID:', error);
      throw error;
    }
  };

  const createBrand = async (vendorId, data) => {
    try {
      const response = await api.post(`/brands/${vendorId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  };
  
  const updateBrand = async (brandId, data) => api.put(`/brands/${brandId}`, data);
  const deleteBrand = async (brandId) => api.delete(`/brands/${brandId}`);

  // --- Food Truck Endpoints ---
  const getFoodTrucksByBrand = async (brandId) => {
    const response = await api.get(`/foodtrucks/brand/${brandId}`);
    return response.data;
  };
  
  const createFoodTruck = async (brandId, data) => {
    const response = await api.post(`/foodtrucks/${brandId}`, data);
    return response.data;
  };
  
  const updateFoodTruck = async (foodTruckId, data) => {
    try {
      console.log('ApiContext - updating food truck:', foodTruckId, 'with data:', data);
      const response = await api.put(`/foodtrucks/${foodTruckId}`, data);
      console.log('ApiContext - update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ApiContext - update food truck error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  };
  const deleteFoodTruck = async (foodTruckId) => api.delete(`/foodtrucks/${foodTruckId}`);

  // --- Application Endpoints ---
  const getApplicationByFoodTruckId = async (foodTruckId) => {
    const response = await api.get(`/applications/foodtruck/${foodTruckId}`);
    return response.data;
  };

  const updateApplicationStatus = async (applicationId, status) => {
    const response = await api.put(`/applications/${applicationId}/status`, { status });
    return response.data;
  };

  // --- Menu Item Endpoints ---
  const getMenuItemsByFoodTruck = async (foodTruckId) => {
    const response = await api.get(`/menuitems/foodtruck/${foodTruckId}`);
    return response.data;
  };
  
  const createMenuItem = async (foodTruckId, data) => {
    const response = await api.post(`/menuitems/${foodTruckId}`, data);
    return response.data;
  };
  
  const updateMenuItem = async (menuItemId, data) => {
    const response = await api.put(`/menuitems/${menuItemId}`, data);
    return response.data;
  };
  const deleteMenuItem = async (menuItemId) => api.delete(`/menuitems/${menuItemId}`);
  

  const apiFunctions = {
    // Vendor
    createVendor,
    getVendorById,
    updateVendor,
    deleteVendor,

    // User
    createUser,
    loginUser,
    getUserById,
    updateUser,
    deleteUser,

    // Brand
    getBrandsByVendor,
    createBrand,
    updateBrand,
    deleteBrand,
    
    // Food Truck
    getFoodTrucksByBrand,
    createFoodTruck,
    updateFoodTruck,
    deleteFoodTruck,

    // Application
    getApplicationByFoodTruckId,
    updateApplicationStatus,
    
    // Menu Item
    getMenuItemsByFoodTruck,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };

  return (
    <ApiContext.Provider value={apiFunctions}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};