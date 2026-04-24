import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../AdminProducts/AdminProducts.css';
import './AdminCustomersstyling.css';
import './CustomerModal.css';

// Import new components
import CustomerView from './CustomerView';
import CustomerForm from './CustomerForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';

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

  // View mode: 'list', 'view', 'add', 'edit'
  const [viewMode, setViewMode] = useState('list');

  const canEdit = userType === 'admin';

  // Fetch customers from API
  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

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
          total: response.data.data.total,
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

  // Create customer
  const createCustomer = async (customerData) => {
    try {
      setSaveLoading(true);
      setFormErrors({});

      const token = localStorage.getItem('auth_token');
      const formData = new URLSearchParams();

      if (customerData.name) formData.append('name', customerData.name);
      if (customerData.email) formData.append('email', customerData.email);
      if (customerData.phone) formData.append('phone', customerData.phone);
      if (customerData.address) formData.append('address', customerData.address);
      if (customerData.city) formData.append('city', customerData.city);
      if (customerData.state) formData.append('state', customerData.state);
      if (customerData.postal_code) formData.append('postal_code', customerData.postal_code);
      if (customerData.is_active !== undefined) formData.append('is_active', customerData.is_active ? '1' : '0');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/customers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.success) {
        // Refresh the customer list
        fetchCustomers();
        return { success: true };
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
        return { success: false, errors: err.response.data.errors };
      }
      return { success: false, errors: { general: 'Failed to create customer' } };
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

      console.log('Fetching customer details from:', endpoint);
      console.log('Using token:', token ? 'Token present' : 'No token');

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Customer details response:', response.data);

      if (response.data.success) {
        console.log('Customer orders:', response.data.data.orders);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch customer details');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      console.error('Error response:', err.response?.data);
      setFormErrors({ general: 'Failed to load customer details. Please try again.' });
      return null;
    } finally {
      setCustomerDetailsLoading(false);
    }
  };

  // Handlers for different actions
  const handleView = async (customer) => {
    setFormErrors({});
    // Fetch detailed customer information
    const detailedCustomer = await fetchCustomerDetails(customer.id);
    if (detailedCustomer) {
      setSelectedCustomer(detailedCustomer);
    } else {
      setSelectedCustomer(customer); // Fallback to basic info
    }
    setViewMode('view');
  };

  const handleEdit = async (customer) => {
    // Fetch detailed customer information for editing
    const detailedCustomer = await fetchCustomerDetails(customer.id);
    if (detailedCustomer) {
      setSelectedCustomer(detailedCustomer);
    } else {
      setSelectedCustomer({ ...customer });
    }
    setFormErrors({});
    setViewMode('edit');
  };

  const handleAdd = () => {
    setSelectedCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      is_active: true
    });
    setFormErrors({});
    setViewMode('add');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCustomer(null);
    setFormErrors({});
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

    if (viewMode === 'edit') {
      const result = await updateCustomer(selectedCustomer.id, selectedCustomer);
      if (result.success) {
        setViewMode('list');
      }
    } else if (viewMode === 'add') {
      const result = await createCustomer(selectedCustomer);
      if (result.success) {
        setViewMode('list');
      }
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

  // Statistics from loaded customers
  // Note: The API list endpoint doesn't provide orders_count or total_spent per customer
  // These values would need to be fetched separately or from the customer detail endpoint
  const totalCustomers = pagination.total;
  const activeCustomers = customers.filter(c => c.is_active).length;
  const totalOrders = 'N/A';
  const totalRevenue = 'N/A';

  // Render based on view mode
  if (viewMode === 'view' && selectedCustomer) {
    return (
      <div className="admin-products">
        <CustomerView
          customer={selectedCustomer}
          onBack={handleBackToList}
          onEdit={handleEdit}
          canEdit={canEdit}
        />
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
  }

  if ((viewMode === 'add' || viewMode === 'edit') && selectedCustomer) {
    return (
      <div className="admin-products">
        <CustomerForm
          mode={viewMode}
          customer={selectedCustomer}
          onChange={setSelectedCustomer}
          onSave={handleSave}
          onCancel={handleBackToList}
          errors={formErrors}
          loading={saveLoading}
        />
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
  }

  // List view (default)
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
          {/* <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            {canEdit && (
              <button className="btn-primary" onClick={handleAdd}>
                + Add Customer
              </button>
            )}
            <div className="stat-card" style={{margin: 0, padding: '12px 20px'}}>
              <div className="stat-icon" style={{fontSize: '24px', width: 'auto', height: 'auto'}}>🛒</div>
              <div className="stat-info">
                <div className="stat-value" style={{fontSize: '20px'}}>{cartCount}</div>
                <div className="stat-label">Cart Items</div>
              </div>
            </div>
          </div> */}
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
        {/* <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-label">Total Orders ({totalOrders})</div>
          </div>
        </div> */}
        {/* <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue ({totalRevenue})</div>
          </div>
        </div> */}
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

      {/* Delete Confirmation Modal */}
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

export default AdminCustomers;
