import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../../../component/Auth/AuthContext'; // Adjust path as needed
import { searchAddresses, getPlaceDetails, extractAddressParts } from '../../../../utils/googlePlacesApi';
import './AccountDetails.css';

const AccountDetails = ({ user, onUpdate }) => {
  const { token, user: authUser } = useSelector(state => state.auth);
  const { updateProfile, changePassword, loading: authLoading, error, fieldErrors, clearError, clearSuccess } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [localSuccess, setLocalSuccess] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: ''
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Password visibility states
  const [passwordVisible, setPasswordVisible] = useState({
    current_password: false,
    password: false,
    password_confirmation: false
  });

  // Update form when user data changes
  useEffect(() => {
    const currentUser = authUser || user;
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: (currentUser.state || '').replace(/state$/i, '').trim(),
        postal_code: currentUser.postal_code || ''
      });
    }
  }, [authUser, user]);

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  const [permissions, setPermissions] = useState({
    sms: false,
    email: true,
    phoneCall: false
  });

  // Clear errors and success messages when switching tabs
  useEffect(() => {
    clearError();
    clearSuccess();
    setLocalSuccess('');
  }, [activeTab]);

  // Show success messages
  useEffect(() => {
    if (localSuccess) {
      const timer = setTimeout(() => {
        setLocalSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [localSuccess]);

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'address') {
      if (value.length >= 3) {
        searchAddress(value);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const searchAddress = async (query) => {
    try {
      const suggestions = await searchAddresses(query);
      if (suggestions && suggestions.length > 0) {
        setAddressSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Address search error:', error);
    }
  };

  const selectAddressSuggestion = async (suggestion) => {
    try {
      setGeocoding(true);
      const placeDetails = await getPlaceDetails(suggestion.id);
      
      if (placeDetails) {
        const addressParts = extractAddressParts(placeDetails);
        
        setProfileForm(prev => ({
          ...prev,
          address: placeDetails.formattedAddress || suggestion.formattedAddress,
          city: addressParts.city || prev.city || '',
          state: addressParts.state || prev.state || '',
          postal_code: addressParts.postal_code || prev.postal_code || ''
        }));
      }
    } catch (error) {
      console.error('Error selecting address:', error);
    } finally {
      setGeocoding(false);
      setShowSuggestions(false);
      setAddressSuggestions([]);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    clearError();

    try {
      const result = await updateProfile(profileForm);

      if (result.success) {
        setLocalSuccess('Profile updated successfully!');
        if (onUpdate) {
          onUpdate(profileForm);
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordForm.password !== passwordForm.password_confirmation) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordForm.password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    setLoading(true);
    clearError();

    try {
      const result = await changePassword(passwordForm, token);

      if (result.success) {
        setLocalSuccess('Password updated successfully!');
        setPasswordForm({
          current_password: '',
          password: '',
          password_confirmation: ''
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetProfileForm = () => {
    const currentUser = authUser || user;
    setProfileForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      city: currentUser?.city || '',
      state: currentUser?.state || '',
      postal_code: currentUser?.postal_code || ''
    });
    clearError();
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      current_password: '',
      password: '',
      password_confirmation: ''
    });
    clearError();
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'password', label: 'Change password' },
    // { id: 'permissions', label: 'Permissions' }
  ];

  // Get field-specific errors
  const getFieldError = (fieldName) => {
    return fieldErrors?.[fieldName]?.[0] || '';
  };
  const nigeriaStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
    "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe",
    "Zamfara", "Federal Capital Territory"
  ];

  return (
    <div className='col-lg-10 account-details-container'>
      <div className="account-details ">
        <div className="account-header">
          <h2 className="account-title">Account Details</h2>
        </div>

        {/* Success Message */}
        {localSuccess && (
          <div className="alert alert-success" role="alert">
            {localSuccess}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="account-tabs">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content ">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="tab-pane active">
                <div className="form-section">
                  <div className="profile-avatar-section">
                    <div className="avatar-circle">
                      {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="avatar-info">
                      <h3>{profileForm.name || 'Your Profile'}</h3>
                      <p>Update your personal information and details</p>
                    </div>
                  </div>
                  <form className="account-form " onSubmit={(e) => e.preventDefault()}>
                    <div className="form-grid p-0">
                      <div className="form-group mb-1">
                        <label className="form-label">Full Name *</label>
                        <input
                          className={`form-control ${getFieldError('name') ? 'is-invalid' : ''}`}
                          type="text"
                          placeholder="Your Full Name"
                          value={profileForm.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          required
                        />
                        {getFieldError('name') && (
                          <div className="invalid-feedback">{getFieldError('name')}</div>
                        )}
                      </div>

                      <div className="form-group mb-1">
                        <label className="form-label">Email *</label>
                        <input
                          className={`form-control ${getFieldError('email') ? 'is-invalid' : ''}`}
                          type="email"
                          placeholder="Your Email"
                          value={profileForm.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          required
                        />
                        {getFieldError('email') && (
                          <div className="invalid-feedback">{getFieldError('email')}</div>
                        )}
                      </div>

                      <div className="form-group mb-1">
                        <label className="form-label">Phone Number</label>
                        <input
                          className={`form-control ${getFieldError('phone') ? 'is-invalid' : ''}`}
                          type="tel"
                          placeholder="Your Phone Number"
                          value={profileForm.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                        />
                        {getFieldError('phone') && (
                          <div className="invalid-feedback">{getFieldError('phone')}</div>
                        )}
                      </div>

                      {/* <div className="form-group mb-1 full-width position-relative">
                        <label className="form-label">Address</label>
                        <input
                          className={`form-control ${getFieldError('address') ? 'is-invalid' : ''}`}
                          type="text"
                          placeholder="Search your Address"
                          value={profileForm.address}
                          onChange={(e) => handleProfileChange('address', e.target.value)}
                        />
                        {getFieldError('address') && (
                          <div className="invalid-feedback">{getFieldError('address')}</div>
                        )}
                        {showSuggestions && addressSuggestions.length > 0 && (
                          <ul className="address-suggestions-list" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: 0, margin: 0, listStyle: 'none', maxHeight: '200px', overflowY: 'auto' }}>
                            {addressSuggestions.map((suggestion) => (
                              <li
                                key={suggestion.id}
                                onClick={() => selectAddressSuggestion(suggestion)}
                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                                {suggestion.formattedAddress}
                              </li>
                            ))}
                          </ul>
                        )}
                        {geocoding && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Fetching details...</div>}
                      </div> */}
{/* 
                      <div className="form-group mb-1">
                        <label className="form-label">City</label>
                        <input
                          className={`form-control ${getFieldError('city') ? 'is-invalid' : ''}`}
                          type="text"
                          placeholder="Your City"
                          value={profileForm.city}
                          readOnly
                          style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                        {getFieldError('city') && (
                          <div className="invalid-feedback">{getFieldError('city')}</div>
                        )}
                      </div> */}

                      {/* <div className="form-group mb-1">
                        <label className="form-label">State</label>
                        <input
                          className={`form-control ${getFieldError('state') ? 'is-invalid' : ''}`}
                          type="text"
                          placeholder="Your State"
                          value={profileForm.state}
                          readOnly
                          style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                        {getFieldError('state') && (
                          <div className="invalid-feedback">{getFieldError('state')}</div>
                        )}
                      </div> */}


                      {/* <div className="form-group mb-1">
                        <label className="form-label">Postal Code</label>
                        <input
                          className={`form-control ${getFieldError('postal_code') ? 'is-invalid' : ''}`}
                          type="text"
                          placeholder="Your Postal Code"
                          value={profileForm.postal_code}
                          readOnly
                          style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                        />
                        {getFieldError('postal_code') && (
                          <div className="invalid-feedback">{getFieldError('postal_code')}</div>
                        )}
                      </div> */}
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleProfileUpdate}
                        disabled={loading || authLoading}
                      >
                        {loading || authLoading ? 'Updating...' : 'Update Profile'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={resetProfileForm}
                        disabled={loading || authLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="tab-pane active">
                <div className="form-section">
                  <form className="account-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-grid p-0">
                      <div className="form-group mb-1 full-width">
                        <label className="form-label">Current Password *</label>
                        <div className="password-input-wrapper">
                          <input
                            className={`form-control ${getFieldError('current_password') ? 'is-invalid' : ''}`}
                            type={passwordVisible.current_password ? "text" : "password"}
                            placeholder="Enter current password"
                            value={passwordForm.current_password}
                            onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                            required
                          />
                          <span 
                            className="password-toggle-icon"
                            onClick={() => togglePasswordVisibility('current_password')}
                          >
                            {passwordVisible.current_password ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                              </svg>
                            )}
                          </span>
                        </div>
                        {getFieldError('current_password') && (
                          <div className="invalid-feedback">{getFieldError('current_password')}</div>
                        )}
                      </div>

                      <div className="form-group mb-1 full-width">
                        <label className="form-label">New Password *</label>
                        <div className="password-input-wrapper">
                          <input
                            className={`form-control ${getFieldError('password') ? 'is-invalid' : ''}`}
                            type={passwordVisible.password ? "text" : "password"}
                            placeholder="Enter new password"
                            value={passwordForm.password}
                            onChange={(e) => handlePasswordChange('password', e.target.value)}
                            required
                            minLength="8"
                          />
                          <span 
                            className="password-toggle-icon"
                            onClick={() => togglePasswordVisibility('password')}
                          >
                            {passwordVisible.password ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                              </svg>
                            )}
                          </span>
                        </div>
                        {getFieldError('password') && (
                          <div className="invalid-feedback">{getFieldError('password')}</div>
                        )}
                        <small className="form-text text-muted">
                          Password must be at least 8 characters long.
                        </small>
                      </div>

                      <div className="form-group mb-1 full-width">
                        <label className="form-label">Confirm New Password *</label>
                        <div className="password-input-wrapper">
                          <input
                            className={`form-control ${getFieldError('password_confirmation') ? 'is-invalid' : ''}`}
                            type={passwordVisible.password_confirmation ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={passwordForm.password_confirmation}
                            onChange={(e) => handlePasswordChange('password_confirmation', e.target.value)}
                            required
                          />
                          <span 
                            className="password-toggle-icon"
                            onClick={() => togglePasswordVisibility('password_confirmation')}
                          >
                            {passwordVisible.password_confirmation ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                              </svg>
                            )}
                          </span>
                        </div>
                        {getFieldError('password_confirmation') && (
                          <div className="invalid-feedback">{getFieldError('password_confirmation')}</div>
                        )}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handlePasswordUpdate}
                        disabled={loading || authLoading}
                      >
                        {loading || authLoading ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={resetPasswordForm}
                        disabled={loading || authLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div className="tab-pane active">
                <div className="permissions-section">
                  {/* SMS Permission */}
                  <div className="permission-item">
                    <div className="permission-info">
                      <h5 className="permission-title">SMS</h5>
                      <p className="permission-desc">
                        Messages to be sent by zenmart to your mobile phone via SMS method
                      </p>
                    </div>
                    <div className="permission-toggle">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={permissions.sms}
                          onChange={() => handlePermissionToggle('sms')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  {/* Email Permission */}
                  <div className="permission-item">
                    <div className="permission-info">
                      <h5 className="permission-title">Email</h5>
                      <p className="permission-desc">
                        Messages to be sent by zenmart to your mobile phone via Email method
                      </p>
                    </div>
                    <div className="permission-toggle">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={permissions.email}
                          onChange={() => handlePermissionToggle('email')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  {/* Phone Call Permission */}
                  <div className="permission-item">
                    <div className="permission-info">
                      <h5 className="permission-title">Phone Call</h5>
                      <p className="permission-desc">
                        Messages to be sent by zenmart to your mobile phone via Phone Call method
                      </p>
                    </div>
                    <div className="permission-toggle">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={permissions.phoneCall}
                          onChange={() => handlePermissionToggle('phoneCall')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;