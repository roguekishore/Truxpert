import React, { useState, useEffect } from 'react';

const EditUserModal = ({ user, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'ADMIN',
    phoneNumber: '',
    address: ''
  });

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'ADMIN',
        phoneNumber: user.phoneNumber || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data based on user type
    let updateData = {
      name: formData.name,
      email: formData.email
    };

    if (user.userType === 'vendor') {
      // For vendors, include additional fields but not role
      updateData.phoneNumber = formData.phoneNumber;
      updateData.address = formData.address;
    } else {
      // For regular users, include role
      updateData.role = formData.role;
    }

    onUserUpdated(updateData);
  };

  // Don't render if user is not provided
  if (!user) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit {user.userType === 'vendor' ? 'Vendor' : 'User'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          {user.userType === 'vendor' ? (
            // Vendor-specific fields
            <>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </>
          ) : (
            // Regular user role field
            <div className="form-group">
              <label>Role:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="ADMIN">Admin</option>
                <option value="INSPECTOR">Inspector</option>
                <option value="REVIEWER">Reviewer</option>
              </select>
            </div>
          )}
          
          <div className="modal-actions">
            <button type="submit">Update {user.userType === 'vendor' ? 'Vendor' : 'User'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
