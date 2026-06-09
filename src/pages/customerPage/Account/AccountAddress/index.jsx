import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../component/Auth/AuthContext';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { searchAddresses, getPlaceDetails, extractAddressParts } from '../../../../utils/googlePlacesApi';
import './AccountAddress.css';

const AccountAddress = () => {
  const { user } = useAuth();
  const { token } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressSelected, setAddressSelected] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const addressInputRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data.shipping_addresses) {
        const addressData = response.data.data.shipping_addresses.map((addr, index) => ({
          id: Date.now() + index,
          address: addr.address,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
          latitude: addr.latitude || null,
          longitude: addr.longitude || null,
          is_default: addr.is_default
        }));
        setAddresses(addressData);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const syncAddressesToServer = async (updatedAddresses) => {
    const addressesToSync = updatedAddresses || addresses;
    const addressPayload = {
      shipping_addresses: addressesToSync.map(addr => ({
        address: addr.address,
        city: addr.city,
        state: addr.state,
        latitude: addr.latitude || null,
        longitude: addr.longitude || null,
        is_default: addr.is_default
      }))
    };

    const response = await axios.put(
      `${baseUrl}/api/customer/update-shipping-addresses`,
      addressPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update addresses');
    }
  };

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    is_default: false
  });

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'address') {
      setAddressSelected(false);
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
      toast.error('Failed to search addresses');
    }
  };

  const selectAddressSuggestion = async (suggestion) => {
    try {
      setGeocoding(true);
      
      // Fetch detailed information including coordinates
      const placeDetails = await getPlaceDetails(suggestion.id);
      
      if (placeDetails) {
        const addressParts = extractAddressParts(placeDetails);
        
        setFormData(prev => ({
          ...prev,
          address: placeDetails.formattedAddress || suggestion.formattedAddress,
          latitude: placeDetails.latitude || '',
          longitude: placeDetails.longitude || '',
          city: addressParts.city || prev.city || '',
          state: addressParts.state || prev.state || '',
          postal_code: addressParts.postal_code || prev.postal_code || ''
        }));
        
        toast.success('Address details loaded!');
      } else {
        toast.error('Failed to load address details');
      }
    } catch (error) {
      console.error('Error selecting address:', error);
      toast.error('Failed to load address details');
    } finally {
      setGeocoding(false);
      setShowSuggestions(false);
      setAddressSuggestions([]);
      setAddressSelected(true);
    }
  };


  const geocodeAddress = async () => {
    if (!formData.address) {
      toast.error('Please enter an address first');
      return;
    }

    setGeocoding(true);
    try {
      // Search for the address to get the place ID
      const searchResults = await searchAddresses(formData.address);
      
      if (searchResults && searchResults.length > 0) {
        // Get coordinates from the first result
        const placeDetails = await getPlaceDetails(searchResults[0].id);
        
        if (placeDetails && placeDetails.latitude && placeDetails.longitude) {
          setFormData(prev => ({
            ...prev,
            latitude: placeDetails.latitude,
            longitude: placeDetails.longitude
          }));
          setAddressSelected(true);
          toast.success('Coordinates obtained from address!');
        } else {
          toast.warning('Could not find coordinates for this address');
        }
      } else {
        toast.warning('Could not find this address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to get coordinates');
    } finally {
      setGeocoding(false);
    }
  };

  const resetForm = () => {
    setFormData({
      address: '',
      city: '',
      state: '',
      latitude: '',
      longitude: '',
      is_default: false
    });
    setEditingAddress(null);
    setAddressSuggestions([]);
    setShowSuggestions(false);
    setAddressSelected(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address.id);
    setFormData({ ...address });
    setShowModal(true);
    setAddressSelected(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSaveAddress = async () => {
    if (!formData.address || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!addressSelected) {
      toast.error('Please select an address from the suggested list to ensure accuracy');
      return;
    }

    setSaving(true);
    try {
      let updatedAddresses;

      if (editingAddress) {
        updatedAddresses = addresses.map(addr =>
          addr.id === editingAddress
            ? { ...formData, id: editingAddress }
            : formData.is_default ? { ...addr, is_default: false } : addr
        );
      } else {
        const newAddress = { ...formData, id: Date.now() };
        updatedAddresses = [
          ...addresses.map(addr => formData.is_default ? { ...addr, is_default: false } : addr),
          newAddress
        ];
      }

      await syncAddressesToServer(updatedAddresses);
      setAddresses(updatedAddresses);
      toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
      closeModal();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setSaving(true);
      try {
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        await syncAddressesToServer(updatedAddresses);
        setAddresses(updatedAddresses);
        toast.success('Address deleted successfully');
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    setSaving(true);
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      }));
      await syncAddressesToServer(updatedAddresses);
      setAddresses(updatedAddresses);
      toast.success('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="col-lg-10 address-container-section">
        <div className="address-container">
          <div className="address-header">
            <h1 className="address-title">My Addresses</h1>
            <p className="address-subtitle">Manage your delivery addresses</p>
          </div>

          <div className="add-address-section ">
            <button className="add-address-btn p-2 " onClick={openAddModal}>
              <span className="btn-icon">+</span>
              Add New Address
            </button>
          </div>

          <div className="addresses-list">
            {addresses.length === 0 ? (
              <div className="empty-addresses">
                <div className="empty-icon">🏠</div>
                <h3>No addresses saved</h3>
                <p>Add your first delivery address to get started</p>
                <button className="btn btn-primary" onClick={openAddModal}>
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="addresses-gri row ">
                {addresses.map(address => (
                  <div className="col">
                    <div key={address.id} className="address-card ">
                      {address.is_default && <div className="default-badge">Default</div>}

                      <div className="address-card-header">
                        <div className="address-type">
                          <span className="type-icon">📍</span>
                          <span className="address-name">Address</span>
                        </div>
                        <div className="address-actions">
                          <button className="action-btn edit" onClick={() => openEditModal(address)} title="Edit address" disabled={saving}>✏️</button>
                          {!address.is_default && (
                            <button className="action-btn delete" onClick={() => handleDeleteAddress(address.id)} title="Delete address" disabled={saving}>🗑️</button>
                          )}
                        </div>
                      </div>

                      <div className="address-details">
                        <div className="location-info">
                          <p className="street">{address.address}</p>
                          <p className="city-state">{address.city}, {address.state}</p>
                          {address.latitude && address.longitude && (
                            <p className="coordinates">
                              <span className="coord-icon">🌐</span>
                              {parseFloat(address.latitude).toFixed(6)}, {parseFloat(address.longitude).toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="address-foote row">
                        {!address.is_default && (
                          <button className="set-default-btn col-lg-6 col-sm-12" onClick={() => handleSetDefault(address.id)} disabled={saving}>
                            {saving ? 'Updating...' : 'Set as Default'}
                          </button>
                        )}
                        {/* <button className="deliver-here-btn col-lg-6 col-sm-12">Deliver to this Address</button> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="delivery-tips">
            <h4>Delivery Tips</h4>
            <div className="tips-grid">
              <div className="tip-item">
                <span className="tip-icon">📱</span>
                <div className="tip-content">
                  <strong>Keep phone handy</strong>
                  <p>Ensure your phone is active for delivery updates</p>
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🏠</span>
                <div className="tip-content">
                  <strong>Clear address details</strong>
                  <p>Include landmarks and clear directions</p>
                </div>
              </div>
              <div className="tip-item">
                <span className="tip-icon">⏰</span>
                <div className="tip-content">
                  <strong>Delivery hours</strong>
                  <p>Most deliveries occur between 8AM - 8PM</p>
                </div>
              </div>
            </div>
          </div>

          {showModal && (
            <div className="modal-overlay" style={{zIndex:'9999'}}>
              <div className="modal-content">
                <div className="modal-header">
                  <div>
                    <h2 style={{color:'white'}}>{editingAddress ? '✏️ Edit Address' : '📍 Add New Address'}</h2>
                    <p style={{color:'white'}}>{editingAddress ? 'Update your delivery address' : 'Add a new delivery address'}</p>
                  </div>
                  <button className="modal-close-btn" onClick={closeModal}>×</button>
                </div>

                <div className="modal-body">

                  <div className="form-group address-input-group">
                    <label>📍 Street Address <span className="required">*</span></label>
                    <div className="input-wrappe">
                      <textarea
                        ref={addressInputRef}
                        placeholder="Enter your complete address (or search for it)"
                        rows="3"
                        className={addressSelected ? 'address-selected' : ''}
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        onFocus={() => formData.address.length >= 3 && !addressSelected && setShowSuggestions(true)}
                      />
                      {formData.address && !addressSelected && !showSuggestions && (
                        <div className="address-hint" style={{  color: '#ff9900', fontSize: '12px', marginTop: '5px' }}>
                          ⚠️ Please search and select an address from the suggestions
                        </div>
                      )}
                      {addressSelected && (
                        <div className="address-hint" style={{ color: '#28a745', fontSize: '12px', marginTop: '5px' }}>
                          ✅ Address verified
                        </div>
                      )}
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div className="address-suggestions">
                          {addressSuggestions.map((suggestion, index) => (
                            <div
                              key={suggestion.id}
                              className="suggestion-item"
                              onClick={() => selectAddressSuggestion(suggestion)}
                              style={{ cursor: geocoding ? 'wait' : 'pointer', opacity: geocoding ? 0.6 : 1 }}
                            >
                              <div style={{ fontWeight: 500 }}>{suggestion.displayName?.text || suggestion.displayName || suggestion.formattedAddress}</div>
                              <div style={{ fontSize: '0.85em', color: '#666' }}>{suggestion.formattedAddress}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>🏙️ City <span className="required">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>🗺️ State <span className="required">*</span></label>
                      <select value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)}>
                        <option value="">Select State</option>
                        {nigerianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>


                  <div className="coordinates-section d-none">
                    <div className="form-row">
                      <div className="form-group">
                        <label>🌐 Latitude</label>
                        <input
                          type="text"
                          readonly
                          placeholder="Latitude"
                          value={formData.latitude}
                          onChange={(e) => handleInputChange('latitude', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>🌐 Longitude</label>
                        <input
                          type="text"
                          readonly
                          placeholder="Longitude"
                          value={formData.longitude}
                          onChange={(e) => handleInputChange('longitude', e.target.value)}
                        />
                      </div>
                    </div>
                    {!formData.latitude && !formData.longitude && (
                      <button
                        type="button"
                        className="geocode-btn"
                        onClick={geocodeAddress}
                        disabled={geocoding || !formData.address}
                      >
                        {geocoding ? '🔄 Getting coordinates...' : '🌐 Get Coordinates from Address'}
                      </button>
                    )}
                  </div>

                  <div className="default-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_default}
                        onChange={(e) => handleInputChange('is_default', e.target.checked)}
                      />
                      <span className="checkbox-label">
                        <span className="star-icon">⭐</span>
                        <div>
                          <strong>Set as Default Address</strong>
                          <p>This will be your primary delivery address</p>
                        </div>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-cancel" onClick={closeModal} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn-save" onClick={handleSaveAddress} disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner" style={{ padding: '0px', margin: '0px', width: '20px', height: '20px' }}></span>
                        {editingAddress ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      <>{editingAddress ? '✏️ Update Address' : '💾 Save Address'}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AccountAddress;
