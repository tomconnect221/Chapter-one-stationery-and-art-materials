import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { useDropzone } from 'react-dropzone';
import '../AdminProducts/AdminProducts.css';
import ProductView from './ProductView';
import ProductForm from './ProductForm';
import { hasPermission } from '../../utils/permissions';

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
  
  // Bulk Upload Modal states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [bulkUploadStats, setBulkUploadStats] = useState({ total: 0, success: 0, failed: 0, failedRows: [] });
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  
  // View mode: 'list', 'view', 'add', 'edit'
  const [viewMode, setViewMode] = useState('list');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationData, setPaginationData] = useState({});

  const { token, user } = useSelector((state) => state.auth);

  // Initial load — categories and branches only need fetching once per session
  useEffect(() => {
    fetchProducts(currentPage, itemsPerPage, searchTerm);
    fetchCategories();
    fetchBranches();
  }, [token]);

  const fetchProducts = async (page = currentPage, perPage = itemsPerPage, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/products` : `${import.meta.env.VITE_API_URL}/api/subadmin/products`;
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          per_page: perPage,
          ...(search ? { search } : {})
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
          variants: product.variants || [],
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

  const handlePageChange = (page) => {
    if (page < 1 || page > paginationData.last_page) return;
    setCurrentPage(page);
    fetchProducts(page, itemsPerPage, searchTerm);
  };

  const handleItemsPerPageChange = (value) => {
    const newPerPage = Number(value);
    setItemsPerPage(newPerPage);
    setCurrentPage(1);
    fetchProducts(1, newPerPage, searchTerm);
  };

  // Debounce search across all pages
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, itemsPerPage, searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);
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

  const canCreate = hasPermission(user, 'products.create');
  const canEdit = hasPermission(user, 'products.update');
  const canDelete = hasPermission(user, 'products.delete');




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
      variants: [],
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
      variants: product.variants || [],
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
      const variants = (selectedProduct.variants || []).filter(variant =>
        variant.color || variant.size || variant.dimensions
      );
      const basePrice = variants.length
        ? Math.min(...variants.map(variant => Number(variant.price) || 0))
        : selectedProduct.price;
      const totalStock = variants.length
        ? variants.reduce((total, variant) => total + (Number(variant.stock_quantity) || 0), 0)
        : selectedProduct.stock_quantity;

      // Append all required fields
      const appendIfNotEmpty = (formData, key, value) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      };

      appendIfNotEmpty(formData, 'name', selectedProduct.name);
      appendIfNotEmpty(formData, 'description', selectedProduct.description);
      appendIfNotEmpty(formData, 'short_description', selectedProduct.short_description);
      appendIfNotEmpty(formData, 'price', basePrice);
      appendIfNotEmpty(formData, 'cost_price', selectedProduct.cost_price);
      appendIfNotEmpty(formData, 'sale_price', selectedProduct.sale_price);
      appendIfNotEmpty(formData, 'stock_quantity', totalStock);
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
      formData.append('variants', JSON.stringify(variants));

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

      if (modalMode === 'edit') {
        const existingImages = (selectedProduct.images || []).filter(
          image => typeof image === 'string'
        );
        formData.append('existing_images', JSON.stringify(existingImages));
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
          const validationErrors = { ...responseData.errors };
          const indexedImageError = Object.entries(validationErrors).find(
            ([field, messages]) => /^images\.\d+$/.test(field) && Array.isArray(messages) && messages.length > 0
          )?.[1];
          if (!validationErrors.images && indexedImageError) {
            validationErrors.images = indexedImageError;
          }

          setFormErrors(validationErrors);
          const firstValidationMessage = Object.values(responseData.errors)
            .flatMap(messages => Array.isArray(messages) ? messages : [messages])
            .find(message => typeof message === 'string' && message.trim());
          const errorMessage = firstValidationMessage || responseData.message || 'Validation failed';
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedProduct((prevProduct) => ({
      ...prevProduct,
      images: [...(prevProduct?.images || []), ...files]
    }));

    const fileReaders = files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.readAsDataURL(file);
    }));

    Promise.all(fileReaders)
      .then((newPreviews) => {
        setImagesPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
      })
      .catch(() => {
        toast.error('Unable to preview one or more selected images.');
      });

    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setSelectedProduct({ ...selectedProduct, image: null });
    setImagePreview(null);
  };

  const handleRemoveAdditionalImage = (index) => {
    setSelectedProduct((prevProduct) => ({
      ...prevProduct,
      images: (prevProduct?.images || []).filter((_, imageIndex) => imageIndex !== index)
    }));
    setImagesPreviews((prevPreviews) =>
      prevPreviews.filter((_, imageIndex) => imageIndex !== index)
    );
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

  const handleDownloadTemplate = () => {
    const headers = [
      'name', 'description', 'short_description', 'price', 'cost_price', 
      'sale_price', 'stock_quantity', 'min_stock_level', 'sku', 'barcode', 
      'weight', 'dimensions', 'color', 'size', 'brand', 'model', 
      'warranty_period', 'tax_rate', 'meta_title', 'meta_description', 
      'meta_keywords', 'category_id', 'branch_id', 'is_active', 
      'is_featured', 'is_digital', 'requires_shipping', 'variants', 'image_filename'
    ];
    const ws = XLSX.utils.json_to_sheet([headers.reduce((acc, curr) => ({ ...acc, [curr]: '' }), {})], { header: headers, skipHeader: true });
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Product_Upload_Template.xlsx");
  };

  const handleBulkUploadClick = () => {
    setBulkUploadProgress(0);
    setBulkUploadStats({ total: 0, success: 0, failed: 0, failedRows: [] });
    setIsBulkUploading(false);
    setShowBulkModal(true);
  };

  const processBulkUpload = async (file, imageArchive) => {
    if (!file) return;

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('The Excel file must be smaller than 10 MB.');
      }
      if (imageArchive && imageArchive.size > 100 * 1024 * 1024) {
        throw new Error('The image ZIP must be smaller than 100 MB.');
      }

      const [workbookBuffer, zip] = await Promise.all([
        file.arrayBuffer(),
        imageArchive ? JSZip.loadAsync(imageArchive) : Promise.resolve(null)
      ]);
      const workbook = XLSX.read(workbookBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new Error('The Excel file does not contain any product rows.');
      }

      const imageEntries = new Map();
      const duplicateImageNames = new Set();
      if (zip) {
        Object.values(zip.files).forEach((entry) => {
          if (entry.dir || !/\.(jpe?g|png|webp)$/i.test(entry.name)) return;
          const filename = entry.name.split(/[\\/]/).pop().toLowerCase();
          if (imageEntries.has(filename)) {
            duplicateImageNames.add(filename);
          } else {
            imageEntries.set(filename, entry);
          }
        });
      }

      setIsBulkUploading(true);
      setBulkUploadStats({ total: data.length, success: 0, failed: 0, failedRows: [] });

      let successCount = 0;
      let failCount = 0;
      const failedRowsArr = [];
      const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const imageMimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp'
      };

      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        try {
          const formData = new FormData();
          Object.entries(item).forEach(([key, value]) => {
            if (key !== 'image_filename' && value !== undefined && value !== null && String(value).trim() !== '') {
              formData.append(key, String(value));
            }
          });

          const requestedImage = String(item.image_filename || '').trim();
          if (requestedImage && !zip) {
            throw new Error('Select an image ZIP to use the image_filename column.');
          }

          let matchingNames = [];
          if (requestedImage) {
            matchingNames = [requestedImage.split(/[\\/]/).pop().toLowerCase()];
          } else if (item.sku !== undefined && item.sku !== null && String(item.sku).trim()) {
            const sku = String(item.sku).trim();
            matchingNames = imageExtensions.map(extension => `${sku}.${extension}`.toLowerCase());
          }

          const matches = matchingNames
            .filter(name => imageEntries.has(name))
            .map(name => ({ name, entry: imageEntries.get(name) }));
          const uniqueMatches = [...new Map(matches.map(match => [match.entry.name, match])).values()];

          if (uniqueMatches.some(match => duplicateImageNames.has(match.name))) {
            throw new Error(`More than one image named "${requestedImage || uniqueMatches[0].name}" exists in the ZIP.`);
          }
          if (requestedImage && uniqueMatches.length === 0) {
            throw new Error(`Image "${requestedImage}" was not found in the ZIP.`);
          }
          if (uniqueMatches.length > 1) {
            throw new Error(`More than one image matches SKU "${item.sku}". Set image_filename to choose one.`);
          }

          if (uniqueMatches.length === 1) {
            const { entry } = uniqueMatches[0];
            const imageBlob = await entry.async('blob');
            if (imageBlob.size > 2 * 1024 * 1024) {
              throw new Error(`Image "${entry.name}" exceeds the 2 MB limit.`);
            }
            const filename = entry.name.split(/[\\/]/).pop();
            const extension = filename.split('.').pop().toLowerCase();
            const imageFile = new File([imageBlob], filename, { type: imageMimeTypes[extension] });
            formData.append('image', imageFile);
          }

          const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/products` : `${import.meta.env.VITE_API_URL}/api/subadmin/products`;
          await axios.post(URL, formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          successCount++;
        } catch (err) {
          failCount++;
          const responseData = err.response?.data;
          const validationErrors = responseData?.errors;
          const validationMessage = validationErrors && typeof validationErrors === 'object'
            ? Object.entries(validationErrors)
              .flatMap(([field, messages]) => (Array.isArray(messages) ? messages : [messages])
                .filter(Boolean)
                .map(message => `${field}: ${message}`))
              .join('; ')
            : '';
          failedRowsArr.push({
            index: i + 1,
            name: item.name || 'Unknown',
            reason: validationMessage || responseData?.message || err.message || 'Failed to upload'
          });
        }

        setBulkUploadProgress(((i + 1) / data.length) * 100);
        setBulkUploadStats({
          total: data.length,
          success: successCount,
          failed: failCount,
          failedRows: [...failedRowsArr]
        });
      }

      toast.success(`Bulk upload completed! ${successCount} added, ${failCount} failed.`);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to parse Excel or image ZIP file');
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleDownloadAllProducts = async () => {
    try {
      toast.info('Fetching all products for download...');
      const URL = user.role === 'admin' ? `${import.meta.env.VITE_API_URL}/api/admin/products` : `${import.meta.env.VITE_API_URL}/api/subadmin/products`;
      const response = await axios.get(URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 10000 } // Get a large number of products to cover everything
      });

      if (response.data.success) {
        const allProducts = response.data.data.data;
        
        const dataForExcel = allProducts.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          short_description: p.short_description,
          price: p.price,
          cost_price: p.cost_price,
          sale_price: p.sale_price,
          stock_quantity: p.stock_quantity,
          min_stock_level: p.min_stock_level,
          sku: p.sku,
          barcode: p.barcode,
          weight: p.weight,
          dimensions: p.dimensions,
          color: p.color,
          size: p.size,
          brand: p.brand,
          model: p.model,
          warranty_period: p.warranty_period,
          tax_rate: p.tax_rate,
          meta_title: p.meta_title,
          meta_description: p.meta_description,
          meta_keywords: p.meta_keywords,
          category_id: p.category_id,
          branch_id: p.branch_id,
          is_active: p.is_active ? 1 : 0,
          is_featured: p.is_featured ? 1 : 0,
          is_digital: p.is_digital ? 1 : 0,
          requires_shipping: p.requires_shipping ? 1 : 0,
          variants: JSON.stringify(p.variants || [])
        }));

        const ws = XLSX.utils.json_to_sheet(dataForExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, "All_Products.xlsx");
        toast.success('Download completed');
      }
    } catch (err) {
      toast.error('Failed to download products');
    }
  };

  // Filtering is now handled server-side via the search param in fetchProducts
  const filteredProducts = products;

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
        {canCreate && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-success btn" onClick={handleDownloadTemplate} style={{ padding: '8px 12px', }}>
              📥 Template
            </button>
            <button className="btn-primary" onClick={handleBulkUploadClick} style={{ padding: '8px 12px', }}>
              📤 Bulk Upload
            </button>
            <button className="btn-primary" onClick={handleDownloadAllProducts} style={{ padding: '8px 12px', }}>
              📊 Export All
            </button>
            <button className="btn-primary" onClick={handleAdd}>
              + Add Product
            </button>
          </div>
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
              {[5, 10, 20, 50].map(n => (
                <option key={n} value={n}>
                  {n} {paginationData.total > 0 ? `of ${paginationData.total}` : ''}
                </option>
              ))}
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
                        {product.variants?.length > 0
                          ? `${product.variants.length} purchasable options${product.short_description ? ` · ${product.short_description}` : ''}`
                          : product.short_description}
                      </div>
                    </div>
                  </td>
                  <td>
                    <code>{product.sku}</code>
                  </td>
                  <td>
                    <strong>{product.variants?.length > 0 ? 'From ' : ''}₦{parseFloat(product.price).toLocaleString()}</strong>
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
                          <button
                            className="btn-icon"
                            onClick={() => handleEdit(product)}
                            title="Edit"
                            disabled={deleteLoading === product.id}
                          >
                            ✏️
                          </button>
                          )}
                          {canDelete && (
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

      {/* Bulk Upload Modal */}
      <BulkUploadModal 
        show={showBulkModal} 
        onClose={() => setShowBulkModal(false)} 
        onUpload={processBulkUpload}
        progress={bulkUploadProgress}
        stats={bulkUploadStats}
        isUploading={isBulkUploading}
        categories={categories}
        branches={branches}
      />
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
              <small className="field-hint">Each additional image must be 2 MB or smaller.</small>
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

const BulkUploadModal = ({ show, onClose, onUpload, progress, stats, isUploading, categories, branches }) => {
  const [workbookFile, setWorkbookFile] = useState(null);
  const [imageArchive, setImageArchive] = useState(null);

  useEffect(() => {
    if (!show) {
      setWorkbookFile(null);
      setImageArchive(null);
    }
  }, [show]);

  const workbookDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      if (!isUploading && acceptedFiles.length > 0) setWorkbookFile(acceptedFiles[0]);
    },
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    disabled: isUploading,
    multiple: false
  });
  const imageDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      if (!isUploading && acceptedFiles.length > 0) setImageArchive(acceptedFiles[0]);
    },
    accept: { 'application/zip': ['.zip'] },
    disabled: isUploading,
    multiple: false
  });

  if (!show) return null;

  return (
    <div className="modal-overlay jumia-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px', padding: '20px' }}>
        <div className="modal-header">
          <h2>Bulk Upload Products</h2>
          {!isUploading && <button className="modal-close" onClick={onClose}>×</button>}
        </div>
        
        <div className="modal-body">
          {!isUploading && stats.total === 0 && (
            <>
              {/* ID References Section */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                {/* Categories */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '10px', fontSize: '14px', color: '#555' }}>Category IDs Reference</h4>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', backgroundColor: '#fdfdfd' }}>
                    {categories && categories.length > 0 ? categories.map(cat => (
                      <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '13px' }}>{cat.name}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(cat.id);
                            toast.success(`Copied Category ID: ${cat.id}`);
                          }}
                          style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          title="Copy ID"
                        >
                          Copy: {cat.id}
                        </button>
                      </div>
                    )) : <div style={{ fontSize: '13px', color: '#888' }}>No categories found</div>}
                  </div>
                </div>

                {/* Branches */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: '10px', fontSize: '14px', color: '#555' }}>Branch IDs Reference</h4>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', backgroundColor: '#fdfdfd' }}>
                    {branches && branches.length > 0 ? branches.map(branch => (
                      <div key={branch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '13px' }}>{branch.name}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(branch.id);
                            toast.success(`Copied Branch ID: ${branch.id}`);
                          }}
                          style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          title="Copy ID"
                        >
                          Copy: {branch.id}
                        </button>
                      </div>
                    )) : <div style={{ fontSize: '13px', color: '#888' }}>No branches found</div>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div
                  {...workbookDropzone.getRootProps()}
                  style={{
                border: `2px dashed ${workbookDropzone.isDragActive ? '#4caf50' : '#cccccc'}`,
                padding: '40px',
                textAlign: 'center',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: workbookDropzone.isDragActive ? '#f1f8e9' : '#fafafa',
                transition: 'all 0.3s ease'
              }}
                >
                  <input {...workbookDropzone.getInputProps()} />
                  <div style={{ fontSize: '30px', marginBottom: '10px' }}>📊</div>
                  <strong>Product spreadsheet</strong>
                  <p>{workbookFile?.name || (workbookDropzone.isDragActive ? 'Drop the spreadsheet here' : 'Choose or drop an .xlsx or .xls file')}</p>
                  <div style={{ fontSize: '12px', color: '#888' }}>Required, maximum 10 MB</div>
                </div>
                <div
                  {...imageDropzone.getRootProps()}
                  style={{
                    border: `2px dashed ${imageDropzone.isDragActive ? '#4caf50' : '#cccccc'}`,
                    padding: '40px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: imageDropzone.isDragActive ? '#f1f8e9' : '#fafafa',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <input {...imageDropzone.getInputProps()} />
                  <div style={{ fontSize: '30px', marginBottom: '10px' }}>🖼️</div>
                  <strong>Product images (optional)</strong>
                  <p>{imageArchive?.name || (imageDropzone.isDragActive ? 'Drop the ZIP here' : 'Choose or drop a .zip image archive')}</p>
                  <div style={{ fontSize: '12px', color: '#888' }}>Match by image_filename, or by SKU filename; ZIP up to 100 MB</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                Add an optional image_filename column (for example, ART-104.jpg). If it is blank, images named SKU.jpg, SKU.png, SKU.jpeg, or SKU.webp are matched automatically. Each image must be 2 MB or smaller.
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                For multiple options, put a JSON array in the variants cell. Each entry supports color, size, dimensions, sku, price, and stock_quantity.
                Example: <code>{'[{"color":"Sky blue","size":"A4","dimensions":"20 x 30 cm","price":12.5,"stock_quantity":8}]'}</code>
              </div>
            </>
          )}

          {(isUploading || stats.total > 0) && (
            <div className="upload-progress-container" style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                Upload Progress: {Math.round(progress)}%
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress === 100 ? '#4caf50' : '#f68b1e', transition: 'width 0.3s ease' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{stats.total}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Total Rows</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>{stats.success}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Successful</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>{stats.failed}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Failed</div>
                </div>
              </div>

              {stats.failedRows && stats.failedRows.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: '#f44336', marginBottom: '10px' }}>Failed Rows Detail:</h4>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', backgroundColor: '#fff', fontSize: '13px' }}>
                    {stats.failedRows.map((fail, idx) => (
                      <div key={idx} style={{ marginBottom: '5px', paddingBottom: '5px', borderBottom: '1px solid #eee' }}>
                        <strong>Row {fail.index + 1}:</strong> {fail.name || 'Unknown Item'} - <span style={{ color: '#f44336' }}>{fail.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer" style={{ marginTop: '20px' }}>
          {progress === 100 || (stats.total > 0 && !isUploading) ? (
            <button className="btn-primary" onClick={onClose}>Done</button>
          ) : (
            <>
              <button className="btn-secondary" onClick={onClose} disabled={isUploading}>Cancel</button>
              {!isUploading && stats.total === 0 && (
                <button className="btn-primary" onClick={() => onUpload(workbookFile, imageArchive)} disabled={!workbookFile}>
                  Start Import
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};