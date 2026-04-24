import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AdminProducts/AdminProducts.css';
import ProductView from './ProductView';
import ProductForm from './ProductForm';

const AdminProducts = ({ userType = 'admin' }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  
  // View mode: 'list', 'view', 'add', 'edit'
  const [viewMode, setViewMode] = useState('list');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationData, setPaginationData] = useState({});

  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBranches();
  }, [token, currentPage, itemsPerPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/products` : `${import.meta.env.VITE_API_URL}/api/subadmin/products`;
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          per_page: itemsPerPage
        }
      });

      if (response.data.success) {
        const apiProducts = response.data.data.data;
        const mappedProducts = apiProducts.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          short_description: product.short_description,
          price: product.price,
          cost_price: product.cost_price,
          sale_price: product.sale_price,
          stock_quantity: product.stock_quantity,
          min_stock_level: product.min_stock_level,
          sku: product.sku,
          barcode: product.barcode,
          weight: product.weight,
          dimensions: product.dimensions,
          color: product.color ,
          size: product.size,
          brand: product.brand,
          model: product.model,
          warranty_period: product.warranty_period,
          is_featured: product.is_featured,
          is_digital: product.is_digital,
          requires_shipping: product.requires_shipping,
          tax_rate: product.tax_rate,
          image: product.image,
          images: product.images,
          tags: product.tags,
          meta_title: product.meta_title,
          meta_description: product.meta_description,
          meta_keywords: product.meta_keywords,
          category_id: product.category_id,
          branch_id: product.branch_id,
          is_active: product.is_active,
          created_at: product.created_at,
          updated_at: product.updated_at,
          category: product.category,
          branch: product.branch,
          status: product.is_active ? 'active' : 'inactive'
        }));
        setProducts(mappedProducts);
        setPaginationData({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          total: response.data.data.total,
          from: response.data.data.from,
          to: response.data.data.to
        });
      } else {
        setError(response.data.success || 'Failed to fetch products');
        toast.error(response.data.success || 'Failed to fetch products');
      }
    } catch (err) {
      // const errorMessage = err.response?.data?.message === 'Unauthenticated.'
      //   ? 'Authentication failed. Please log in again.'
      //   : 'Failed to fetch products';
      setError(err.response?.data?.message || 'Failed to fetch products');
      toast.error(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/categories` : `${import.meta.env.VITE_API_URL}/api/subadmin/categories`;
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };
  const fetchBranches = async () => {
    try {
      const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/branches` :
        `${import.meta.env.VITE_API_URL}/api/subadmin/branches`;
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const canEdit = userType === 'admin';

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    const newItemsPerPage = Number(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    // Fetch products directly to ensure pagination works immediately
    fetchProducts();
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedProduct({
      name: '',
      description: '',
      short_description: '',
      price: '',
      cost_price: '',
      sale_price: '',
      stock_quantity: '',
      min_stock_level: '',
      sku: '',
      barcode: '',
      weight: '',
      dimensions: '',
      color: '',
      size: '',
      brand: '',
      model: '',
      warranty_period: '',
      is_featured: false,
      is_digital: false,
      requires_shipping: true,
      tax_rate: '',
      image: null,
      images: [],
      tags: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      category_id: '',
      branch_id: '',
      is_active: true
    });
    setFormErrors({});
    setImagePreview(null);
    setImagesPreviews([]);
    setViewMode('add');
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setViewMode('view');
  };

  const handleEdit = (product) => {
    setModalMode('edit');
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      short_description: product.short_description,
      price: product.price,
      cost_price: product.cost_price,
      sale_price: product.sale_price,
      stock_quantity: product.stock_quantity,
      min_stock_level: product.min_stock_level,
      sku: product.sku,
      barcode: product.barcode,
      weight: product.weight,
      dimensions: product.dimensions,
      color: product.color || (Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : null),
      size: product.size,
      brand: product.brand,
      model: product.model,
      warranty_period: product.warranty_period,
      is_featured: product.is_featured,
      is_digital: product.is_digital,
      requires_shipping: product.requires_shipping,
      tax_rate: product.tax_rate,
      image: product.image,
      images: product.images || [],
      tags: product.tags || [],
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      meta_keywords: product.meta_keywords,
      category_id: product.category_id,
      branch_id: product.branch_id,
      is_active: product.is_active
    });
    setFormErrors({});
    setImagePreview(product.image ? `${import.meta.env.VITE_API_URL}${product.image}` : null);

    // Set existing images previews
    if (product.images && product.images.length > 0) {
      const existingPreviews = product.images.map(img => `${import.meta.env.VITE_API_URL}${img}`);
      setImagesPreviews(existingPreviews);
    } else {
      setImagesPreviews([]);
    }

    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProduct(null);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(productToDelete.id);
      const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/products/${productToDelete.id}` : `${import.meta.env.VITE_API_URL}/api/subadmin/products/${productToDelete.id}`;
      const response = await axios.delete(
        URL,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Product deleted successfully');
        setProducts(products.filter(p => p.id !== productToDelete.id));
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setFormErrors({});

      // Validate required fields for new products
      if (modalMode === 'add' && !selectedProduct.image) {
        setFormErrors({ image: ['Please select a primary image for the product.'] });
        toast.error('Please select a primary image for the product.');
        setSaveLoading(false);
        return;
      }

      const formData = new FormData();

      // Append all required fields
      const appendIfNotEmpty = (formData, key, value) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      };

      appendIfNotEmpty(formData, 'name', selectedProduct.name);
      appendIfNotEmpty(formData, 'description', selectedProduct.description);
      appendIfNotEmpty(formData, 'short_description', selectedProduct.short_description);
      appendIfNotEmpty(formData, 'price', selectedProduct.price);
      appendIfNotEmpty(formData, 'cost_price', selectedProduct.cost_price);
      appendIfNotEmpty(formData, 'sale_price', selectedProduct.sale_price);
      appendIfNotEmpty(formData, 'stock_quantity', selectedProduct.stock_quantity);
      appendIfNotEmpty(formData, 'min_stock_level', selectedProduct.min_stock_level);
      appendIfNotEmpty(formData, 'sku', selectedProduct.sku);
      appendIfNotEmpty(formData, 'barcode', selectedProduct.barcode);
      appendIfNotEmpty(formData, 'weight', selectedProduct.weight);
      appendIfNotEmpty(formData, 'dimensions', selectedProduct.dimensions);
      if (selectedProduct.color) {
        formData.append('color', selectedProduct.color);
      }
      appendIfNotEmpty(formData, 'size', selectedProduct.size);
      appendIfNotEmpty(formData, 'brand', selectedProduct.brand);
      appendIfNotEmpty(formData, 'model', selectedProduct.model);
      appendIfNotEmpty(formData, 'warranty_period', selectedProduct.warranty_period);
      appendIfNotEmpty(formData, 'is_featured', selectedProduct.is_featured ? '1' : '0');
      appendIfNotEmpty(formData, 'is_digital', selectedProduct.is_digital ? '1' : '0');
      appendIfNotEmpty(formData, 'requires_shipping', selectedProduct.requires_shipping ? '1' : '0');
      appendIfNotEmpty(formData, 'tax_rate', selectedProduct.tax_rate);
      appendIfNotEmpty(formData, 'meta_title', selectedProduct.meta_title);
      appendIfNotEmpty(formData, 'meta_description', selectedProduct.meta_description);
      appendIfNotEmpty(formData, 'meta_keywords', selectedProduct.meta_keywords);
      appendIfNotEmpty(formData, 'category_id', selectedProduct.category_id);
      appendIfNotEmpty(formData, 'branch_id', selectedProduct.branch_id);
      appendIfNotEmpty(formData, 'is_active', selectedProduct.is_active ? '1' : '0');

      // Append tags as array
      if (selectedProduct.tags && selectedProduct.tags.length > 0) {
        selectedProduct.tags.forEach(tag => {
          formData.append('tags[]', tag);
        });
      }

      // Append primary image if it's a file (new upload)
      if (selectedProduct.image instanceof File) {
        formData.append('image', selectedProduct.image);
      }

      // Append additional images - only new file uploads
      if (selectedProduct.images && selectedProduct.images.length > 0) {
        selectedProduct.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images[]', image);
          }
        });
      }

      let response;

      if (modalMode === 'add') {
        // Create product
        const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/products` : `${import.meta.env.VITE_API_URL}/api/subadmin/products`;
        response = await axios.post(
          URL,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          toast.success('Product created successfully');
          setViewMode('list');
          fetchProducts();
        }
      } else {
        // Update product
        const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/products/${selectedProduct.id}?_method=POST` : `${import.meta.env.VITE_API_URL}/api/subadmin/products/${selectedProduct.id}?_method=POST`;
        response = await axios.post(URL,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          toast.success('Product updated successfully');
          setViewMode('list');
          fetchProducts();
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
      setSelectedProduct({ ...selectedProduct, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = [...(selectedProduct.images || []), ...files];
      setSelectedProduct({ ...selectedProduct, images: newImages });

      // Create previews for new images
      const newPreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target.result);
          if (newPreviews.length === files.length) {
            setImagesPreviews([...imagesPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = () => {
    setSelectedProduct({ ...selectedProduct, image: null });
    setImagePreview(null);
  };

  const handleRemoveAdditionalImage = (index) => {
    const newImages = [...selectedProduct.images];
    const newPreviews = [...imagesPreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setSelectedProduct({ ...selectedProduct, images: newImages });
    setImagesPreviews(newPreviews);
  };

  const handleTagChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setSelectedProduct({ ...selectedProduct, tags });
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const formData = new FormData();
      const appendIfNotEmpty = (formData, key, value) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      };

      appendIfNotEmpty(formData, 'name', product.name);
      appendIfNotEmpty(formData, 'description', product.description);
      appendIfNotEmpty(formData, 'short_description', product.short_description);
      appendIfNotEmpty(formData, 'price', product.price);
      appendIfNotEmpty(formData, 'stock_quantity', product.stock_quantity);
      appendIfNotEmpty(formData, 'sku', product.sku);
      appendIfNotEmpty(formData, 'is_featured', product.is_featured ? '1' : '0');
      appendIfNotEmpty(formData, 'is_digital', product.is_digital ? '1' : '0');
      appendIfNotEmpty(formData, 'requires_shipping', product.requires_shipping ? '1' : '0');
      appendIfNotEmpty(formData, 'category_id', product.category_id);
      appendIfNotEmpty(formData, 'branch_id', product.branch_id);
      appendIfNotEmpty(formData, 'is_active', newStatus === 'active' ? '1' : '0');

      // Always append _method since it's required for the PUT request
      formData.append('_method', 'POST');
      const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/products/${productId}` : `${import.meta.env.VITE_API_URL}/api/subadmin/products/${productId}`;
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/products/${productId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Product status updated successfully');
        setProducts(products.map(p =>
          p.id === productId ? { ...p, is_active: newStatus === 'active', status: newStatus } : p
        ));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update product status';
      toast.error(errorMessage);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render based on view mode
  if (viewMode === 'view' && selectedProduct) {
    return (
      <div className="admin-products">
        <ToastContainer />
        <ProductView 
          product={selectedProduct} 
          onBack={handleBackToList}
          onEdit={canEdit ? handleEdit : null}
          canEdit={canEdit}
        />
      </div>
    );
  }

  if ((viewMode === 'add' || viewMode === 'edit') && selectedProduct) {
    return (
      <div className="admin-products">
        <ToastContainer />
        <ProductForm
          mode={modalMode}
          product={selectedProduct}
          color={selectedProduct.color || ''}
          onChange={setSelectedProduct}
          onColorChange={(color) => setSelectedProduct(prev => ({ ...prev, color }))}
          onImageChange={handleImageChange}
          onImagesChange={handleImagesChange}
          onRemoveImage={handleRemoveImage}
          onRemoveAdditionalImage={handleRemoveAdditionalImage}
          onTagChange={handleTagChange}
          imagePreview={imagePreview}
          imagesPreviews={imagesPreviews}
          errors={formErrors}
          loading={saveLoading}
          categories={categories}
          branches={branches}
          onSave={handleSave}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  // List view
  if (loading) {
    return (
      <div className="admin-products">
        <ToastContainer />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
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
          <button className="btn-retry" onClick={fetchProducts}>
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
          <h1>Products Management</h1>
          <p>Manage store products and inventory</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={handleAdd}>
            + Add Product
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">📦</div>
          <div className="stat-info ">
            {/* <div className="stat-valu"></div> */}
            <div className="stat-label">Total Products ({paginationData.total || 0})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            {/* <div className="stat-valu"></div> */}
            <div className="stat-label">Active ({products.filter(p => p.status === 'active').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            {/* <div className="stat-valu"></div> */}
            <div className="stat-label">Featured ({products.filter(p => p.is_featured).length})</div>
          </div>
        </div>
        <div className="stat-card d-flex align-items-center gap-3">
          <div className="stat-icon">📱</div>
          <div className="stat-info">
            {/* <div className="stat-valu"></div> */}
            <div className="stat-label">Digital ({products.filter(p => p.is_digital).length})</div>
          </div>
        </div>
      </div>

      <div className="filters-section justify-content-between">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products by name, SKU, or description..."
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
              <th>Product Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.image ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${product.image}`}
                        alt={product.name}
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
                  <td>
                    <div>
                      <strong>{product.name}</strong>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        {product.short_description}
                      </div>
                    </div>
                  </td>
                  <td>
                    <code>{product.sku}</code>
                  </td>
                  <td>
                    <strong>₦{parseFloat(product.price).toLocaleString()}</strong>
                  </td>
                  <td>
                    <span className={`stock-badge ${product.stock_quantity > 10 ? 'good' : product.stock_quantity > 0 ? 'low' : 'out'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>
                      {product.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>
                      {product.branch?.name || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {canEdit ? (
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusChange(product.id, e.target.value)}
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
                      <span className={`status-badge ${product.status}`}>
                        {product.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-button d-flex justify-content-center align-items-center gap-2">
                      <button
                        className="btn-icon"
                        onClick={() => handleView(product)}
                        title="View"
                      >
                        👁️
                      </button>
                      {canEdit && (
                        <>
                          <button
                            className="btn-icon"
                            onClick={() => handleEdit(product)}
                            title="Edit"
                            disabled={deleteLoading === product.id}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleDeleteClick(product)}
                            title="Delete"
                            disabled={deleteLoading === product.id}
                          >
                            {deleteLoading === product.id ? (
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
                <td colSpan="9" className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">📦</span>
                    <p>No products found</p>
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
      {paginationData.total > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {paginationData.from} to {paginationData.to} of {paginationData.total} entries
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
              {Array.from({ length: Math.min(paginationData.last_page, 5) }, (_, i) => {
                let pageNum;
                if (paginationData.last_page <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= paginationData.last_page - 2) {
                  pageNum = paginationData.last_page - 4 + i;
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

              {paginationData.last_page > 5 && currentPage < paginationData.last_page - 2 && (
                <>
                  <span className="pagination-ellipsis">...</span>
                  <button
                    className="pagination-number"
                    onClick={() => handlePageChange(paginationData.last_page)}
                  >
                    {paginationData.last_page}
                  </button>
                </>
              )}
            </div>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationData.last_page}
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <ProductModal
          mode={modalMode}
          product={selectedProduct}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          onChange={setSelectedProduct}
          onImageChange={handleImageChange}
          onImagesChange={handleImagesChange}
          onRemoveImage={handleRemoveImage}
          onRemoveAdditionalImage={handleRemoveAdditionalImage}
          onTagChange={handleTagChange}
          imagePreview={imagePreview}
          imagesPreviews={imagesPreviews}
          errors={formErrors}
          loading={saveLoading}
          categories={categories}
          branches={branches}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          product={productToDelete}
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
          loading={deleteLoading === productToDelete?.id}
        />
      )}
    </div>
  );
};
// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ product, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Delete Product</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          <div className="delete-confirmation">
            <div className="warning-icon">⚠️</div>
            <h3>Are you sure you want to delete this product?</h3>
            <p>This action cannot be undone. The following product will be permanently deleted:</p>
            <div className="product-details">
              <strong>{product?.name}</strong>
              <p>SKU: {product?.sku}</p>
              <p>Price: ₦{product?.price ? parseFloat(product.price).toLocaleString() : '0'}</p>
              <p>Stock: {product?.stock_quantity}</p>
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
              'Delete Product'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
const ProductModal = ({
  mode, product, onSave, onClose, onChange, onImageChange, onImagesChange,
  onRemoveImage, onRemoveAdditionalImage, onTagChange, imagePreview,
  imagesPreviews, errors, loading, categories, branches
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>

            {/* Basic Information */}
            <div className="form-field full-width">
              <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '20px' }}>Basic Information</h3>
            </div>

            <div className="form-field">
              <label>Product Name *</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => onChange({ ...product, name: e.target.value })}
                placeholder="Enter product name"
                className={errors.name ? 'error' : ''}
                disabled={loading}
              />
              {errors.name && <span className="error-message">{errors.name[0]}</span>}
            </div>

            <div className="form-field">
              <label>SKU *</label>
              <input
                type="text"
                value={product.sku}
                onChange={(e) => onChange({ ...product, sku: e.target.value })}
                placeholder="Enter SKU"
                className={errors.sku ? 'error' : ''}
                disabled={loading}
              />
              {errors.sku && <span className="error-message">{errors.sku[0]}</span>}
            </div>

            <div className="form-field">
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => onChange({ ...product, price: e.target.value })}
                placeholder="0.00"
                className={errors.price ? 'error' : ''}
                disabled={loading}
              />
              {errors.price && <span className="error-message">{errors.price[0]}</span>}
            </div>

            <div className="form-field">
              <label>Stock Quantity *</label>
              <input
                type="number"
                value={product.stock_quantity}
                onChange={(e) => onChange({ ...product, stock_quantity: e.target.value })}
                placeholder="0"
                className={errors.stock_quantity ? 'error' : ''}
                disabled={loading}
              />
              {errors.stock_quantity && <span className="error-message">{errors.stock_quantity[0]}</span>}
            </div>

            <div className="form-field">
              <label>Cost Price</label>
              <input
                type="number"
                step="0.01"
                value={product.cost_price}
                onChange={(e) => onChange({ ...product, cost_price: e.target.value })}
                placeholder="0.00"
                className={errors.cost_price ? 'error' : ''}
                disabled={loading}
              />
              {errors.cost_price && <span className="error-message">{errors.cost_price[0]}</span>}
            </div>

            <div className="form-field">
              <label>Sale Price</label>
              <input
                type="number"
                step="0.01"
                value={product.sale_price}
                onChange={(e) => onChange({ ...product, sale_price: e.target.value })}
                placeholder="0.00"
                className={errors.sale_price ? 'error' : ''}
                disabled={loading}
              />
              {errors.sale_price && <span className="error-message">{errors.sale_price[0]}</span>}
            </div>

            {/* Category and Branch */}
            <div className="form-field">
              <label>Category *</label>
              <select
                value={product.category_id}
                onChange={(e) => onChange({ ...product, category_id: e.target.value })}
                className={errors.category_id ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {errors.category_id && <span className="error-message">{errors.category_id[0]}</span>}
            </div>

            <div className="form-field">
              <label>Branch *</label>
              <select
                value={product.branch_id}
                onChange={(e) => onChange({ ...product, branch_id: e.target.value })}
                className={errors.branch_id ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              {errors.branch_id && <span className="error-message">{errors.branch_id[0]}</span>}
            </div>

            {/* Descriptions */}
            <div className="form-field full-width">
              <label>Short Description</label>
              <textarea
                value={product.short_description}
                onChange={(e) => onChange({ ...product, short_description: e.target.value })}
                placeholder="Brief description"
                rows="2"
                className={errors.short_description ? 'error' : ''}
                disabled={loading}
              />
              {errors.short_description && <span className="error-message">{errors.short_description[0]}</span>}
            </div>

            <div className="form-field full-width">
              <label>Description</label>
              <textarea
                value={product.description}
                onChange={(e) => onChange({ ...product, description: e.target.value })}
                placeholder="Full product description"
                rows="3"
                className={errors.description ? 'error' : ''}
                disabled={loading}
              />
              {errors.description && <span className="error-message">{errors.description[0]}</span>}
            </div>

            {/* Product Details */}
            <div className="form-field full-width">
              <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '20px', marginTop: '20px' }}>Product Details</h3>
            </div>

            <div className="form-field">
              <label>Brand</label>
              <input
                type="text"
                value={product.brand}
                onChange={(e) => onChange({ ...product, brand: e.target.value })}
                placeholder="Brand name"
                className={errors.brand ? 'error' : ''}
                disabled={loading}
              />
              {errors.brand && <span className="error-message">{errors.brand[0]}</span>}
            </div>

            <div className="form-field">
              <label>Model</label>
              <input
                type="text"
                value={product.model}
                onChange={(e) => onChange({ ...product, model: e.target.value })}
                placeholder="Model number"
                className={errors.model ? 'error' : ''}
                disabled={loading}
              />
              {errors.model && <span className="error-message">{errors.model[0]}</span>}
            </div>



            <div className="form-field">
              <label>Size</label>
              <input
                type="text"
                value={product.size}
                onChange={(e) => onChange({ ...product, size: e.target.value })}
                placeholder="Product size"
                className={errors.size ? 'error' : ''}
                disabled={loading}
              />
              {errors.size && <span className="error-message">{errors.size[0]}</span>}
            </div>

            <div className="form-field">
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={product.weight}
                onChange={(e) => onChange({ ...product, weight: e.target.value })}
                placeholder="0.00"
                className={errors.weight ? 'error' : ''}
                disabled={loading}
              />
              {errors.weight && <span className="error-message">{errors.weight[0]}</span>}
            </div>

            <div className="form-field">
              <label>Dimensions</label>
              <input
                type="text"
                value={product.dimensions}
                onChange={(e) => onChange({ ...product, dimensions: e.target.value })}
                placeholder="e.g., 20x20x10"
                className={errors.dimensions ? 'error' : ''}
                disabled={loading}
              />
              {errors.dimensions && <span className="error-message">{errors.dimensions[0]}</span>}
            </div>

            <div className="form-field">
              <label>Barcode</label>
              <input
                type="text"
                value={product.barcode}
                onChange={(e) => onChange({ ...product, barcode: e.target.value })}
                placeholder="Barcode"
                className={errors.barcode ? 'error' : ''}
                disabled={loading}
              />
              {errors.barcode && <span className="error-message">{errors.barcode[0]}</span>}
            </div>

            <div className="form-field">
              <label>Min Stock Level</label>
              <input
                type="number"
                value={product.min_stock_level}
                onChange={(e) => onChange({ ...product, min_stock_level: e.target.value })}
                placeholder="0"
                className={errors.min_stock_level ? 'error' : ''}
                disabled={loading}
              />
              {errors.min_stock_level && <span className="error-message">{errors.min_stock_level[0]}</span>}
            </div>

            <div className="form-field">
              <label>Warranty Period (years)</label>
              <input
                type="number"
                value={product.warranty_period}
                onChange={(e) => onChange({ ...product, warranty_period: e.target.value })}
                placeholder="0"
                className={errors.warranty_period ? 'error' : ''}
                disabled={loading}
              />
              {errors.warranty_period && <span className="error-message">{errors.warranty_period[0]}</span>}
            </div>

            <div className="form-field">
              <label>Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={product.tax_rate}
                onChange={(e) => onChange({ ...product, tax_rate: e.target.value })}
                placeholder="0.00"
                className={errors.tax_rate ? 'error' : ''}
                disabled={loading}
              />
              {errors.tax_rate && <span className="error-message">{errors.tax_rate[0]}</span>}
            </div>

            {/* Flags */}
            <div className="form-field full-width">
              <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '20px', marginTop: '20px' }}>Product Flags</h3>
            </div>

            <div className="form-field">
              <label className="mb-2">Product Flags</label>
              <div className="d-flex flex-column gap-3">
                <div
                  className={`switch-container ${product.is_featured ? 'active' : ''}`}
                  onClick={() => onChange({ ...product, is_featured: !product.is_featured })}
                >
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={product.is_featured}
                      onChange={(e) => onChange({ ...product, is_featured: e.target.checked })}
                      disabled={loading}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="switch-label">Featured Product</span>
                </div>

                <div
                  className={`switch-container ${product.is_digital ? 'active' : ''}`}
                  onClick={() => onChange({ ...product, is_digital: !product.is_digital })}
                >
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={product.is_digital}
                      onChange={(e) => onChange({ ...product, is_digital: e.target.checked })}
                      disabled={loading}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="switch-label">Digital Product</span>
                </div>

                <div
                  className={`switch-container ${product.requires_shipping ? 'active' : ''}`}
                  onClick={() => onChange({ ...product, requires_shipping: !product.requires_shipping })}
                >
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={product.requires_shipping}
                      onChange={(e) => onChange({ ...product, requires_shipping: e.target.checked })}
                      disabled={loading}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="switch-label">Requires Shipping</span>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                value={product.is_active}
                onChange={(e) => onChange({ ...product, is_active: e.target.value === 'true' })}
                disabled={loading}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>

            {/* Images */}
            <div className="form-field full-width">
              <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '20px', marginTop: '20px' }}>Product Images</h3>
            </div>

            {/* Primary Image */}
            <div className="form-field full-width">
              <label>Primary Image {mode === 'add' ? '*' : ''}</label>
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
                    <span>🖼️</span>
                    <p>Click to upload primary image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className={`image-upload-input ${errors.image ? 'error' : ''}`}
                  required={mode === 'add'}
                />
              </div>
              {errors.image && <span className="error-message">{errors.image[0]}</span>}
            </div>

            {/* Additional Images */}
            <div className="form-field full-width">
              <label>Additional Images</label>
              <div className="image-upload-container">
                <div className="image-upload-placeholder">
                  <span>📷</span>
                  <p>Click to upload additional images</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onImagesChange}
                  className="image-upload-input"
                />
              </div>
              {errors.images && <span className="error-message">{errors.images[0]}</span>}

              {/* Additional Images Previews */}
              {imagesPreviews.length > 0 && (
                <div className="additional-images-preview">
                  <h4>Additional Images:</h4>
                  <div className="images-grid">
                    {imagesPreviews.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Additional ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => onRemoveAdditionalImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tags and Meta */}
            <div className="form-field full-width">
              <h3 style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '10px', marginBottom: '20px', marginTop: '20px' }}>SEO & Tags</h3>
            </div>

            <div className="form-field full-width">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={product.tags ? product.tags.join(', ') : ''}
                onChange={onTagChange}
                placeholder="tag1, tag2, tag3"
                className={errors.tags ? 'error' : ''}
                disabled={loading}
              />
              {errors.tags && <span className="error-message">{errors.tags[0]}</span>}
            </div>

            <div className="form-field full-width">
              <label>Meta Title</label>
              <input
                type="text"
                value={product.meta_title}
                onChange={(e) => onChange({ ...product, meta_title: e.target.value })}
                placeholder="Meta title for SEO"
                className={errors.meta_title ? 'error' : ''}
                disabled={loading}
              />
              {errors.meta_title && <span className="error-message">{errors.meta_title[0]}</span>}
            </div>

            <div className="form-field full-width">
              <label>Meta Description</label>
              <textarea
                value={product.meta_description}
                onChange={(e) => onChange({ ...product, meta_description: e.target.value })}
                placeholder="Meta description for SEO"
                rows="2"
                className={errors.meta_description ? 'error' : ''}
                disabled={loading}
              />
              {errors.meta_description && <span className="error-message">{errors.meta_description[0]}</span>}
            </div>

            <div className="form-field full-width">
              <label>Meta Keywords</label>
              <input
                type="text"
                value={product.meta_keywords}
                onChange={(e) => onChange({ ...product, meta_keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                className={errors.meta_keywords ? 'error' : ''}
                disabled={loading}
              />
              {errors.meta_keywords && <span className="error-message">{errors.meta_keywords[0]}</span>}
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
              mode === 'add' ? 'Add Product' : 'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminProducts;