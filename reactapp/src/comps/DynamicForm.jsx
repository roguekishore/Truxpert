import React, { useState, useEffect } from 'react';
import { Truck, Users, Menu, MapPin, Plus, FileText, Trash2, Upload } from 'lucide-react';
import '../css/DynamicForm.css';

const DynamicForm = ({
  entityType,
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  isEditing = false, // Add this prop to distinguish between create and edit
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState([]);
  const loading = false; 
  
  const formConfigs = {
    brand: {
      title: 'Brand Form',
      icon: <Users />,
      fields: [
        {
          name: 'brandName',
          label: 'Brand Name',
          type: 'text',
          required: true,
          placeholder: 'Enter brand name',
        }
      ],
    },
    foodTruck: {
      title: 'Food Truck Registration',
      icon: <Truck />,
      fields: [
        {
          name: 'operatingRegion',
          label: 'Operating Region',
          type: 'text',
          required: true,
          placeholder: 'Enter operating region',
        },
        {
          name: 'location',
          label: 'Current Location',
          type: 'text',
          required: false,
          placeholder: 'Enter current location',
          icon: <MapPin />,
        },
        {
          name: 'cuisineSpecialties',
          label: 'Cuisine Specialties',
          type: 'text',
          required: false,
          placeholder: 'Enter specialties (e.g., Mexican, Italian)',
        },
        {
          name: 'menuHighlights',
          label: 'Menu Highlights',
          type: 'textarea',
          required: false,
          placeholder: 'Describe your signature dishes and popular items',
        },
      ],
      hasDocuments: true,
    },
    menuItem: {
      title: 'Menu Item Form',
      icon: <Menu />,
      fields: [
        {
          name: 'name',
          label: 'Item Name',
          type: 'text',
          required: true,
          placeholder: 'Enter item name',
        },
        {
          name: 'price',
          label: 'Price',
          type: 'number',
          required: true,
          placeholder: 'Enter price',
          min: 0,
          step: 0.01,
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
          placeholder: 'Enter item description',
        }
      ],
    },
  };

  const config = formConfigs[entityType] || {
    title: 'Form',
    fields: [],
  };

  useEffect(() => {
    const initialFormData = {};
    config.fields.forEach((field) => {
      if (field.required && !initialData[field.name]) {
        initialFormData[field.name] = '';
      }
    });
    setFormData({ ...initialFormData, ...initialData });
    
    // Clear any previous errors when form data changes
    setErrors({});

    // Initialize with one empty document for food truck forms only when creating
    if (entityType === 'foodTruck' && !isEditing && documents.length === 0) {
      setDocuments([{ documentName: '', filePath: '' }]);
    } else if (isEditing) {
      // Clear documents for editing
      setDocuments([]);
    }
  }, [entityType, initialData, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Document management functions
  const generateFilePath = (documentName) => {
    if (!documentName) return '';
    const sanitizedName = documentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const timestamp = new Date().getTime();
    return `/uploads/documents/${sanitizedName}_${timestamp}.pdf`;
  };

  const handleDocumentChange = (index, field, value) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index][field] = value;
    
    // Auto-generate file path when document name changes
    if (field === 'documentName') {
      updatedDocuments[index].filePath = generateFilePath(value);
    }
    
    setDocuments(updatedDocuments);
    
    // Clear document-related errors
    if (errors[`document_${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`document_${index}_${field}`];
      setErrors(newErrors);
    }
  };

  const addDocument = () => {
    setDocuments([...documents, { documentName: '', filePath: '' }]);
  };

  const removeDocument = (index) => {
    if (documents.length > 1) {
      const updatedDocuments = documents.filter((_, i) => i !== index);
      setDocuments(updatedDocuments);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate regular form fields
    config.fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    // Validate documents for food truck forms only when creating (not editing)
    if (entityType === 'foodTruck' && !isEditing) {
      documents.forEach((doc, index) => {
        if (!doc.documentName.trim()) {
          newErrors[`document_${index}_documentName`] = 'Document name is required';
        }
      });

      // Ensure at least one document
      if (documents.length === 0 || documents.every(doc => !doc.documentName.trim())) {
        newErrors.documents = 'At least one document is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submission - isEditing:', isEditing, 'entityType:', entityType);
    console.log('Form data before validation:', formData);
    
    if (validateForm()) {
      if (entityType === 'foodTruck') {
        if (isEditing) {
          // For editing, send only the food truck data without documents
          console.log('Submitting food truck update data:', formData);
          onSubmit(formData);
        } else {
          // For creation, create the DTO structure with documents
          const foodTruckData = {
            foodTruck: formData,
            vendorId: localStorage.getItem('userId'), // Get from localStorage
            documents: documents
              .filter(doc => doc.documentName.trim()) // Only include documents with names
              .map(doc => [doc.documentName, doc.filePath])
          };
          console.log('Submitting food truck creation data:', foodTruckData);
          onSubmit(foodTruckData);
        }
      } else {
        console.log('Submitting form data:', formData);
        onSubmit(formData);
      }
    } else {
      console.log('Form validation failed');
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <span className="header-icon">{config.icon}</span>
        <h2 className="form-title">{config.title}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="form-body">
        {/* Regular form fields */}
        {config.fields.map((field) => (
          <div key={field.name} className="form-field-group">
            <label htmlFor={field.name} className="form-label">
              {field.label}
              {field.required && <span className="required-star"> *</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder}
                rows={3}
                className={`form-input form-textarea ${
                  errors[field.name] ? 'input-error' : ''
                }`}
              />
            ) : (
              <div className="input-with-icon">
                {field.icon && (
                  <span className="input-icon">
                    {field.icon}
                  </span>
                )}
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  min={field.min}
                  step={field.step}
                  className={`form-input ${
                    field.icon ? 'has-icon' : ''
                  } ${errors[field.name] ? 'input-error' : ''}`}
                />
              </div>
            )}
            
            {errors[field.name] && (
              <p className="error-message">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Document section for food truck forms - only show for creation or when explicitly requested */}
        {config.hasDocuments && !isEditing && (
          <div className="documents-section">
            <div className="documents-header">
              <h3 className="documents-title">
                <FileText className="documents-icon" />
                Required Documents
              </h3>
              <button
                type="button"
                onClick={addDocument}
                className="add-document-btn"
              >
                <Plus size={16} />
                Add Document
              </button>
            </div>

            {errors.documents && (
              <p className="error-message">{errors.documents}</p>
            )}

            <div className="documents-list">
              {documents.map((document, index) => (
                <div key={index} className="document-item">
                  <div className="document-item-header">
                    <span className="document-number">Document {index + 1}</span>
                    {documents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="remove-document-btn"
                        title="Remove document"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="document-fields">
                    <div className="form-field-group">
                      <label className="form-label">
                        Document Name <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        value={document.documentName}
                        onChange={(e) => handleDocumentChange(index, 'documentName', e.target.value)}
                        placeholder="e.g., Business License, Health Permit"
                        className={`form-input ${
                          errors[`document_${index}_documentName`] ? 'input-error' : ''
                        }`}
                      />
                      {errors[`document_${index}_documentName`] && (
                        <p className="error-message">{errors[`document_${index}_documentName`]}</p>
                      )}
                    </div>

                    <div className="form-field-group">
                      <label className="form-label">File Path</label>
                      <div className="file-path-container">
                        <Upload className="file-path-icon" />
                        <input
                          type="text"
                          value={document.filePath}
                          onChange={(e) => handleDocumentChange(index, 'filePath', e.target.value)}
                          placeholder="Auto-generated file path"
                          className="form-input file-path-input"
                          readOnly
                        />
                      </div>
                      <p className="file-path-hint">
                        File path is auto-generated based on document name
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="button button-secondary"
              disabled={loading}
            >
              {cancelButtonText}
            </button>
          )}
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : (
              <span className="button-content">
                <span className="button-icon"><Plus /></span>
                {submitButtonText}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;
