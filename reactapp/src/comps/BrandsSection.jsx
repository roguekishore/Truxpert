import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import FormModal from './FormModal';
import DynamicForm from './DynamicForm';
import { useApi } from '../context/ApiContext';
import bg from '../images/tr.jpg';
import '../css/BrandsSection.css';

const BrandsSection = ({ onSelectBrand }) => {
  const [brands, setBrands] = useState([]);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { getBrandsByVendor, createBrand, updateBrand, deleteBrand } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const vendorId = localStorage.getItem('userId');
      if (!vendorId) throw new Error('No vendor ID found');
      const vendorBrands = await getBrandsByVendor(vendorId);
      setBrands(vendorBrands);
    } catch (err) {
      setError('Failed to fetch brands.');
      console.error('Failed to fetch brands:', err);
    } finally {
      setLoading(false);
    }
  }, [getBrandsByVendor]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleCreateBrand = async (formData) => {
    setLoading(true);
    try {
      const vendorId = localStorage.getItem('userId');
      if (!vendorId) throw new Error('No vendor ID found');
      const newBrand = await createBrand(vendorId, formData);
      setBrands(prev => [...prev, newBrand]);
      setShowBrandForm(false);
    } catch (err) {
      setError('Failed to create brand.');
      console.error('Failed to create brand:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBrand = async (formData) => {
    setLoading(true);
    try {
      const updatedBrand = await updateBrand(currentBrand.id, formData);
      setBrands(prev => prev.map(brand =>
        brand.id === currentBrand.id ? updatedBrand : brand
      ));
      setShowBrandForm(false);
      setCurrentBrand(null);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update brand.');
      console.error('Failed to update brand:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      setLoading(true);
      try {
        await deleteBrand(brandId);
        setBrands(prev => prev.filter(brand => brand.id !== brandId));
      } catch (err) {
        setError('Failed to delete brand.');
        console.error('Failed to delete brand:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (brand) => {
    setCurrentBrand(brand);
    setIsEditing(true);
    setShowBrandForm(true);
  };

  return (
    <div className="brands-container">
      <div className="brands-header">
        <h2>Your Brands</h2>
        <button
          onClick={() => {
            setCurrentBrand(null);
            setIsEditing(false);
            setShowBrandForm(true);
          }}
          className="add-brand-btn"
          disabled={loading}
        >
          <Plus className="icon" />
          <span>Add Brand</span>
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && !brands.length ? (
        <div className="loading">Loading brands...</div>
      ) : (
        <div className="brands-grid">
          {brands.map((brand) => (
            <div key={brand.id} className="brand-card">
              <div 
            className="brand-header"
            style={{ 
              backgroundImage: {bg}
                ? `url(${bg})`
                : 'linear-gradient(135deg, #ff6d00, #ff9e00)'
            }}
          >
          </div>
              <div className="brand-content">
                <h3>{brand.brandName}</h3>
                <div className="brand-actions">
                  <button
                    className="view-trucks-btn"
                    onClick={() => onSelectBrand(brand)}
                    disabled={loading}
                  >
                    <Truck className="icon" />
                    View Trucks
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditClick(brand)}
                    disabled={loading}
                  >
                    <Edit className="icon" />
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteBrand(brand.id)}
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
        title={isEditing ? 'Edit Brand' : 'Add New Brand'}
        isOpen={showBrandForm}
        onClose={() => {
          setShowBrandForm(false);
          setCurrentBrand(null);
          setIsEditing(false);
        }}
      >
        <DynamicForm
          entityType="brand"
          initialData={currentBrand || {}}
          onSubmit={isEditing ? handleUpdateBrand : handleCreateBrand}
          onCancel={() => {
            setShowBrandForm(false);
            setCurrentBrand(null);
            setIsEditing(false);
          }}
          submitButtonText={isEditing ? 'Update Brand' : 'Create Brand'}
        />
      </FormModal>
    </div>
  );
};

export default BrandsSection;