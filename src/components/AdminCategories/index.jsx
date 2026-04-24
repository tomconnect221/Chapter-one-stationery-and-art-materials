import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AdminProducts/AdminProducts.css';
import './AdminCategoriesStyling.css';

const AdminCategories = ({ userType = 'admin' }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use different endpoint for subadmin
      const endpoint = userType === 'subadmin'
        ? `${import.meta.env.VITE_API_URL}/api/subadmin/categories`
        : `${import.meta.env.VITE_API_URL}/api/admin/categories`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const apiCategories = response.data.data;
        const mappedCategories = apiCategories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          is_active: category.is_active,
          created_at: category.created_at,
          updated_at: category.updated_at,
          products_count: category.products ? category.products.length : 0,
          status: category.is_active ? 'active' : 'inactive'
        }));
        setCategories(mappedCategories);
      } else {
        setError('Failed to fetch categories');
        toast.error('Failed to fetch categories');
      }
    } catch (err) {
      // const errorMessage = err.response?.data?.message === 'Unauthenticated.'
      //   ? 'Authentication failed. Please log in again.'
      //   : 'Failed to fetch categories';
      setError( err.response?.data?.message || 'Failed to fetch categories');
      toast.error( err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = userType === 'admin' || userType === 'subadmin';
  const canDelete = userType === 'admin'; // Only admins can delete categories

  // Pagination calculations
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedCategory({
      name: '',
      description: '',
      image: null,
      is_active: true
    });
    setFormErrors({});
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setModalMode('edit');
    setSelectedCategory({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      is_active: category.is_active
    });
    setFormErrors({});
    setImagePreview(category.image ? `${import.meta.env.VITE_API_URL}/storage/${category.image}` : null);
    setShowModal(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleteLoading(categoryToDelete.id);

      const deleteEndpoint = userType === 'subadmin'
        ? `${import.meta.env.VITE_API_URL}/api/subadmin/categories/${categoryToDelete.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/categories/${categoryToDelete.id}`;

      const response = await axios.delete(
        deleteEndpoint,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Category deleted successfully');
        setCategories(categories.filter(c => c.id !== categoryToDelete.id));
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setFormErrors({});

      const formData = new FormData();
      formData.append('name', selectedCategory.name);
      formData.append('description', selectedCategory.description);
      formData.append('is_active', selectedCategory.is_active ? '1' : '0');

      // Append image if it's a file (new upload)
      if (selectedCategory.image instanceof File) {
        formData.append('image', selectedCategory.image);
      }

      let response;

      // Use different endpoint for subadmin
      const createEndpoint = userType === 'subadmin'
        ? `${import.meta.env.VITE_API_URL}/api/subadmin/categories`
        : `${import.meta.env.VITE_API_URL}/api/admin/categories`;

      const updateEndpoint = userType === 'subadmin'
        ? `${import.meta.env.VITE_API_URL}/api/subadmin/categories/${selectedCategory.id}?_method=POST`
        : `${import.meta.env.VITE_API_URL}/api/admin/categories/${selectedCategory.id}?_method=POST`;

      if (modalMode === 'add') {
        // Create category
        response = await axios.post(
          createEndpoint,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          toast.success('Category created successfully');
          setShowModal(false);
          fetchCategories();
        }
      } else {
        // Update category
        response = await axios.post(
          updateEndpoint,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          toast.success('Category updated successfully');
          setShowModal(false);
          fetchCategories();
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedCategory({ ...selectedCategory, image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedCategory({ ...selectedCategory, image: null });
    setImagePreview(null);
  };

  const handleStatusChange = async (categoryId, newStatus) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      const formData = new FormData();
      formData.append('name', category.name);
      formData.append('description', category.description);
      formData.append('is_active', newStatus === 'active' ? '1' : '0');
      formData.append('_method', 'PUT');

      if (category.image && !(category.image instanceof File)) {
        formData.append('existing_image', category.image);
      }

      const statusEndpoint = userType === 'subadmin'
        ? `${import.meta.env.VITE_API_URL}/api/subadmin/categories/${categoryId}`
        : `${import.meta.env.VITE_API_URL}/api/admin/categories/${categoryId}`;

      const response = await axios.post(
        statusEndpoint,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Category status updated successfully');
        setCategories(categories.map(c =>
          c.id === categoryId ? { ...c, is_active: newStatus === 'active', status: newStatus } : c
        ));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update category status';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="admin-products">
        <ToastContainer />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
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
          <button className="btn-retry" onClick={fetchCategories}>
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
          <h1>Categories Management</h1>
          <p>Manage product categories</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={handleAdd}>
            + Add Category
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            {/* <div className="stat-value"></div> */}
            <div className="stat-label">Total Categories ({categories.length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            {/* <div className="stat-value"></div> */}
            <div className="stat-label">Active ({categories.filter(c => c.status === 'active').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            {/* <div className="stat-value"></div> */}
            <div className="stat-label">Total Products ({categories.reduce((sum, c) => sum + c.products_count, 0)})</div>
          </div>
        </div>
      </div>

      <div className="filters-section justify-content-between">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search categories..."
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
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Products</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.length > 0 ? (
              currentCategories.map(category => (
                <tr key={category.id}>
                  {console.log(`${import.meta.env.VITE_API_URL}/storage/${category.image}`)}
                  <td>
                    {category.image ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL}/storage/${category.image}`} 
                        alt={category.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6c757d',
                        fontSize: '12px'
                      }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td><strong>{category.name}</strong></td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {category.description || 'No description'}
                    </div>
                  </td>
                  <td>{category.products_count}</td>
                  <td>
                    {canEdit ? (
                      <select
                        value={category.status}
                        onChange={(e) => handleStatusChange(category.id, e.target.value)}
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
                      <span className={`status-badge ${category.status}`}>
                        {category.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>
                      {new Date(category.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="action-button d-flex justify-content-center align-items-center gap-2">
                      {canEdit && (
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(category)}
                          title="Edit"
                          disabled={deleteLoading === category.id}
                        >
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDeleteClick(category)}
                          title="Delete"
                          disabled={deleteLoading === category.id}
                        >
                          {deleteLoading === category.id ? (
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
                <td colSpan="7" className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">📁</span>
                    <p>No categories found</p>
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
      {filteredCategories.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCategories.length)} of {filteredCategories.length} entries
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
        <CategoryModal
          mode={modalMode}
          category={selectedCategory}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          onChange={setSelectedCategory}
          onImageChange={handleImageChange}
          onRemoveImage={handleRemoveImage}
          imagePreview={imagePreview}
          errors={formErrors}
          loading={saveLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          category={categoryToDelete}
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
          loading={deleteLoading === categoryToDelete?.id}
        />
      )}
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ category, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Delete Category</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          <div className="delete-confirmation">
            <div className="warning-icon">⚠️</div>
            <h3>Are you sure you want to delete this category?</h3>
            <p>This action cannot be undone. The following category will be permanently deleted:</p>
            <div className="category-details">
              <strong>{category?.name}</strong>
              <p>{category?.description || 'No description'}</p>
              <p>Products: {category?.products_count}</p>
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
              'Delete Category'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryModal = ({ mode, category, onSave, onClose, onChange, onImageChange, onRemoveImage, imagePreview, errors, loading }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add Category' : 'Edit Category'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-grid" style={{gridTemplateColumns: '1fr'}}>
            {/* Image Upload */}
            <div className="form-field">
              <label>Category Image</label>
              <div className="image-upload-container">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={onRemoveImage}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-placeholder">
                    <span>📁</span>
                    <p>Click to upload image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="image-upload-input"
                />
              </div>
              {errors.image && <span className="error-message">{errors.image[0]}</span>}
            </div>

            <div className="form-field">
              <label>Category Name *</label>
              <input
                type="text"
                value={category.name}
                onChange={(e) => onChange({ ...category, name: e.target.value })}
                placeholder="Enter category name"
                className={errors.name ? 'error' : ''}
                disabled={loading}
              />
              {errors.name && <span className="error-message">{errors.name[0]}</span>}
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                value={category.description}
                onChange={(e) => onChange({ ...category, description: e.target.value })}
                placeholder="Enter category description"
                rows="3"
                className={errors.description ? 'error' : ''}
                disabled={loading}
              />
              {errors.description && <span className="error-message">{errors.description[0]}</span>}
            </div>

            <div className="form-field">
              <label>Status *</label>
              <select
                value={category.is_active}
                onChange={(e) => onChange({ ...category, is_active: e.target.value === 'true' })}
                disabled={loading}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
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
              mode === 'add' ? 'Add Category' : 'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;