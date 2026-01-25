import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../component/Auth/AuthContext';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AccountAddress.css';
const AccountAddress = () => {
  const { user } = useAuth();
  const { token } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.data.shipping_addresses) {
        const addressData = response.data.data.shipping_addresses.map((addr, index) => ({
          id: Date.now() + index,
          address: addr.address,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
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
        postal_code: addr.postal_code,
        is_default: addr.is_default
      }))
    };
    
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/customer/update-shipping-addresses`,
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
    postal_code: '',
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
  };

  const resetForm = () => {
    setFormData({
      address: '',
      city: '',
      state: '',
      postal_code: '',
      is_default: false
    });
    setEditingAddress(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address.id);
    setFormData({ ...address });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSaveAddress = async () => {
    if (!formData.address || !formData.city || !formData.state || !formData.postal_code) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      let updatedAddresses;
      
      if (editingAddress) {
        // Update existing address
        updatedAddresses = addresses.map(addr =>
          addr.id === editingAddress
            ? { ...formData, id: editingAddress }
            : formData.is_default ? { ...addr, is_default: false } : addr
        );
      } else {
        // Add new address
        const newAddress = { ...formData, id: Date.now() };
        updatedAddresses = [
          ...addresses.map(addr => formData.is_default ? { ...addr, is_default: false } : addr),
          newAddress
        ];
      }

      // Sync to server first
      await syncAddressesToServer(updatedAddresses);
      
      // Update local state only after successful sync
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
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="col-lg-10">
      <div className="address-container">
        <div className="address-header">
          <h1 className="address-title">My Addresses</h1>
          <p className="address-subtitle">Manage your delivery addresses</p>
        </div>

        {/* Add Address Button */}
        <div className="add-address-section">
          <button
            className="add-address-btn"
            onClick={openAddModal}
          >
            <span className="btn-icon">+</span>
            Add New Address
          </button>
        </div>

        {/* Addresses List */}
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
            <div className="addresses-grid">
              {addresses.map(address => (
                <div key={address.id} className="address-card">
                  {address.is_default && (
                    <div className="default-badge">Default</div>
                  )}

                  <div className="address-header">
                    <div className="address-type">
                      <span className="type-icon">📍</span>
                      <span className="address-name">Address {address.id}</span>
                    </div>
                    <div className="address-actions">
                      <button
                        className="action-btn edit"
                        onClick={() => openEditModal(address)}
                        title="Edit address"
                        disabled={saving}
                      >
                        ✏️
                      </button>
                      {!address.is_default && (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteAddress(address.id)}
                          title="Delete address"
                          disabled={saving}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="address-details">
                    <div className="location-info">
                      <p className="street">{address.address}</p>
                      <p className="city-state">{address.city}, {address.state}</p>
                      <p className="postal-code">Postal Code: {address.postal_code}</p>
                    </div>
                  </div>

                  <div className="address-footer">
                    {!address.is_default && (
                      <button
                        className="set-default-btn"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={saving}
                      >
                        {saving ? 'Updating...' : 'Set as Default'}
                      </button>
                    )}
                    <button className="deliver-here-btn">
                      Deliver to this Address
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Tips */}
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

        {/* Address Modal */}
        {showModal && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div className="modal-content" style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              animation: 'slideUp 0.3s ease-out'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                      {editingAddress ? '✏️ Edit Address' : '📍 Add New Address'}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px', color:'white' }}>
                      {editingAddress ? 'Update your delivery address' : 'Add a new delivery address'}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      color: '#fff',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '32px', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gap: '24px' }}>
                  {/* Street Address */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      📍 Street Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      placeholder="Enter your complete address (house number, street, area, landmarks)"
                      rows="3"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* City and State Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        🏙️ City <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        🗺️ State <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">Select State</option>
                        {nigerianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      📮 Postal Code <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter postal code (e.g., 100001)"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Default Address Toggle */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="checkbox"
                          checked={formData.is_default}
                          onChange={(e) => handleInputChange('is_default', e.target.checked)}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: '#667eea'
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ color: '#374151', fontWeight: '600' }}>
                          ⭐ Set as Default Address
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                          This will be your primary delivery address
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '24px 32px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={closeModal}
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: saving ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#fff';
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '12px',
                    background: saving ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '140px',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      {editingAddress ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      {editingAddress ? '✏️ Update Address' : '💾 Save Address'}
                    </>
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