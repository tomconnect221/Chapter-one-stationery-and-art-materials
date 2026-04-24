import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AdminProducts/AdminProducts.css';
import './RiderModal.css';

// Import new separate components
import RiderView from './RiderView';
import RiderForm from './RiderForm';

const AdminRiders = ({ userType = 'admin', userBranch = null }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('list'); // 'list', 'view', 'add', 'edit'
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
    
    // Fetch detailed rider information
    const detailedRider = await fetchRiderDetails(rider.id);
    if (detailedRider) {
      setSelectedRider(detailedRider);
    } else {
      setSelectedRider(rider); // Fallback to basic info
    }
  };

  const handleBackToList = () => {
    setModalMode('list');
    setSelectedRider(null);
    setFormErrors({});
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
          setModalMode('list');
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
          setModalMode('list');
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

  // Render based on view mode
  if (modalMode === 'view' || modalMode === 'edit' || modalMode === 'add') {
    return (
      <div className="admin-products">
        <ToastContainer />
        {modalMode === 'view' ? (
          <RiderView
            rider={selectedRider}
            onBack={handleBackToList}
            onEdit={handleEditRider}
            canEdit={canEdit}
          />
        ) : (
          <RiderForm
            mode={modalMode}
            rider={selectedRider}
            onSave={handleSaveRider}
            onCancel={handleBackToList}
            onChange={setSelectedRider}
            errors={formErrors}
            loading={saveLoading}
            vehicleTypes={vehicleTypes}
          />
        )}
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
  }

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
            <div className="stat-label ">Total Riders ({riders.length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Active ({riders.filter(r => r.active_status === 'active').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <div className="stat-label">Online ({riders.filter(r => r.status === 'online').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">📱</div>
          <div className="stat-info">
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
                    <span className={`status-badge text-center badge ${rider.status === 'available' ? 'active' : 'inactive'}`}>
                      {rider.status}
                    </span>
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

export default AdminRiders;
