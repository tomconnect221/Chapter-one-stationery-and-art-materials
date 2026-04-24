import React from 'react';
import './RiderForm.css';

const RiderForm = ({ mode, rider, onSave, onCancel, onChange, errors, loading, vehicleTypes }) => {
  const getVehicleIcon = (type) => {
    const icons = {
      bike: '🏍️',
      car: '🚗',
      van: '🚐',
      bicycle: '🚲'
    };
    return icons[type] || '🚗';
  };

  const handleChange = (field, value) => {
    onChange({ ...rider, [field]: value });
  };

  return (
    <div className="rider-form-containe w-100">
      {/* Header */}
      <div className="rider-form-header">
        <h2>{mode === 'add' ? 'Add New Rider' : 'Edit Rider'}</h2>
        <button className="close-btn" onClick={onCancel}>×</button>
      </div>

      {/* Form */}
      <div className="rider-form-body">
        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">👤</span>
            Personal Information
          </h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Full Name *</label>
              <input
                type="text"
                value={rider?.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading}
                placeholder="Enter full name"
                className={`modern-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && <span className="field-error">{errors.name[0]}</span>}
            </div>

            <div className="form-field">
              <label>Email Address *</label>
              <input
                type="email"
                value={rider?.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
                placeholder="Enter email address"
                className={`modern-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="field-error">{errors.email[0]}</span>}
            </div>

            <div className="form-field">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={rider?.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
                placeholder="09058942480"
                className={`modern-input ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && <span className="field-error">{errors.phone[0]}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">🚗</span>
            Vehicle Information
          </h3>
          <div className="form-grid">
            <div className="form-field">
              <label>License Number *</label>
              <input
                type="text"
                value={rider?.license_number || ''}
                onChange={(e) => handleChange('license_number', e.target.value)}
                disabled={loading}
                placeholder="Enter license number"
                className={`modern-input ${errors.license_number ? 'error' : ''}`}
              />
              {errors.license_number && <span className="field-error">{errors.license_number[0]}</span>}
            </div>

            <div className="form-field">
              <label>Vehicle Type *</label>
              <select
                value={rider?.vehicle_type || 'bike'}
                onChange={(e) => handleChange('vehicle_type', e.target.value)}
                disabled={loading}
                className={`modern-select ${errors.vehicle_type ? 'error' : ''}`}
              >
                {vehicleTypes?.map(type => (
                  <option key={type} value={type}>
                    {getVehicleIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {errors.vehicle_type && <span className="field-error">{errors.vehicle_type[0]}</span>}
            </div>

            <div className="form-field">
              <label>Vehicle Number *</label>
              <input
                type="text"
                value={rider?.vehicle_number || ''}
                onChange={(e) => handleChange('vehicle_number', e.target.value)}
                disabled={loading}
                placeholder="Enter vehicle number"
                className={`modern-input ${errors.vehicle_number ? 'error' : ''}`}
              />
              {errors.vehicle_number && <span className="field-error">{errors.vehicle_number[0]}</span>}
            </div>
          </div>
        </div>

        {mode === 'edit' && (
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">⚙️</span>
              Account Settings
            </h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Account Status *</label>
                <select
                  value={rider?.is_active ? 'true' : 'false'}
                  onChange={(e) => handleChange('is_active', e.target.value === 'true')}
                  disabled={loading}
                  className="modern-select"
                >
                  <option value="true">✅ Active</option>
                  <option value="false">❌ Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <h3 className="section-title">
            <span className="section-icon">🔒</span>
            {mode === 'add' ? 'Security' : 'Change Password'}
          </h3>
          <div className="form-grid">
            <div className="form-field">
              <label>
                {mode === 'add' ? 'Password *' : 'New Password (leave blank to keep current)'}
              </label>
              <input
                type="password"
                value={rider?.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={loading}
                placeholder={mode === 'add' ? 'Enter password' : 'Enter new password'}
                className={`modern-input ${errors.password ? 'error' : ''}`}
              />
              {errors.password && <span className="field-error">{errors.password[0]}</span>}
            </div>

            <div className="form-field">
              <label>
                {mode === 'add' ? 'Confirm Password *' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                value={rider?.password_confirmation || ''}
                onChange={(e) => handleChange('password_confirmation', e.target.value)}
                disabled={loading}
                placeholder={mode === 'add' ? 'Confirm password' : 'Confirm new password'}
                className={`modern-input ${errors.password_confirmation ? 'error' : ''}`}
              />
              {errors.password_confirmation && <span className="field-error">{errors.password_confirmation[0]}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="rider-form-footer">
        <button className="btn-cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="btn-save" onClick={onSave} disabled={loading}>
          {loading ? (
            <>
              <div className="btn-spinner"></div>
              {mode === 'add' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            mode === 'add' ? 'Add Rider' : 'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
};

export default RiderForm;
