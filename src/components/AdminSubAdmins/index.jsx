import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AdminProducts/AdminProducts.css';

const AdminSubAdmins = ({ userType = 'admin' }) => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchSubAdmins();
    fetchBranches();
  }, [token]);

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/subadmins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const apiSubAdmins = response.data.data;
        const mappedSubAdmins = apiSubAdmins.map(admin => ({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          branch_id: admin.branch_id,
          branch: admin.branch ? admin.branch.name : 'Unassigned',
          is_active: admin.is_active,
          created_at: admin.created_at,
          updated_at: admin.updated_at,
          status: admin.is_active ? 'active' : 'inactive'
        }));
        setSubAdmins(mappedSubAdmins);
      } else {
        setError('Failed to fetch sub admins');
        toast.error('Failed to fetch sub admins');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message === 'Unauthenticated.' 
        ? 'Authentication failed. Please log in again.'
        : 'Failed to fetch sub admins';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const apiBranches = response.data.data;
        const mappedBranches = apiBranches.map(branch => ({
          id: branch.id,
          name: branch.name
        }));
        setBranches(mappedBranches);
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      toast.error('Failed to fetch branches');
    }
  };

  const canEdit = userType === 'admin';

  // Pagination calculations
  const filteredAdmins = subAdmins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAdmins = filteredAdmins.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedAdmin({ 
      name: '',
      email: '',
      branch_id: '',
      password: '',
      password_confirmation: '',
      is_active: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setModalMode('edit');
    setSelectedAdmin({ 
      id: admin.id,
      name: admin.name,
      email: admin.email,
      branch_id: admin.branch_id,
      is_active: admin.is_active,
      password: '',
      password_confirmation: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!adminToDelete) return;

    try {
      setDeleteLoading(adminToDelete.id);

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/subadmins/${adminToDelete.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Sub admin deleted successfully');
        setSubAdmins(subAdmins.filter(a => a.id !== adminToDelete.id));
        setShowDeleteModal(false);
        setAdminToDelete(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete sub admin';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setFormErrors({});

      const formData = new URLSearchParams();
      formData.append('name', selectedAdmin.name);
      formData.append('email', selectedAdmin.email);
      
      if (selectedAdmin.branch_id) {
        formData.append('branch_id', selectedAdmin.branch_id);
      }

      let response;

      if (modalMode === 'add') {
        // Create sub admin
        formData.append('password', selectedAdmin.password);
        formData.append('password_confirmation', selectedAdmin.password_confirmation);

        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/subadmins`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (response.data.success) {
          toast.success('Sub admin created successfully');
          setShowModal(false);
          fetchSubAdmins();
        }
      } else {
        // Update sub admin
        formData.append('is_active', selectedAdmin.is_active ? '1' : '0');

        // Only append password if provided
        if (selectedAdmin.password) {
          formData.append('password', selectedAdmin.password);
          formData.append('password_confirmation', selectedAdmin.password_confirmation);
        }

        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/admin/subadmins/${selectedAdmin.id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (response.data.success) {
          toast.success('Sub admin updated successfully');
          setShowModal(false);
          fetchSubAdmins();
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

  if (loading) {
    return (
      <div className="admin-products">
        <ToastContainer />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sub admins...</p>
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
          <button className="btn-retry" onClick={fetchSubAdmins}>
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
          <h1>Sub Admin Management</h1>
          <p>Manage sub admin users and assign branches</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={handleAdd}>
            + Add Sub Admin
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            {/* <div className="stat-value"></div> */}
            <div className="stat-label">Total Sub Admins ({subAdmins.length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            {/* <div className="stat-value">{subAdmins.filter(a => a.status === 'active').length}</div> */}
            <div className="stat-label">Active ({subAdmins.filter(a => a.status === 'active').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            {/* <div className="stat-value">{subAdmins.filter(a => a.branch_id).length}</div> */}
            <div className="stat-label">Assigned ({subAdmins.filter(a => a.branch_id).length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            {/* <div className="stat-value">{subAdmins.filter(a => !a.branch_id).length}</div> */}
            <div className="stat-label">Unassigned ({subAdmins.filter(a => !a.branch_id).length})</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search sub admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAdmins.length > 0 ? (
              currentAdmins.map(admin => (
                <tr key={admin.id}>
                  <td><strong>{admin.name}</strong></td>
                  <td>{admin.email}</td>
                  <td>
                    {admin.branch === 'Unassigned' ? (
                      <span style={{color: '#6c757d', fontStyle: 'italic'}}>Unassigned</span>
                    ) : (
                      <span className="status-badge active">{admin.branch}</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${admin.status}`}>
                      {admin.status}
                    </span>
                  </td>
                  <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-button gap-3 d-flex">
                      {canEdit && (
                        <>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleEdit(admin)} 
                            title="Edit"
                            disabled={deleteLoading === admin.id}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon danger" 
                            onClick={() => handleDeleteClick(admin)} 
                            title="Delete"
                            disabled={deleteLoading === admin.id}
                          >
                            {deleteLoading === admin.id ? (
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
                <td colSpan="6" className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">👥</span>
                    <p>No sub admins found</p>
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
      {filteredAdmins.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAdmins.length)} of {filteredAdmins.length} entries
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
        <SubAdminModal
          mode={modalMode}
          admin={selectedAdmin}
          branches={branches}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          onChange={setSelectedAdmin}
          errors={formErrors}
          loading={saveLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          admin={adminToDelete}
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
          loading={deleteLoading === adminToDelete?.id}
        />
      )}
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ admin, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Delete Sub Admin</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          <div className="delete-confirmation">
            <div className="warning-icon">⚠️</div>
            <h3>Are you sure you want to delete this sub admin?</h3>
            <p>This action cannot be undone. The following sub admin will be permanently deleted:</p>
            <div className="admin-details">
              <strong>{admin?.name}</strong>
              <p>{admin?.email}</p>
              <p>Branch: {admin?.branch}</p>
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
              'Delete Sub Admin'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SubAdminModal = ({ mode, admin, branches, onSave, onClose, onChange, errors, loading }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px'}}>
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add Sub Admin' : 'Edit Sub Admin'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-field">
              <label>Full Name *</label>
              <input
                type="text"
                value={admin.name}
                onChange={(e) => onChange({ ...admin, name: e.target.value })}
                placeholder="Enter full name"
                className={errors.name ? 'error' : ''}
                disabled={loading}
              />
              {errors.name && <span className="error-message">{errors.name[0]}</span>}
            </div>

            <div className="form-field">
              <label>Email *</label>
              <input
                type="email"
                value={admin.email}
                onChange={(e) => onChange({ ...admin, email: e.target.value })}
                placeholder="email@company.com"
                className={errors.email ? 'error' : ''}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email[0]}</span>}
            </div>

            <div className="form-field">
              <label>Assign Branch</label>
              <select
                value={admin.branch_id || ''}
                onChange={(e) => onChange({ ...admin, branch_id: e.target.value })}
                disabled={loading}
              >
                <option value="">Unassigned</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              {errors.branch_id && <span className="error-message">{errors.branch_id[0]}</span>}
            </div>

            <div className="form-field">
              <label>Status *</label>
              <select
                value={admin.is_active}
                onChange={(e) => onChange({ ...admin, is_active: e.target.value === 'true' })}
                disabled={loading}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>

            <div className="form-field">
              <label>
                {mode === 'add' ? 'Password *' : 'New Password (leave blank to keep current)'}
              </label>
              <input
                type="password"
                value={admin.password}
                onChange={(e) => onChange({ ...admin, password: e.target.value })}
                placeholder={mode === 'add' ? 'Enter password' : 'Enter new password'}
                className={errors.password ? 'error' : ''}
                disabled={loading}
              />
              {errors.password && <span className="error-message">{errors.password[0]}</span>}
            </div>

            <div className="form-field">
              <label>
                {mode === 'add' ? 'Confirm Password *' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                value={admin.password_confirmation}
                onChange={(e) => onChange({ ...admin, password_confirmation: e.target.value })}
                placeholder={mode === 'add' ? 'Confirm password' : 'Confirm new password'}
                className={errors.password_confirmation ? 'error' : ''}
                disabled={loading}
              />
              {errors.password_confirmation && <span className="error-message">{errors.password_confirmation[0]}</span>}
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
            className="btn-primary" 
            onClick={onSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                {mode === 'add' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              mode === 'add' ? 'Add Sub Admin' : 'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSubAdmins;