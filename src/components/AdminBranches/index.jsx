import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminBranchesstyle.css';

const AdminBranches = ({ userType = 'admin', userBranch = null }) => {
  console.log('AdminBranches: userType received:', userType, 'userBranch:', userBranch);

  const [branches, setBranches] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null); // Track which branch is being deleted

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // New delete modal state
  const [modalMode, setModalMode] = useState('add');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchToDelete, setBranchToDelete] = useState(null); // Track branch to delete
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { token,user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchBranches();
  }, [token]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const URL = user?.role == 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/branches` : `${import.meta.env.VITE_API_URL}/api/subadmin/branches`
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const apiBranches = response.data.data;

        const mappedBranches = apiBranches.map(branch => ({
          id: branch.id,
          name: branch.name,
          code: branch.id,
          address: branch.address,
          phone: branch.phone,
          email: branch.email,
          latitude: branch.latitude,
          longitude: branch.longitude,
          is_active: branch.is_active,
          manager: branch.subadmins && branch.subadmins.length > 0 ? branch.subadmins[0].name : 'Unassigned',
          managerId: branch.subadmins && branch.subadmins.length > 0 ? branch.subadmins[0].id : null,
          staff: branch.subadmins ? branch.subadmins.length : 0,
          products: branch.products ? branch.products.length : 0,
          status: branch.is_active ? 'active' : 'inactive',
          created_at: branch.created_at,
          updated_at: branch.updated_at
        }));

        const allSubAdmins = [];
        apiBranches.forEach(branch => {
          if (branch.subadmins) {
            branch.subadmins.forEach(subadmin => {
              allSubAdmins.push({
                id: subadmin.id,
                name: subadmin.name,
                email: subadmin.email,
                branch: branch.name
              });
            });
          }
        });

        setBranches(mappedBranches);
        setSubAdmins(allSubAdmins);
      } else {
        setError('Failed to fetch branches');
        toast.error('Failed to fetch branches');
      }
    } catch (err) {
      const errorMessage = err.response && err.response.data && err.response.data.message === 'Unauthenticated.' 
        ? 'Authentication failed. Please log in again.'
        : 'Failed to fetch branches';
        // console.log(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Determine edit permissions based on user type and branch assignment
  const canEdit = userType === 'admin' || (userType === 'subadmin' && userBranch);
  const canCreate = userType === 'admin';
  const canDelete = userType === 'admin';
  console.log('AdminBranches: permissions - canEdit:', canEdit, 'canCreate:', canCreate, 'canDelete:', canDelete, 'userType:', userType, 'userBranch:', userBranch);

  // Filter branches based on user permissions
  let filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // For sub-admins, only show their assigned branch
  if (userType === 'subadmin' && userBranch) {
    filteredBranches = filteredBranches.filter(branch => branch.id === userBranch.id);
  }

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedBranch({
      name: '',
      address: '',
      phone: '',
      email: '',
      latitude: '',
      longitude: '',
      is_active: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (branch) => {
    // For sub-admins, only allow editing their own branch
    if (userType === 'subadmin' && userBranch && branch.id !== userBranch.id) {
      console.log('AdminBranches: Sub-admin attempted to edit branch they do not own');
      return;
    }

    setModalMode('edit');
    setSelectedBranch({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      latitude: branch.latitude,
      longitude: branch.longitude,
      is_active: branch.is_active
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleAssignManager = (branch) => {
    setSelectedBranch(branch);
    setShowAssignModal(true);
  };

  const handleAssign = (adminId) => {
    const admin = subAdmins.find(a => a.id === adminId);
    if (admin) {
      setBranches(branches.map(b =>
        b.id === selectedBranch.id
          ? { ...b, manager: admin.name, managerId: adminId }
          : b
      ));
      setSubAdmins(subAdmins.map(a =>
        a.id === adminId
          ? { ...a, branch: selectedBranch.name }
          : a
      ));
    }
    setShowAssignModal(false);
  };

  const handleDeleteClick = (branch) => {
    // Only admins can delete branches
    if (userType !== 'admin') {
      console.log('AdminBranches: Non-admin attempted to delete branch');
      return;
    }

    setBranchToDelete(branch);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    console.log('AdminBranches: handleDelete called, canEdit:', canEdit);
    if (!branchToDelete) return;

    try {
      console.log('AdminBranches: Attempting to delete branch:', branchToDelete.id);
      setDeleteLoading(branchToDelete.id);
      setMessage(null);

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/branches/${branchToDelete.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Branch deleted successfully' });
        toast.success('Branch deleted successfully');
        setBranches(branches.filter(b => b.id !== branchToDelete.id));
        setShowDeleteModal(false);
        setBranchToDelete(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete branch';
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setBranchToDelete(null);
  };

  const handleSave = async () => {
    console.log('AdminBranches: handleSave called, canEdit:', canEdit, 'modalMode:', modalMode);
    try {
      setSaveLoading(true);
      setFormErrors({});
      setMessage(null);

      const formData = new URLSearchParams();
      formData.append('name', selectedBranch.name);
      formData.append('address', selectedBranch.address);
      formData.append('phone', selectedBranch.phone);
      formData.append('email', selectedBranch.email);

      // Only append latitude and longitude if they are not empty
      if (selectedBranch.latitude && selectedBranch.latitude.trim() !== '') {
        formData.append('latitude', selectedBranch.latitude);
      }

      if (selectedBranch.longitude && selectedBranch.longitude.trim() !== '') {
        formData.append('longitude', selectedBranch.longitude);
      }

      let response;

      if (modalMode === 'add') {
        console.log('AdminBranches: Attempting to create branch');
        // Create branch
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/branches`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
      } else {
        console.log('AdminBranches: Attempting to update branch');
        // Update branch
        formData.append('is_active', selectedBranch.is_active ? '1' : '0');

        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/admin/branches/${selectedBranch.id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
      }

      if (response.data.success) {
        const successMessage = modalMode === 'add' ? 'Branch created successfully' : 'Branch updated successfully';
        setMessage({ type: 'success', text: successMessage });
        toast.success(successMessage);
        setShowModal(false);
        fetchBranches();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const responseData = error.response.data;

        if (responseData.errors) {
          setFormErrors(responseData.errors);
          const errorMessage = responseData.message || 'Validation failed';
          setMessage({ type: 'error', text: errorMessage });
          toast.error(errorMessage);
        } else if (responseData.message === 'Not Found') {
          setMessage({ type: 'error', text: 'Branch not found' });
          toast.error('Branch not found');
        } else {
          const errorMessage = responseData.message || 'An error occurred';
          setMessage({ type: 'error', text: errorMessage });
          toast.error(errorMessage);
        }
      } else {
        setMessage({ type: 'error', text: 'Network error occurred' });
        toast.error('Network error occurred');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="admin-branches">
        <ToastContainer />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading branches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-branches">
        <ToastContainer />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>Error: {error}</p>
          <button className="btn-retry" onClick={fetchBranches}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-branches">
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

      {/* Message Display */}
      {message && (
        <div className={`message-alert ${message.type}`}>
          {message.text}
          <button
            className="message-close"
            onClick={() => setMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="branches-header">
        <div className="header-content">
          <h1>Branches Management</h1>
          <p>Manage store branches and assign managers</p>
        </div>
        {canCreate && (
          <button className="btn-primary jumia-btn" onClick={handleAdd}>
            <span className="btn-icon">+</span>
            Add New Branch
          </button>
        )}
      </div>

      <div className="stats-grid jumia-stats">
        <div className="stat-card jumia-stat  d-flex align-items-center gap-3">
          <div className="stat-icon orange">🏢</div>
          <div className="stat-info">
            {/* <div className="stat-value">{branches.length}</div> */}
            <div className="stat-label">Total Branches ({branches.length})</div>
          </div>
        </div>
        <div className="stat-card jumia-stat  d-flex align-items-center gap-3">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            {/* <div className="stat-value">{branches.filter(b => b.status === 'active').length}</div> */}
            <div className="stat-label">Active Branches ({branches.filter(b => b.status === 'active').length})</div>
          </div>
        </div>
        <div className="stat-card jumia-stat  d-flex align-items-center gap-3">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            {/* <div className="stat-value">{branches.reduce((sum, b) => sum + b.staff, 0)}</div> */}
            <div className="stat-label">Total Staff ({branches.reduce((sum, b) => sum + b.staff, 0)})</div>
          </div>
        </div>
        <div className="stat-card jumia-stat  d-flex align-items-center gap-3">
          <div className="stat-icon purple">📦</div>
          <div className="stat-info">
            {/* <div className="stat-value">{branches.reduce((sum, b) => sum + b.products, 0)}</div> */}
            <div className="stat-label">Total Products ({branches.reduce((sum, b) => sum + b.products, 0)})</div>
          </div>
        </div>
      </div>

      <div className="filters-section jumia-filters">
        <div className="search-box jumia-search">
          <input
            type="text"
            placeholder="Search branches by name, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

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

      <div className="table-container jumia-table">
        <table className="branches-table">
          <thead>
            <tr>
              <th>Branch Name</th>
              <th>Location</th>
              <th>Contact Info</th>
              <th>Manager</th>
              <th>Staff</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBranches.length > 0 ? (
              currentBranches.map(branch => (
                <tr key={branch.id} className="branch-row">
                  <td>
                    <div className="branch-name">
                      <strong>{branch.name}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="branch-address">
                      {branch.address}
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="phone">{branch.phone}</div>
                      <div className="email">{branch.email}</div>
                    </div>
                  </td>
                  <td>
                    {branch.manager === 'Unassigned' ? (
                      <span className="unassigned">Not Assigned</span>
                    ) : (
                      <div className="manager-info">
                        <strong>{branch.manager}</strong>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="staff-count">{branch.staff}</span>
                  </td>
                  <td>
                    <span className="products-count">{branch.products}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${branch.status}`}>
                      {branch.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-button" style={{ display: 'flex', gap: '10px' }}>
                      {/* Only admins can assign managers */}
                      {userType === 'admin' && (
                        <button
                          className="btn-action assign"
                          onClick={() => handleAssignManager(branch)}
                          title="Assign Manager"
                        >
                          👤
                        </button>
                      )}
                      {/* Sub-admins can edit their own branch, admins can edit all */}
                      {canEdit && (userType === 'admin' || (userType === 'subadmin' && userBranch && branch.id === userBranch.id)) && (
                        <button
                          className="btn-action edit"
                          onClick={() => handleEdit(branch)}
                          title="Edit Branch"
                        >
                          ✏️
                        </button>
                      )}
                      {/* Only admins can delete branches */}
                      {canDelete && (
                        <button
                          className="btn-action delete"
                          onClick={() => handleDeleteClick(branch)}
                          title="Delete Branch"
                          disabled={deleteLoading === branch.id}
                        >
                          {deleteLoading === branch.id ? (
                            <div className="button-spinner-small"></div>
                          ) : (
                            '🗑️'
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">🏢</span>
                    <p>No branches found</p>
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
      {filteredBranches.length > 0 && (
        <div className="pagination-container jumia-pagination">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBranches.length)} of {filteredBranches.length} entries
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
        <BranchModal
          mode={modalMode}
          branch={selectedBranch}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          onChange={setSelectedBranch}
          errors={formErrors}
          loading={saveLoading}
        />
      )}

      {showAssignModal && (
        <AssignManagerModal
          branch={selectedBranch}
          subAdmins={subAdmins.filter(a => !a.branch)}
          onAssign={handleAssign}
          onClose={() => setShowAssignModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          branch={branchToDelete}
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
          loading={deleteLoading === branchToDelete?.id}
        />
      )}
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ branch, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-overlay jumia-modal" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Delete Branch</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          <div className="delete-confirmation">
            <div className="warning-icon">⚠️</div>
            <h3>Are you sure you want to delete this branch?</h3>
            <p>This action cannot be undone. The following branch will be permanently deleted:</p>
            <div className="branch-details">
              <strong>{branch?.name}</strong>
              <p>{branch?.address}</p>
              <p>{branch?.phone} • {branch?.email}</p>
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
              'Delete Branch'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const BranchModal = ({ mode, branch, onSave, onClose, onChange, errors, loading }) => {
  return (
    <div className="modal-overlay jumia-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add New Branch' : 'Edit Branch'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-field">
              <label>Branch Name *</label>
              <input
                type="text"
                value={branch.name}
                onChange={(e) => onChange({ ...branch, name: e.target.value })}
                placeholder="Enter branch name"
                className={`form-input ${errors.name ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.name && <span className="error-message">{errors.name[0]}</span>}
            </div>

            <div className="form-field">
              <label>Phone *</label>
              <input
                type="tel"
                value={branch.phone}
                onChange={(e) => onChange({ ...branch, phone: e.target.value })}
                placeholder="09058942480"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.phone && <span className="error-message">{errors.phone[0]}</span>}
            </div>

            <div className="form-field">
              <label>Email *</label>
              <input
                type="email"
                value={branch.email}
                onChange={(e) => onChange({ ...branch, email: e.target.value })}
                placeholder="branch1@gmail.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email[0]}</span>}
            </div>

            <div className="form-field">
              <label>Latitude</label>
              <input
                type="text"
                value={branch.latitude}
                onChange={(e) => onChange({ ...branch, latitude: e.target.value })}
                placeholder="24.54642323 (optional)"
                className={`form-input ${errors.latitude ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.latitude && <span className="error-message">{errors.latitude[0]}</span>}
            </div>

            <div className="form-field">
              <label>Longitude</label>
              <input
                type="text"
                value={branch.longitude}
                onChange={(e) => onChange({ ...branch, longitude: e.target.value })}
                placeholder="24.55675534 (optional)"
                className={`form-input ${errors.longitude ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.longitude && <span className="error-message">{errors.longitude[0]}</span>}
            </div>

            {mode === 'edit' && (
              <div className="form-field">
                <label>Status *</label>
                <select
                  value={branch.is_active}
                  onChange={(e) => onChange({ ...branch, is_active: e.target.value === 'true' })}
                  className="form-select"
                  disabled={loading}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            )}

            <div className="form-field full-width">
              <label>Address *</label>
              <input
                type="text"
                value={branch.address}
                onChange={(e) => onChange({ ...branch, address: e.target.value })}
                placeholder="Enter branch address"
                className={`form-input ${errors.address ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.address && <span className="error-message">{errors.address[0]}</span>}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-primary jumia-btn"
            onClick={onSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                {mode === 'add' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              mode === 'add' ? 'Create Branch' : 'Update Branch'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssignManagerModal = ({ branch, subAdmins, onAssign, onClose }) => {
  const [selectedAdmin, setSelectedAdmin] = useState('');

  return (
    <div className="modal-overlay jumia-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Assign Manager to {branch.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-field">
              <label>Select Sub Admin *</label>
              <select
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(Number(e.target.value))}
                className="form-select"
              >
                <option value="">Choose a sub admin...</option>
                {subAdmins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </select>
            </div>
            {subAdmins.length === 0 && (
              <div className="no-admins-message">
                <span className="warning-icon">⚠️</span>
                <p>No available sub admins. All sub admins are already assigned to branches.</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary jumia-btn"
            onClick={() => onAssign(selectedAdmin)}
            disabled={!selectedAdmin}
          >
            Assign Manager
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBranches;