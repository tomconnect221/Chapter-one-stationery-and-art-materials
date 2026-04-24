import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ProductSelector from './ProductSelector';

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'color': [] }, { 'background': [] }],
  ['link', 'image', 'video'],
  ['clean']
];

const quillModules = {
  toolbar: toolbarOptions
};

const quillFormats = [
  'bold', 'italic', 'underline', 'strike',
  'header', 'link', 'image', 'video'
];

const AdminAds = ({ token, apiUrl }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [viewingAd, setViewingAd] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    link: '',
    image: '',
    imageFile: null,
    position: 'banner',
    active: true,
    type: 'image',
    priority: 1,
    starts_at: '',
    ends_at: '',
    thumbnail_url: '',
    selectedProducts: [],
    discount_type: 'percent',
    discount_value: ''
  });
  const [adImagePreview, setAdImagePreview] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const baseUrl = apiUrl;
      const url = `${baseUrl}/api/admin/ads`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const adsData = response.data.data.data.map(ad => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          type: ad.type,
          image: ad.media_url_full || `${apiUrl}/storage/${ad.media_url}`,
          position: ad.position,
          status: ad.status,
          priority: ad.priority,
          starts_at: ad.starts_at?.split('T')[0] || '',
          ends_at: ad.ends_at?.split('T')[0] || '',
          link: ad.link || '',
          thumbnail_url: ad.thumbnail_url || '',
          discount_type: ad.discount_type || 'percent',
          discount_value: ad.discount_value || '',
          active: ad.status === 'active',
          products: (ad.products || []).map(product => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            image: product.image
          }))
        }));
        setAds(adsData);
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
      toast.error('Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdDetail = async (adId) => {
    try {
      const baseUrl = apiUrl;
      const url = `${baseUrl}/api/admin/ads/${adId}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to fetch ad details:', error);
      toast.error('Failed to fetch ad details');
    }
  };

  const handleAdDescriptionChange = (value) => {
    setAdForm(prev => ({ ...prev, description: value }));
  };

  const handleAdImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setAdImagePreview(imageData);
        setAdForm(prev => ({ ...prev, image: imageData, imageFile: file }));
      };
      reader.readAsDataURL(file);
    }
    // Clear image error when file is selected
    if (formErrors.image) {
      setFormErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleAdDateChange = (field, value) => {
    setAdForm(prev => ({ ...prev, [field]: value }));

    // Clear date errors when dates are changed
    if (formErrors.starts_at || formErrors.ends_at) {
      setFormErrors(prev => ({
        ...prev,
        starts_at: '',
        ends_at: ''
      }));
    }
  };

  const validateAdForm = () => {
    const errors = {};

    if (!adForm.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!adForm.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!adForm.starts_at) {
      errors.starts_at = 'Start date is required';
    }

    if (!adForm.ends_at) {
      errors.ends_at = 'End date is required';
    }

    if (adForm.starts_at && adForm.ends_at) {
      const startDate = new Date(adForm.starts_at);
      const endDate = new Date(adForm.ends_at);
      const today = new Date();

      if (endDate <= startDate) {
        errors.ends_at = 'End date must be after start date';
      }

      if (endDate <= today) {
        errors.ends_at = 'End date must be in the future';
      }
    }

    if (!adForm.imageFile && !editingAd) {
      errors.image = 'Image is required for new ads';
    }

    if (adForm.priority < 1) {
      errors.priority = 'Priority must be at least 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addAd = async () => {
    if (!validateAdForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', adForm.title);
      formData.append('description', adForm.description);
      formData.append('type', adForm.type);

      if (adForm.imageFile) {
        formData.append('media_file', adForm.imageFile);
      }

      formData.append('position', adForm.position);
      formData.append('priority', adForm.priority.toString());
      formData.append('starts_at', adForm.starts_at);
      formData.append('ends_at', adForm.ends_at);
      formData.append('thumbnail_url', adForm.thumbnail_url);
      formData.append('status', adForm.active ? 'active' : 'inactive');
      
      // Add discount fields
      if (adForm.discount_type) {
        formData.append('discount_type', adForm.discount_type);
      }
      if (adForm.discount_value) {
        formData.append('discount_value', adForm.discount_value);
      }

      // Add product IDs to formData
      adForm.selectedProducts.forEach((product, index) => {
        formData.append(`product_ids[${index}]`, product.id);
      });

      const baseUrl = apiUrl;
      const url = `${baseUrl}/api/admin/ads`;

      const response = await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchAds();
        resetAdForm();
        toast.success('Ad created successfully');
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;
        setFormErrors(serverErrors);

        Object.keys(serverErrors).forEach(field => {
          toast.error(`${field}: ${serverErrors[field][0]}`);
        });
      } else {
        toast.error('Failed to create ad');
        console.error('Add ad error:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  const updateAd = async () => {
    if (!validateAdForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', adForm.title);
      formData.append('description', adForm.description);
      formData.append('type', adForm.type);

      if (adForm.imageFile) {
        formData.append('media_file', adForm.imageFile);
      }

      formData.append('position', adForm.position);
      formData.append('priority', adForm.priority.toString());
      formData.append('starts_at', adForm.starts_at);
      formData.append('ends_at', adForm.ends_at);
      formData.append('thumbnail_url', adForm.thumbnail_url);
      formData.append('status', adForm.active ? 'active' : 'inactive');
      
      // Add discount fields
      if (adForm.discount_type) {
        formData.append('discount_type', adForm.discount_type);
      }
      if (adForm.discount_value) {
        formData.append('discount_value', adForm.discount_value);
      }

      // Add product IDs to formData
      adForm.selectedProducts.forEach((product, index) => {
        formData.append(`product_ids[${index}]`, product.id);
      });

      formData.append('_method', 'POST');

      const baseUrl = apiUrl;
      const url = `${baseUrl}/api/admin/ads/${editingAd.id}`;

      const response = await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchAds();
        resetAdForm();
        toast.success('Ad updated successfully');
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;
        setFormErrors(serverErrors);

        Object.keys(serverErrors).forEach(field => {
          toast.error(`${field}: ${serverErrors[field][0]}`);
        });
      } else {
        toast.error('Failed to update ad');
        console.error('Update ad error:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteAd = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        setSaving(true);
        const baseUrl = apiUrl;
        const url = `${baseUrl}/api/admin/ads/${id}`;

        const response = await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          await fetchAds();
          toast.success('Ad deleted successfully');
        }
      } catch (error) {
        toast.error('Failed to delete ad');
        console.error('Delete ad error:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const editAd = async (ad) => {
    // Fetch individual ad details to get all fields including discount info
    const adDetail = await fetchAdDetail(ad.id);
    
    if (adDetail) {
      setEditingAd(adDetail);
      setAdForm({
        title: adDetail.title || '',
        description: adDetail.description || '',
        link: adDetail.link || '',
        image: adDetail.media_url_full || adDetail.media_url || adDetail.image || '',
        imageFile: null,
        position: adDetail.position || 'banner',
        active: adDetail.status === 'active',
        type: adDetail.type || 'image',
        priority: adDetail.priority || 1,
        starts_at: adDetail.starts_at?.split('T')[0] || '',
        ends_at: adDetail.ends_at?.split('T')[0] || '',
        thumbnail_url: adDetail.thumbnail_url || '',
        discount_type: adDetail.discount_type || 'percent',
        discount_value: adDetail.discount_value || '',
        selectedProducts: (adDetail.products || []).map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          image: product.image
        }))
      });
      setAdImagePreview(adDetail.media_url_full || adDetail.media_url || adDetail.image || '');
      setShowAdForm(true);
      setFormErrors({});
    }
  };

  const resetAdForm = () => {
    setAdForm({
      title: '',
      description: '',
      link: '',
      image: '',
      imageFile: null,
      position: 'banner',
      active: true,
      type: 'image',
      priority: 1,
      starts_at: '',
      ends_at: '',
      thumbnail_url: '',
      selectedProducts: [],
      discount_type: 'percent',
      discount_value: ''
    });
    setAdImagePreview('');
    setShowAdForm(false);
    setEditingAd(null);
    setFormErrors({});
  };

  const handleAdFormSubmit = async (e) => {
    e.preventDefault();
    if (editingAd) {
      await updateAd();
    } else {
      await addAd();
    }
  };

  const viewAdDetails = async (ad) => {
    // Fetch individual ad details
    const adDetail = await fetchAdDetail(ad.id);
    if (adDetail) {
      setViewingAd(adDetail);
      setShowViewModal(true);
    }
  };

  const renderAdDetailModal = () => {
    if (!viewingAd || !showViewModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: 0 }}>
              Advertisement Details
            </h2>
            <button
              onClick={() => setShowViewModal(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#6c757d',
                padding: 0,
                width: '32px',
                height: '32px'
              }}
            >
              ×
            </button>
          </div>

          {/* Image */}
          {viewingAd.media_url_full && (
            <div style={{ marginBottom: '24px' }}>
              <img
                src={viewingAd.media_url_full}
                alt={viewingAd.title}
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
              />
            </div>
          )}

          {/* Title and Status */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#212529', margin: '0 0 12px 0' }}>
              {viewingAd.title}
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: viewingAd.status === 'active' ? '#d4edda' : '#f8d7da',
                color: viewingAd.status === 'active' ? '#155724' : '#721c24'
              }}>
                {viewingAd.status === 'active' ? '● Active' : '● Inactive'}
              </span>
              <span style={{ fontSize: '13px', color: '#6c757d' }}>
                Type: <strong>{viewingAd.type}</strong>
              </span>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#6c757d', textTransform: 'uppercase' }}>Description</label>
            <div style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.6'
            }}>
              <div dangerouslySetInnerHTML={{ __html: viewingAd.description }} />
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Left Column */}
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6c757d', textTransform: 'uppercase' }}>Position</label>
                <p style={{ fontSize: '14px', color: '#374151', margin: '8px 0 0 0', fontWeight: '500', textTransform: 'capitalize' }}>
                  {viewingAd.position}
                </p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6c757d', textTransform: 'uppercase' }}>Priority</label>
                <p style={{ fontSize: '14px', color: '#374151', margin: '8px 0 0 0', fontWeight: '500' }}>
                  {viewingAd.priority}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6c757d', textTransform: 'uppercase' }}>Start Date</label>
                <p style={{ fontSize: '14px', color: '#374151', margin: '8px 0 0 0', fontWeight: '500' }}>
                  {viewingAd.starts_at?.split('T')[0] || 'N/A'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6c757d', textTransform: 'uppercase' }}>End Date</label>
                <p style={{ fontSize: '14px', color: '#374151', margin: '8px 0 0 0', fontWeight: '500' }}>
                  {viewingAd.ends_at?.split('T')[0] || 'N/A'}
                </p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6c757d', textTransform: 'uppercase' }}>Clicks</label>
                <p style={{ fontSize: '14px', color: '#374151', margin: '8px 0 0 0', fontWeight: '500' }}>
                  {viewingAd.clicks || 0}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6c757d', textTransform: 'uppercase' }}>Impressions</label>
                <p style={{ fontSize: '14px', color: '#374151', margin: '8px 0 0 0', fontWeight: '500' }}>
                  {viewingAd.impressions || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Discount Information */}
          {(viewingAd.discount_type || viewingAd.discount_value) && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
              border: '2px solid #007bff'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#007bff', margin: '0 0 12px 0', textTransform: 'uppercase' }}>💰 Discount Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6c757d' }}>Discount Type</label>
                  <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0', fontWeight: '500', textTransform: 'capitalize' }}>
                    {viewingAd.discount_type || 'N/A'}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6c757d' }}>Discount Value</label>
                  <p style={{ fontSize: '14px', color: '#374151', margin: '4px 0 0 0', fontWeight: '500' }}>
                    {viewingAd.discount_value || 'N/A'} {viewingAd.discount_type === 'percent' ? '%' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {viewingAd.products && viewingAd.products.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0', textTransform: 'uppercase' }}>📦 Linked Products ({viewingAd.products.length})</h4>
              <div style={{
                display: 'grid',
                gap: '12px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {viewingAd.products.map(product => (
                  <div key={product.id} style={{
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr',
                    gap: '12px',
                    alignItems: 'start'
                  }}>
                    {console.log(apiUrl+'/'+product.image)}
                    {product.image && (
                      <img
                        src={apiUrl+'/'+product.image}
                        alt={product.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#212529', margin: '0 0 4px 0' }}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6c757d', margin: '0 0 4px 0' }}>
                        SKU: {product.sku}
                      </p>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#007bff', margin: 0 }}>
                        ₦ {product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '16px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <button
              onClick={() => setShowViewModal(false)}
              style={{
                padding: '10px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: '#fff',
                color: '#6c757d',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowViewModal(false);
                editAd(viewingAd);
              }}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#007bff',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Edit Advertisement
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAdForm = () => (
    <div style={{ marginBottom: '32px', padding: '24px', border: '2px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f8f9fa' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>
        {editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}
      </h3>
      <form onSubmit={handleAdFormSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Title *</label>
              <input
                type="text"
                value={adForm.title}
                onChange={(e) => setAdForm(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: formErrors.title ? '2px solid #dc3545' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              {formErrors.title && (
                <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>{formErrors.title}</p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Position</label>
              <select
                value={adForm.position}
                onChange={(e) => setAdForm(prev => ({ ...prev, position: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="banner">Top Banner</option>
                {/* <option value="sidebar">Sidebar</option> */}
                <option value="in_content">In content</option>
                {/* <option value="popup">Popup</option> */}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {/* <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Priority *</label>
              <input
                type="number"
                min="1"
                value={adForm.priority}
                onChange={(e) => setAdForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: formErrors.priority ? '2px solid #dc3545' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              {formErrors.priority && (
                <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>{formErrors.priority}</p>
              )}
            </div> */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Start Date *</label>
              <input
                type="date"
                value={adForm.starts_at}
                onChange={(e) => handleAdDateChange('starts_at', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: formErrors.starts_at ? '2px solid #dc3545' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              {formErrors.starts_at && (
                <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>{formErrors.starts_at}</p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>End Date *</label>
              <input
                type="date"
                value={adForm.ends_at}
                onChange={(e) => handleAdDateChange('ends_at', e.target.value)}
                min={adForm.starts_at || new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: formErrors.ends_at ? '2px solid #dc3545' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              {formErrors.ends_at && (
                <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>{formErrors.ends_at}</p>
              )}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Description *</label>
            <ReactQuill
              value={adForm.description}
              onChange={handleAdDescriptionChange}
              modules={quillModules}
              formats={quillFormats}
              theme="snow"
              style={{
                border: formErrors.description ? '2px solid #dc3545' : '2px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            />
            {formErrors.description && (
              <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>{formErrors.description}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Upload Image {!editingAd && '*'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAdImageChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: formErrors.image ? '2px solid #dc3545' : '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#fff'
              }}
            />
            {formErrors.image && (
              <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>{formErrors.image}</p>
            )}
            {adImagePreview && (
              <div style={{ marginTop: '12px' }}>
                <img
                  src={adImagePreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb'
                  }}
                />
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Link URL</label>
              <input
                type="url"
                value={adForm.thumbnail_url}
                onChange={(e) => setAdForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                placeholder="Link url"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Discount Type</label>
              <select
                value={adForm.discount_type}
                onChange={(e) => setAdForm(prev => ({ ...prev, discount_type: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Discount Value</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={adForm.discount_value}
                onChange={(e) => setAdForm(prev => ({ ...prev, discount_value: e.target.value }))}
                placeholder={adForm.discount_type === 'percent' ? 'e.g., 15' : 'e.g., 1000'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          <ProductSelector
            token={token}
            selectedProducts={adForm.selectedProducts}
            onProductsChange={(products) => setAdForm(prev => ({ ...prev, selectedProducts: products }))}
            apiUrl={apiUrl}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              id="adActive"
              checked={adForm.active}
              onChange={(e) => setAdForm(prev => ({ ...prev, active: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="adActive" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Active</label>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={resetAdForm}
              style={{
                padding: '12px 24px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#6c757d',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: saving ? '#6c757d' : '#007bff',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving...' : (editingAd ? 'Update' : 'Add')} Advertisement
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderAds = () => (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>Advertisements</h2>
        <p style={{ color: '#6c757d', margin: '0 0 24px 0' }}>Manage promotional ads and campaigns</p>
      </div>

      {showAdForm && renderAdForm()}
      {showViewModal && renderAdDetailModal()}

      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => setShowAdForm(true)}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#28a745',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          ➕ Add New Advertisement
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>Loading ads...</div>
        ) : ads.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {ads.map(ad => (
              <div key={ad.id} style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 150px', gap: '20px', alignItems: 'start' }}>
                  <img
                    src={ad.image}
                    alt={ad.title}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>{ad.title}</h4>
                    <p style={{ fontSize: '13px', color: '#6c757d', margin: '0 0 8px 0', display: 'line-clamp' }}>
                      {ad.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      <div>Position: <strong>{ad.position}</strong> | Priority: <strong>{ad.priority}</strong></div>
                      <div>{ad.starts_at} to {ad.ends_at}</div>
                      {ad.products && ad.products.length > 0 && (
                        <div style={{ marginTop: '8px', color: '#007bff' }}>
                          📦 {ad.products.length} product(s) linked
                        </div>
                      )}
                      <div style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '4px 8px',
                        backgroundColor: ad.active ? '#d4edda' : '#f8d7da',
                        color: ad.active ? '#155724' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {ad.active ? '✓ Active' : '✗ Inactive'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button
                      onClick={() => viewAdDetails(ad)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: '#17a2b8',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => editAd(ad)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAd(ad.id)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            color: '#6c757d'
          }}>
            No advertisements yet. Click "Add New Advertisement" to create one.
          </div>
        )}
      </div>
    </div>
  );

  return renderAds();
};

export default AdminAds;
