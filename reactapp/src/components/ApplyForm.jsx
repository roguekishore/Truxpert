import React, { useState } from 'react';
import './ApplyForm.css'
const ApplyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    cuisineSpecialties: '',
    operatingRegion: '',
    menuHighlights: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.cuisineSpecialties.trim()) {
      newErrors.cuisineSpecialties = 'Cuisine Specialties are required';
    }
    
    if (!formData.operatingRegion.trim()) {
      newErrors.operatingRegion = 'Operating Region is required';
    }
    
    if (!formData.menuHighlights.trim()) {
      newErrors.menuHighlights = 'Menu Highlights are required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();

    const BASE_URL = process.env.REACT_APP_URL;
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/addVendor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({
          name: '',
          cuisineSpecialties: '',
          operatingRegion: '',
          menuHighlights: '',
          phoneNumber: '',
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  return (
    <div className='applyForm-container'>
      <h2>Apply to Become a Food Truck Vendor</h2>
      <form onSubmit={handleSubmit}>
        <div className='applyForm-form-group'>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className='applyForm-error'>{errors.name}</span>}
        </div>

        <div className='applyForm-form-group'>
          <label htmlFor="cuisineSpecialties">Cuisine Specialties:</label>
          <input
            type="text"
            id="cuisineSpecialties"
            name="cuisineSpecialties"
            value={formData.cuisineSpecialties}
            onChange={handleChange}
          />
          {errors.cuisineSpecialties && <span className='applyForm-error'>{errors.cuisineSpecialties}</span>}
        </div>

        <div className='applyForm-form-group'>
          <label htmlFor="operatingRegion">Operating Region:</label>
          <input
            type="text"
            id="operatingRegion"
            name="operatingRegion"
            value={formData.operatingRegion}
            onChange={handleChange}
          />
          {errors.operatingRegion && <span className='applyForm-error'>{errors.operatingRegion}</span>}
        </div>

        <div className='applyForm-form-group'>
          <label htmlFor="menuHighlights">Menu Highlights:</label>
          <input
            type="text"
            id="menuHighlights"
            name="menuHighlights"
            value={formData.menuHighlights}
            onChange={handleChange}
          />
          {errors.menuHighlights && <span className='applyForm-error'>{errors.menuHighlights}</span>}
        </div>

        <div className='applyForm-form-group'>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          {errors.phoneNumber && <span className='applyForm-error'>{errors.phoneNumber}</span>}
        </div>

        <button className='apply-form-button' type="submit">Submit Application</button>
      </form>

      {showSuccessModal && (
        <div className='applyForm-success-modal'>
          <p>Application submitted successfully!</p>
          <button onClick={() => setShowSuccessModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ApplyForm;
