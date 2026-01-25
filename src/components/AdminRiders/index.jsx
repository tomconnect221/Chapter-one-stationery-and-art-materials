import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AdminProducts/AdminProducts.css';
import './RiderModal.css';

const AdminRiders = ({ userType = 'admin', userBranch = null }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRider, setSelectedRider] = useState(null);
  const [riderToDelete, setRiderToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formErrors, setFormErrors] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { token, user } = useSelector((state) => state.auth);
console.log(user);
  const vehicleTypes = ['bike', 'car', 'van', 'bicycle'];

  useEffect(() => {
    fetchRiders();
  }, [token]);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/riders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 console.log(response)
      if (response.data.success) {
        const apiRiders = response.data.data;
        const mappedRiders = apiRiders.map(rider => ({
          id: rider.id,
          name: rider.name,
          email: rider.email,
          phone: rider.phone,
          license_number: rider.license_number,
          vehicle_type: rider.vehicle_type,
          vehicle_number: rider.vehicle_number,
          status: rider.status,
          latitude: rider.latitude,
          longitude: rider.longitude,
          is_active: rider.is_active,
          created_at: rider.created_at,
          updated_at: rider.updated_at,
          active_status: rider.is_active ? 'active' : 'inactive'
        }));
        setRiders(mappedRiders);
      } else {
        setError('Failed to fetch riders');
        toast.error('Failed to fetch riders');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message === 'Unauthenticated.' 
        ? 'Authentication failed. Please log in again.'
        : 'Failed to fetch riders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = userType === 'admin' || userType === 'subadmin';

  // Pagination calculations
  const filteredRiders = riders.filter(rider => {
    const matchesSearch = rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rider.phone.includes(searchTerm) ||
                         rider.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rider.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || rider.active_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRiders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRiders = filteredRiders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleAddRider = () => {
    setModalMode('add');
    setSelectedRider({
      name: '',
      email: '',
      phone: '',
      license_number: '',
      vehicle_type: 'bike',
      vehicle_number: '',
      password: '',
      password_confirmation: '',
      is_active: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEditRider = (rider) => {
    setModalMode('edit');
    setSelectedRider({
      id: rider.id,
      name: rider.name,
      email: rider.email,
      phone: rider.phone,
      license_number: rider.license_number,
      vehicle_type: rider.vehicle_type,
      vehicle_number: rider.vehicle_number,
      is_active: rider.is_active,
      password: '',
      password_confirmation: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const fetchRiderDetails = async (riderId) => {
    try {
      setDetailsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/riders/${riderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch rider details');
      }
    } catch (error) {
      toast.error('Failed to load rider details');
      return null;
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewRider = async (rider) => {
    setModalMode('view');
    setShowModal(true);
    
    // Fetch detailed rider information
    const detailedRider = await fetchRiderDetails(rider.id);
    if (detailedRider) {
      setSelectedRider(detailedRider);
    } else {
      setSelectedRider(rider); // Fallback to basic info
    }
  };

  const handleDeleteClick = (rider) => {
    setRiderToDelete(rider);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!riderToDelete) return;

    try {
      setDeleteLoading(riderToDelete.id);

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/riders/${riderToDelete.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Rider deleted successfully');
        setRiders(riders.filter(r => r.id !== riderToDelete.id));
        setShowDeleteModal(false);
        setRiderToDelete(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete rider';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setRiderToDelete(null);
  };

  const handleSaveRider = async () => {
    try {
      setSaveLoading(true);
      setFormErrors({});

      const formData = new URLSearchParams();
      formData.append('name', selectedRider.name);
      formData.append('email', selectedRider.email);
      formData.append('phone', selectedRider.phone);
      formData.append('license_number', selectedRider.license_number);
      formData.append('vehicle_type', selectedRider.vehicle_type);
      formData.append('vehicle_number', selectedRider.vehicle_number);

      let response;

      if (modalMode === 'add') {
        // Create rider
        formData.append('password', selectedRider.password);
        formData.append('password_confirmation', selectedRider.password_confirmation);

        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/riders`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (response.data.success) {
          toast.success('Rider created successfully');
          setShowModal(false);
          fetchRiders();
        }
      } else {
        // Update rider
        formData.append('is_active', selectedRider.is_active ? '1' : '0');

        // Only append password if provided
        if (selectedRider.password) {
          formData.append('password', selectedRider.password);
          formData.append('password_confirmation', selectedRider.password_confirmation);
        }

        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/admin/riders/${selectedRider.id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (response.data.success) {
          toast.success('Rider updated successfully');
          setShowModal(false);
          fetchRiders();
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        
        if (responseData.errors) {
          setFormErrors(responseData.errors);
          const errorMessage = responseData.message || 'Validation failed';
          toast.error(errorMessage);
        } else {
          const errorMessage = responseData.message || 'An error occurred';
          toast.error(errorMessage);
        }
      } else {
        toast.error('Network error occurred');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleStatusChange = async (riderId, newStatus) => {
    try {
      const rider = riders.find(r => r.id === riderId);
      if (!rider) return;

      const formData = new URLSearchParams();
      formData.append('name', rider.name);
      formData.append('email', rider.email);
      formData.append('phone', rider.phone);
      formData.append('license_number', rider.license_number);
      formData.append('vehicle_type', rider.vehicle_type);
      formData.append('vehicle_number', rider.vehicle_number);
      formData.append('is_active', newStatus === 'active' ? '1' : '0');

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/riders/${riderId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.success) {
        toast.success('Rider status updated successfully');
        setRiders(riders.map(r =>
          r.id === riderId ? { ...r, is_active: newStatus === 'active', active_status: newStatus } : r
        ));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update rider status';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="admin-products">
        <ToastContainer />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading riders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-products">
        <ToastContainer />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>Error: {error}</p>
          <button className="btn-retry" onClick={fetchRiders}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="products-header">
        <div>
          <h1>Dispatch Riders Management</h1>
          <p>Manage delivery personnel</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={handleAddRider}>
            + Add Rider
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">🏍️</div>
          <div className="stat-info"> 
            {/* <div className="stat-value">{riders.length}</div> */}
            <div className="stat-label ">Total Riders ({riders.length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            {/* <div className="stat-value">{riders.filter(r => r.active_status === 'active').length}</div> */}
            <div className="stat-label">Active ({riders.filter(r => r.active_status === 'active').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            {/* <div className="stat-value">{riders.filter(r => r.status === 'online').length}</div> */}
            <div className="stat-label">Online ({riders.filter(r => r.status === 'online').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">📱</div>
          <div className="stat-info">
            {/* <div className="stat-value">{riders.filter(r => r.status === 'offline').length}</div> */}
            <div className="stat-label">Offline ({riders.filter(r => r.status === 'offline').length})</div>
          </div>
        </div>
      </div>

      <div className="filters-section justify-content-between">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search riders by name, email, phone, license or vehicle number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="pagination-controls-top">
          <div className="items-per-page">
            <label>Show:</label>
            <select 
              value={itemsPerPage} 
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="page-select"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Rider</th>
              <th>Contact Info</th>
              <th>License Number</th>
              <th>Vehicle Details</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRiders.length > 0 ? (
              currentRiders.map(rider => (
                <tr key={rider.id}>
                  <td>
                    <div className="product-cell">
                      <div className="product-name" style={{fontWeight: 600}}>{rider.name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontSize: '13px'}}>
                      <div>{rider.email}</div>
                      <div style={{color: '#6c757d'}}>{rider.phone}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{fontSize: '13px', fontFamily: 'monospace'}}>
                      {rider.license_number}
                    </span>
                  </td>
                  <td>
                    <div style={{fontSize: '13px'}}>
                      <div style={{textTransform: 'capitalize'}}>{rider.vehicle_type}</div>
                      <div style={{color: '#6c757d', fontFamily: 'monospace'}}>{rider.vehicle_number}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                      {/* {canEdit ? (
                        <select
                          value={rider.active_status}
                          onChange={(e) => handleStatusChange(rider.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #dee2e6',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`status-badge ${rider.active_status === 'active' ? 'active' : 'inactive'}`}>
                          {rider.active_status}
                        </span>
                      )} */}
                      <span className={`status-badge text-center badge ${rider.status === 'available' ? 'active' : 'inactive'}`}>
                        {rider.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{fontSize: '13px'}}>
                      {new Date(rider.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="action-button d-flex gap-2">
                      <button className="btn-icon" onClick={() => handleViewRider(rider)} title="View">
                        👁️
                      </button>
                      {canEdit && (
                        <>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleEditRider(rider)} 
                            title="Edit"
                            disabled={deleteLoading === rider.id}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon danger" 
                            onClick={() => handleDeleteClick(rider)} 
                            title="Delete"
                            disabled={deleteLoading === rider.id}
                          >
                            {deleteLoading === rider.id ? (
                              <div className="button-spinner-small"></div>
                            ) : (
                              '🗑️'
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">🏍️</span>
                    <p>No riders found</p>
                    {searchTerm && (
                      <button 
                        className="btn-clear-search"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredRiders.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRiders.length)} of {filteredRiders.length} entries
          </div>
          
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="pagination-ellipsis">...</span>
                  <button
                    className="pagination-number"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <RiderModal
          mode={modalMode}
          rider={selectedRider}
          onSave={handleSaveRider}
          onClose={() => setShowModal(false)}
          onChange={setSelectedRider}
          errors={formErrors}
          loading={saveLoading}
          detailsLoading={detailsLoading}
          vehicleTypes={vehicleTypes}
          canEdit={canEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          rider={riderToDelete}
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
          loading={deleteLoading === riderToDelete?.id}
        />
      )}
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ rider, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Delete Rider</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          <div className="delete-confirmation">
            <div className="warning-icon">⚠️</div>
            <h3>Are you sure you want to delete this rider?</h3>
            <p>This action cannot be undone. The following rider will be permanently deleted:</p>
            <div className="rider-details">
              <strong>{rider?.name}</strong>
              <p>{rider?.email}</p>
              <p>{rider?.phone}</p>
              <p>License: {rider?.license_number}</p>
              <p>Vehicle: {rider?.vehicle_type} - {rider?.vehicle_number}</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Deleting...
              </>
            ) : (
              'Delete Rider'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const RiderModal = ({ mode, rider, onSave, onClose, onChange, errors, loading, detailsLoading, vehicleTypes, canEdit }) => {
  const isView = mode === 'view';

  const getVehicleIcon = (type) => {
    const icons = {
      bike: '🏍️',
      car: '🚗',
      van: '🚐',
      bicycle: '🚲'
    };
    return icons[type] || '🚗';
  };

  const getStatusColor = (status) => {
    const colors = {
      online: '#28a745',
      offline: '#6c757d',
      busy: '#ffc107',
      available: '#17a2b8'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rider-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rider-modal-header">
          <div className="header-content">
            <div className="rider-avatar">
              <div className="avatar-circle">
                {rider?.name ? rider.name.charAt(0).toUpperCase() : '👤'}
              </div>
            </div>
            <div className="rider-title">
              <h2>{rider?.name || 'Rider Details'}</h2>
              <div className="rider-meta">
                {isView && (
                  <>
                    <span 
                      className="status-dot" 
                      style={{ backgroundColor: getStatusColor(rider?.status) }}
                    ></span>
                    <span className="status-text">{rider?.status || 'Unknown'}</span>
                    <span className="vehicle-info">
                      {getVehicleIcon(rider?.vehicle_type)} {rider?.vehicle_type}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {/* Body */}
        <div className="rider-modal-body">
          {detailsLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading rider details...</p>
            </div>
          ) : rider ? (
            <div className="rider-content">
              {isView ? (
                // View Mode - Card Layout
                <div className="info-cards">
                  <div className="info-card">
                    <div className="card-header">
                      <span className="card-icon">👤</span>
                      <h3>Personal Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <label>Full Name</label>
                        <span className="info-value">{rider.name}</span>
                      </div>
                      <div className="info-row">
                        <label>Email Address</label>
                        <span className="info-value">{rider.email}</span>
                      </div>
                      <div className="info-row">
                        <label>Phone Number</label>
                        <span className="info-value">{rider.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="card-header">
                      <span className="card-icon">{getVehicleIcon(rider.vehicle_type)}</span>
                      <h3>Vehicle Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="info-row">
                        <label>License Number</label>
                        <span className="info-value license-number">{rider.license_number}</span>
                      </div>
                      <div className="info-row">
                        <label>Vehicle Type</label>
                        <span className="info-value vehicle-type">
                          {getVehicleIcon(rider.vehicle_type)} {rider.vehicle_type}
                        </span>
                      </div>
                      <div className="info-row">
                        <label>Vehicle Number</label>
                        <span className="info-value vehicle-number">{rider.vehicle_number}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="card-header">
                      <span className="card-icon">📊</span>
                      <h3>Status & Activity</h3>
                    </div>
                    <div className="card-content">
                      <div className="stats-grid">
                        <div className="stat-item">
                          <span className="stat-label">Current Status</span>
                          <span className="stat-value status-badge" style={{ backgroundColor: getStatusColor(rider.status) }}>
                            {rider.status}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Account Status</span>
                          <span className={`stat-value ${rider.is_active ? 'active' : 'inactive'}`}>
                            {rider.is_active ? '✅ Active' : '❌ Inactive'}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Joined Date</span>
                          <span className="stat-value">{new Date(rider.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Last Updated</span>
                          <span className="stat-value">{new Date(rider.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {rider.orders && rider.orders.length > 0 && (
                    <div className="info-card">
                      <div className="card-header">
                        <span className="card-icon">📦</span>
                        <h3>Recent Orders ({rider.orders.length})</h3>
                      </div>
                      <div className="card-content">
                        <div className="orders-list">
                          {rider.orders.map((order, index) => (
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
              ) : (
                // Edit/Add Mode - Form Layout
                <div className="form-container">
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
                          value={rider.name || ''}
                          onChange={(e) => onChange({ ...rider, name: e.target.value })}
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
                          value={rider.email || ''}
                          onChange={(e) => onChange({ ...rider, email: e.target.value })}
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
                          value={rider.phone || ''}
                          onChange={(e) => onChange({ ...rider, phone: e.target.value })}
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
                          value={rider.license_number || ''}
                          onChange={(e) => onChange({ ...rider, license_number: e.target.value })}
                          disabled={loading}
                          placeholder="Enter license number"
                          className={`modern-input ${errors.license_number ? 'error' : ''}`}
                        />
                        {errors.license_number && <span className="field-error">{errors.license_number[0]}</span>}
                      </div>

                      <div className="form-field">
                        <label>Vehicle Type *</label>
                        <select
                          value={rider.vehicle_type || 'bike'}
                          onChange={(e) => onChange({ ...rider, vehicle_type: e.target.value })}
                          disabled={loading}
                          className={`modern-select ${errors.vehicle_type ? 'error' : ''}`}
                        >
                          {vehicleTypes.map(type => (
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
                          value={rider.vehicle_number || ''}
                          onChange={(e) => onChange({ ...rider, vehicle_number: e.target.value })}
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
                            value={rider.is_active}
                            onChange={(e) => onChange({ ...rider, is_active: e.target.value === 'true' })}
                            disabled={loading}
                            className="modern-select"
                          >
                            <option value={true}>✅ Active</option>
                            <option value={false}>❌ Inactive</option>
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
                          value={rider.password || ''}
                          onChange={(e) => onChange({ ...rider, password: e.target.value })}
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
                          value={rider.password_confirmation || ''}
                          onChange={(e) => onChange({ ...rider, password_confirmation: e.target.value })}
                          disabled={loading}
                          placeholder={mode === 'add' ? 'Confirm password' : 'Confirm new password'}
                          className={`modern-input ${errors.password_confirmation ? 'error' : ''}`}
                        />
                        {errors.password_confirmation && <span className="field-error">{errors.password_confirmation[0]}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No rider data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rider-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            {isView ? 'Close' : 'Cancel'}
          </button>
          {!isView && canEdit && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRiders;