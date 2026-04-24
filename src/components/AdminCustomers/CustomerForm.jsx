import React from 'react';
import './CustomerForm.css';

const CustomerForm = ({ 
  mode, 
  customer, 
  onChange, 
  onSave, 
  onCancel, 
  errors, 
  loading 
}) => {
  const isEdit = mode === 'edit';

  const handleInputChange = (field, value) => {
    onChange({
      ...customer,
      [field]: value
    });
  };

  const handleCheckboxChange = (checked) => {
    onChange({
      ...customer,
      is_active: checked
    });
  };

  return (
    <div className="customer-form">
      {/* Header */}
      <div className="customer-form-header">
        <button className="back-button" onClick={onCancel}>
          ← Back
        </button>
        <h1>{isEdit ? 'Edit Customer' : 'Add New Customer'}</h1>
      </div>

      {/* Form Content */}
      <div className="form-container">
        {errors.general && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            {errors.general}
          </div>
        )}

        <div className="form-sections">
          {/* Personal Information */}
          <div className="form-section">
            <div className="section-title">
              <span className="section-icon">👤</span>
              <h2>Personal Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={customer?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter full name"
                  disabled={loading}
                />
                {errors.name && <span className="field-error">{errors.name[0]}</span>}
              </div>

              <div className="form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={customer?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter email address"
                  disabled={loading}
                />
                {errors.email && <span className="field-error">{errors.email[0]}</span>}
              </div>

              <div className="form-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={customer?.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>

              {isEdit && (
                <div className="form-field">
                  <label>Account Status</label>
                  <div className="toggle-field">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={customer?.is_active || false}
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                        className="toggle-input"
                        disabled={loading}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">
                        {customer?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                    <small className="toggle-help">Inactive accounts cannot login</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <div className="section-title">
              <span className="section-icon">📍</span>
              <h2>Address Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-field full-width">
                <label>Street Address</label>
                <input
                  type="text"
                  value={customer?.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter street address"
                  disabled={loading}
                />
              </div>

              <div className="form-field">
                <label>City</label>
                <input
                  type="text"
                  value={customer?.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                  disabled={loading}
                />
              </div>

              <div className="form-field">
                <label>State</label>
                <input
                  type="text"
                  value={customer?.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                  disabled={loading}
                />
              </div>

              <div className="form-field">
                <label>Postal Code</label>
                <input
                  type="text"
                  value={customer?.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="Enter postal code"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            className="btn-cancel" 
            onClick={onCancel} 
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn-save" 
            onClick={onSave} 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                {isEdit ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEdit ? 'Save Changes' : 'Create Customer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
