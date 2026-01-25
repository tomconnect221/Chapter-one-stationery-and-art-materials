import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../AdminProducts/AdminProducts.css';
import './AdminCustomersstyling.css';
import './CustomerModal.css';
const AdminCustomers = ({ userType = 'admin' }) => {
  const cartItems = useSelector((state) => state.cart?.items || []);
    const { token } = useSelector((state) => state.auth);
  
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saveLoading, setSaveLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const canEdit = userType === 'admin';

  // Fetch customers from API
  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
     // const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/customers?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCustomers(response.data.data.data);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total
        });
      } else {
        throw new Error('Failed to fetch customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Update customer
  const updateCustomer = async (customerId, customerData) => {
    try {
      setSaveLoading(true);
      setFormErrors({});

      const token = localStorage.getItem('auth_token');
      const formData = new URLSearchParams();
      
      // Only include fields that have values
      if (customerData.name) formData.append('name', customerData.name);
      if (customerData.email) formData.append('email', customerData.email);
      if (customerData.phone) formData.append('phone', customerData.phone);
      if (customerData.address) formData.append('address', customerData.address);
      if (customerData.city) formData.append('city', customerData.city);
      if (customerData.state) formData.append('state', customerData.state);
      if (customerData.postal_code) formData.append('postal_code', customerData.postal_code);
      if (customerData.is_active !== undefined) formData.append('is_active', customerData.is_active ? '1' : '0');

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/customers/${customerId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setCustomers(prev => prev.map(c => 
          c.id === customerId ? response.data.data : c
        ));
        setShowModal(false);
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
        return { success: false, errors: err.response.data.errors };
      }
      return { success: false, errors: { general: 'Failed to update customer' } };
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId) => {
    try {
      setDeleteLoading(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/customers/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        setMessage({ type: 'success', text: response.data.message });
        setShowDeleteModal(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete customer. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      setCustomerDetailsLoading(true);
      const endpoint = userType === 'admin' 
        ? `${import.meta.env.VITE_API_URL}/api/admin/customers/${customerId}`
        : `${import.meta.env.VITE_API_URL}/api/subadmin/customers/${customerId}`;
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch customer details');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setFormErrors({ general: 'Failed to load customer details. Please try again.' });
      return null;
    } finally {
      setCustomerDetailsLoading(false);
    }
  };

  const handleView = async (customer) => {
    setModalMode('view');
    setFormErrors({});
    setShowModal(true);
    
    // Fetch detailed customer information
    const detailedCustomer = await fetchCustomerDetails(customer.id);
    if (detailedCustomer) {
      setSelectedCustomer(detailedCustomer);
    } else {
      setSelectedCustomer(customer); // Fallback to basic info
    }
  };

  const handleEdit = (customer) => {
    setModalMode('edit');
    setSelectedCustomer({ ...customer });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const handleSave = async () => {
    if (!selectedCustomer) return;

    const result = await updateCustomer(selectedCustomer.id, selectedCustomer);
    if (result.success) {
      setShowModal(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchCustomers(page);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && customer.is_active) ||
                         (filterStatus === 'inactive' && !customer.is_active);
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price) => {
    return `₦${(price / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate statistics from actual data
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.is_active).length;
  const totalOrders = customers.reduce((sum, c) => sum + (c.orders_count || 0), 0);
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);

  if (loading) {
    return (
      <div className="admin-products">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="products-header">
        <div>
          <h1>Customers Management</h1>
          <p>Manage customer accounts and view activity</p>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div className="stat-card" style={{margin: 0, padding: '12px 20px'}}>
            <div className="stat-icon" style={{fontSize: '24px', width: 'auto', height: 'auto'}}>🛒</div>
            <div className="stat-info">
              <div className="stat-value" style={{fontSize: '20px'}}>{cartCount}</div>
              <div className="stat-label">Cart Items</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button onClick={() => fetchCustomers()} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-label">Total Customers ({totalCustomers})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Active ({activeCustomers})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-label">Total Orders ({totalOrders})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue ({formatPrice(totalRevenue)})</div>
          </div>
        </div>
      </div>

      <div className="filters-section d-flex align-items-center justify-content-between">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>City/State</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  {customers.length === 0 ? 'No customers found' : 'No customers match your search criteria'}
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td><strong>{customer.name || 'N/A'}</strong></td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || 'N/A'}</td>
                  <td>{customer.address || 'N/A'}</td>
                  <td>
                    {[customer.city, customer.state].filter(Boolean).join(', ') || 'N/A'}
                  </td>
                  <td>
                    <span className={`status-badge ${customer.is_active ? 'active' : 'inactive'}`}>
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(customer.created_at)}</td>
                  <td>
                    <div className="action-butto d-flex align-items-center gap-2">
                      <button className="btn-icon" onClick={() => handleView(customer)} title="View">
                        👁️
                      </button>
                      {canEdit && (
                        <>
                          <button className="btn-icon" onClick={() => handleEdit(customer)} title="Edit">
                            ✏️
                          </button>
                          <button className="btn-icon danger" onClick={() => handleDelete(customer)} title="Delete">
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <CustomerModal
          mode={modalMode}
          customer={selectedCustomer}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          onChange={setSelectedCustomer}
          canEdit={canEdit}
          loading={saveLoading}
          errors={formErrors}
          detailsLoading={customerDetailsLoading}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          customer={customerToDelete}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

const CustomerModal = ({ mode, customer, onSave, onClose, onChange, canEdit, loading, errors, detailsLoading }) => {
  const isView = mode === 'view';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="customer-modal-header">
          <div className="header-content">
            <div className="customer-avatar">
              <div className="avatar-circle">
                {customer?.name ? customer.name.charAt(0).toUpperCase() : '👤'}
              </div>
            </div>
            <div className="customer-title">
              <h2>{customer?.name || 'Customer Details'}</h2>
              <div className="customer-status">
                <span className={`status-indicator ${customer?.is_active ? 'active' : 'inactive'}`}></span>
                <span className="status-text">{customer?.is_active ? 'Active Account' : 'Inactive Account'}</span>
                {customer?.email_verified_at && <span className="verified-badge">✓ Verified</span>}
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="customer-modal-body">
          {errors.general && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}

          {detailsLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading customer details...</p>
            </div>
          ) : customer ? (
            <div className="customer-content">
              <div className="info-cards">
                <div className="info-card">
                  <div className="card-header">
                    <span className="card-icon">👤</span>
                    <h3>Personal Information</h3>
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <label>Full Name</label>
                      {isView ? (
                        <span className="info-value">{customer.name || 'Not provided'}</span>
                      ) : (
                        <input
                          type="text"
                          value={customer.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`modern-input ${errors.name ? 'error' : ''}`}
                          placeholder="Enter full name"
                        />
                      )}
                      {errors.name && <span className="field-error">{errors.name[0]}</span>}
                    </div>
                    <div className="info-row">
                      <label>Email Address</label>
                      {isView ? (
                        <span className="info-value">{customer.email}</span>
                      ) : (
                        <input
                          type="email"
                          value={customer.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`modern-input ${errors.email ? 'error' : ''}`}
                          placeholder="Enter email address"
                        />
                      )}
                      {errors.email && <span className="field-error">{errors.email[0]}</span>}
                    </div>
                    <div className="info-row">
                      <label>Phone Number</label>
                      {isView ? (
                        <span className="info-value">{customer.phone || 'Not provided'}</span>
                      ) : (
                        <input
                          type="tel"
                          value={customer.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="modern-input"
                          placeholder="Enter phone number"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="card-header">
                    <span className="card-icon">📍</span>
                    <h3>Address Information</h3>
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <label>Street Address</label>
                      {isView ? (
                        <span className="info-value">{customer.address || 'Not provided'}</span>
                      ) : (
                        <input
                          type="text"
                          value={customer.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="modern-input"
                          placeholder="Enter street address"
                        />
                      )}
                    </div>
                    <div className="address-grid">
                      <div className="info-row">
                        <label>City</label>
                        {isView ? (
                          <span className="info-value">{customer.city || 'Not provided'}</span>
                        ) : (
                          <input
                            type="text"
                            value={customer.city || ''}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="modern-input"
                            placeholder="City"
                          />
                        )}
                      </div>
                      <div className="info-row">
                        <label>State</label>
                        {isView ? (
                          <span className="info-value">{customer.state || 'Not provided'}</span>
                        ) : (
                          <input
                            type="text"
                            value={customer.state || ''}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="modern-input"
                            placeholder="State"
                          />
                        )}
                      </div>
                      <div className="info-row">
                        <label>Postal Code</label>
                        {isView ? (
                          <span className="info-value">{customer.postal_code || 'Not provided'}</span>
                        ) : (
                          <input
                            type="text"
                            value={customer.postal_code || ''}
                            onChange={(e) => handleInputChange('postal_code', e.target.value)}
                            className="modern-input"
                            placeholder="Postal code"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="card-header">
                    <span className="card-icon">📊</span>
                    <h3>Account Details</h3>
                  </div>
                  <div className="card-content">
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-label">Joined Date</span>
                        <span className="stat-value">{new Date(customer.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Last Updated</span>
                        <span className="stat-value">{new Date(customer.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      {customer.email_verified_at && (
                        <div className="stat-item">
                          <span className="stat-label">Email Verified</span>
                          <span className="stat-value verified">✓ {new Date(customer.email_verified_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                      )}
                    </div>
                    {!isView && (
                      <div className="account-toggle">
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            checked={customer.is_active || false}
                            onChange={(e) => handleCheckboxChange(e.target.checked)}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                          <span className="toggle-text">Account Active</span>
                        </label>
                        <small className="toggle-help">Inactive accounts cannot login</small>
                      </div>
                    )}
                  </div>
                </div>

                {customer.orders && customer.orders.length > 0 && (
                  <div className="info-card">
                    <div className="card-header">
                      <span className="card-icon">📦</span>
                      <h3>Recent Orders ({customer.orders.length})</h3>
                    </div>
                    <div className="card-content">
                      <div className="orders-list">
                        {customer.orders.map((order, index) => (
                          <div key={index} className="order-item">
                            <div className="order-info">
                              <span className="order-id">#{order.id}</span>
                              <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <span className={`order-status status-${order.status?.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No customer data available</p>
            </div>
          )}
        </div>

        {!detailsLoading && customer && (
          <div className="customer-modal-footer">
            <button className="btn-cancel" onClick={onClose} disabled={loading}>
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && canEdit && (
              <button className="btn-save" onClick={onSave} disabled={loading}>
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ customer, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h3>⚠️ Confirm Deletion</h3>
        </div>
        <div className="delete-modal-body">
          <p>Are you sure you want to delete this customer account?</p>
          <div className="customer-info">
            <strong>{customer?.name || 'Unknown Customer'}</strong>
            <span>{customer?.email}</span>
          </div>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="delete-modal-footer">
          <button className="btn-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-delete" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Deleting...
              </>
            ) : (
              'Delete Customer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;