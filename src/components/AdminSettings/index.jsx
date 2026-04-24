import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import AdminAds from './AdminAds';

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'color': [] }, { 'background': [] }],
  ['link', 'image', 'video'],
  ['clean']
];

const quillModules = { toolbar: toolbarOptions };
const quillFormats = ['bold', 'italic', 'underline', 'strike', 'header', 'link', 'image', 'video'];

const AdminSettings = ({ userType = 'admin' }) => {
  const [activeTab, setActiveTab] = useState(userType === 'subadmin' ? 'branch' : 'general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSliderForm, setShowSliderForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [sliderForm, setSliderForm] = useState({ title: '', description: '', link: '', image: '', imageFile: null, video: '', type: 'image' });
  const [sliderImagePreview, setSliderImagePreview] = useState('');

  const [logo, setLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const [settings, setSettings] = useState(userType === 'subadmin' ? {
    branch: { branchName: '', branchAddress: '', branchPhone: '', branchEmail: '', branchManager: '', branchStatus: 'active' }
  } : {
    general: {
      storeName: '', storeDescription: '', missionStatement: '', visionStatement: '',
      storeEmail: '', storePhone: '', storeAddress: '', currency: 'USD',
      timezone: 'UTC', language: 'en', maintenanceMode: false, logo: '',
      socialMedia: { facebook: '', instagram: '', twitter: '', tiktok: '', linkedin: '', youtube: '', whatsapp: '' },
      payment: { paystackSecretKey: '', paystackPublicKey: '' },
      email: { mailer: 'smtp', host: 'smtp.mailtrap.io', port: '2525', username: 'your_username', password: 'your_password', encryption: 'tls', fromAddress: 'noreply@chapterone.com', fromName: 'Chapter One Stationery' }
    },
    shipping: {
      freeShipping: { enabled: true, minimumOrder: 50 },
      flatRate: { enabled: true, rate: 10 },
      localPickup: { enabled: true, description: 'Pickup from our store' }
    },
    deliveryFees: {
      weightBased: { enabled: false, minimumWeight: 1, fee: 0 },
      distanceBased: { enabled: false, minimumDistance: 1, fee: 0 }
    },
    sliders: []
  });

  const { token } = useSelector((state) => state.auth);

  useEffect(() => { fetchSettings(); }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
      if (file.size > 2 * 1024 * 1024) { toast.error('Image size must be less than 2MB'); return; }
      const reader = new FileReader();
      reader.onload = (e) => { setLogoPreview(e.target.result); setLogoFile(file); };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => { setLogoPreview(''); setLogoFile(null); };

  const handleMissionChange = (value) => setSettings(prev => ({ ...prev, general: { ...prev.general, missionStatement: value } }));
  const handleVisionChange = (value) => setSettings(prev => ({ ...prev, general: { ...prev.general, visionStatement: value } }));
  const handleStoreDescriptionChange = (value) => setSettings(prev => ({ ...prev, general: { ...prev.general, storeDescription: value } }));
  const handleSliderDescriptionChange = (value) => setSliderForm(prev => ({ ...prev, description: value }));

  const fetchSettings = async () => {
    try {
      setLoading(true);
      if (userType === 'subadmin') {
        const branchResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/subadmin/branch`, { headers: { Authorization: `Bearer ${token}` } });
        if (branchResponse.data.success) {
          const branchData = branchResponse.data.data;
          setSettings(prevSettings => ({ ...prevSettings, branch: { branchName: branchData.name || '', branchAddress: branchData.address || '', branchPhone: branchData.phone || '', branchEmail: branchData.email || '', latitude: branchData.latitude || '', longitude: branchData.longitude || '', branchStatus: branchData.is_active ? 'active' : 'inactive' } }));
        }
      } else {
        await fetchSliders();
        await fetchGeneralSettings();
      }
    } catch (error) { toast.error('Failed to load settings'); } 
    finally { setLoading(false); }
  };

  const fetchSliders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/sliders`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        const slidersData = response.data.data.map(slider => ({ id: slider.id, title: slider.title, description: slider.description, link: slider.link, image: `${import.meta.env.VITE_API_URL}/storage/${slider.image_path}`, type: slider.type || 'image', status: slider.status || 'active' }));
        setSettings(prev => ({ ...prev, sliders: slidersData }));
      }
    } catch (error) { console.error('Failed to fetch sliders:', error); }
  };

  const fetchGeneralSettings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/settings`, { headers: { Authorization: `Bearer ${token}` } });
      console.log(response);
      if (response.data.success) {
        const apiData = response.data.data;
        const logoUrl = apiData.logo ? apiData.logo : '';
        setLogo(logoUrl);

        // Parse delivery fees from unified key if available, otherwise fallback to individual keys
        let deliveryFeesData = {
          weightBased: { enabled: false, minimumWeight: 1, fee: 0 },
          distanceBased: { enabled: false, minimumDistance: 1, fee: 0 }
        };

        if (apiData.delivery_fees_settings) {
          try {
            deliveryFeesData = JSON.parse(apiData.delivery_fees_settings);
          } catch (e) {
            console.error('Failed to parse delivery_fees_settings, using individual keys', e);
            deliveryFeesData = {
              weightBased: { enabled: apiData.delivery_weight_based_enabled === 'true', minimumWeight: parseFloat(apiData.delivery_min_weight) || 1, fee: parseFloat(apiData.delivery_weight_fee) || 0 },
              distanceBased: { enabled: apiData.delivery_distance_based_enabled === 'true', minimumDistance: parseFloat(apiData.delivery_min_distance) || 1, fee: parseFloat(apiData.delivery_distance_fee) || 0 }
            };
          }
        } else {
          // Fallback to individual keys for backward compatibility
          deliveryFeesData = {
            weightBased: { enabled: apiData.delivery_weight_based_enabled === 'true', minimumWeight: parseFloat(apiData.delivery_min_weight) || 1, fee: parseFloat(apiData.delivery_weight_fee) || 0 },
            distanceBased: { enabled: apiData.delivery_distance_based_enabled === 'true', minimumDistance: parseFloat(apiData.delivery_min_distance) || 1, fee: parseFloat(apiData.delivery_distance_fee) || 0 }
          };
        }

        setSettings(prev => ({
          ...prev, general: {
            ...prev.general, storeName: apiData.site_name || '', storeDescription: apiData.store_description || '', missionStatement: apiData.mission_statement || '', visionStatement: apiData.vision_statement || '',
            storeEmail: apiData.store_email || '', storePhone: apiData.store_phone || '', storeAddress: apiData.store_address || '', currency: apiData.currency || 'USD',
            maintenanceMode: apiData.maintenance_mode === 'true', logo: logoUrl,
            socialMedia: { facebook: apiData.facebook || '', instagram: apiData.instagram || '', twitter: apiData.twitter || '', tiktok: apiData.tiktok || '', linkedin: apiData.linkedin || '', youtube: apiData.youtube || '', whatsapp: apiData.whatsapp || '' },
            payment: { paystackSecretKey: apiData.paystack_secret_key || '', paystackPublicKey: apiData.paystack_public_key || '' },
            email: { mailer: apiData.mail_mailer || 'smtp', host: apiData.mail_host || 'smtp.mailtrap.io', port: apiData.mail_port || '2525', username: apiData.mail_username || 'your_username', password: apiData.mail_password || 'your_password', encryption: apiData.mail_encryption || 'tls', fromAddress: apiData.mail_from_address || 'noreply@chapterone.com', fromName: apiData.mail_from_name || 'Chapter One Stationery' }
          },
          deliveryFees: deliveryFeesData
        }));
      }
    } catch (error) { console.error('Failed to fetch general settings:', error); }
  };

  const uploadLogo = async (logoFile) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/settings/logo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    if (response.data.success) {
      return response.data.data.logo;
    } else {
      throw new Error(response.data.message || 'Logo upload failed');
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error('Please select a logo file first');
      return;
    }
    try {
      setSaving(true);
      const newLogoUrl = await uploadLogo(logoFile);
      setLogo(newLogoUrl);
      setLogoFile(null);
      setLogoPreview('');
      toast.success('Logo uploaded successfully');
      await fetchGeneralSettings(); // Refresh settings to get updated logo
    } catch (error) {
      toast.error('Failed to upload logo');
      console.error('Logo upload error:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveGeneralSettings = async () => {
    try {
      setSaving(true);
      const { general, deliveryFees } = settings;
      const baseUrl = import.meta.env.VITE_API_URL;

      // Upload logo first if present
      if (logoFile) {
        try {
          const newLogoUrl = await uploadLogo(logoFile);
          setLogo(newLogoUrl);
          setLogoFile(null);
          setLogoPreview('');
          // Update settings with new logo URL
          settings.general.logo = newLogoUrl;
        } catch (error) {
          toast.error('Failed to upload logo');
          console.error('Logo upload error:', error);
          return; // Don't proceed to save settings
        }
      }

      // Prepare settings data
      const settingsData = [
        { key: 'site_name', value: general.storeName || '' }, { key: 'store_description', value: general.storeDescription || '' },
        { key: 'mission_statement', value: general.missionStatement || '' }, { key: 'vision_statement', value: general.visionStatement || '' },
        { key: 'store_email', value: general.storeEmail || '' }, { key: 'store_phone', value: general.storePhone || '' },
        { key: 'store_address', value: general.storeAddress || '' }, { key: 'currency', value: general.currency || 'USD' },
        { key: 'maintenance_mode', value: general.maintenanceMode ? general.maintenanceMode.toString() : 'false' },
        { key: 'facebook', value: general.socialMedia?.facebook || '' }, { key: 'instagram', value: general.socialMedia?.instagram || '' },
        { key: 'twitter', value: general.socialMedia?.twitter || '' }, { key: 'tiktok', value: general.socialMedia?.tiktok || '' },
        { key: 'linkedin', value: general.socialMedia?.linkedin || '' }, { key: 'youtube', value: general.socialMedia?.youtube || '' },
        { key: 'whatsapp', value: general.socialMedia?.whatsapp || '' },
        { key: 'paystack_secret_key', value: general.payment?.paystackSecretKey || '' }, { key: 'paystack_public_key', value: general.payment?.paystackPublicKey || '' },
        { key: 'mail_mailer', value: general.email?.mailer || 'smtp' }, { key: 'mail_host', value: general.email?.host || '' },
        { key: 'mail_port', value: general.email?.port || '2525' }, { key: 'mail_username', value: general.email?.username || '' },
        { key: 'mail_password', value: general.email?.password || '' }, { key: 'mail_encryption', value: general.email?.encryption || 'tls' },
        { key: 'mail_from_address', value: general.email?.fromAddress || '' }, { key: 'mail_from_name', value: general.email?.fromName || '' },
        { key: 'delivery_fees_settings', value: JSON.stringify(deliveryFees || {}) },
        // Keep individual keys for backward compatibility
        { key: 'delivery_weight_based_enabled', value: deliveryFees?.weightBased?.enabled ? deliveryFees.weightBased.enabled.toString() : 'false' },
        { key: 'delivery_min_weight', value: deliveryFees?.weightBased?.minimumWeight ? deliveryFees.weightBased.minimumWeight.toString() : '1' },
        { key: 'delivery_weight_fee', value: deliveryFees?.weightBased?.fee ? deliveryFees.weightBased.fee.toString() : '0' },
        { key: 'delivery_distance_based_enabled', value: deliveryFees?.distanceBased?.enabled ? deliveryFees.distanceBased.enabled.toString() : 'false' },
        { key: 'delivery_min_distance', value: deliveryFees?.distanceBased?.minimumDistance ? deliveryFees.distanceBased.minimumDistance.toString() : '1' },
        { key: 'delivery_distance_fee', value: deliveryFees?.distanceBased?.fee ? deliveryFees.distanceBased.fee.toString() : '0' }
      ];

      // Save other settings
      const response = await axios.post(`${baseUrl}/api/admin/settings`, settingsData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.data.success) { toast.success(response.data.message || 'Settings saved successfully'); await fetchGeneralSettings(); }
    } catch (error) { toast.error('Failed to save settings'); console.error('Save settings error:', error); }
    finally { setSaving(false); }
  };

  const addSlider = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', sliderForm.title);
      formData.append('description', sliderForm.description);
      formData.append('link', sliderForm.link);
      formData.append('type', sliderForm.type);
      if (sliderForm.imageFile) formData.append('image_path', sliderForm.imageFile);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/sliders`, formData, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) { toast.success('Slider created successfully'); await fetchSliders(); resetSliderForm(); }
      else toast.error('Failed to create slider');
    } catch (error) { toast.error('Failed to create slider'); }
    finally { setSaving(false); }
  };

  const updateSlider = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', sliderForm.title);
      formData.append('description', sliderForm.description);
      formData.append('link', sliderForm.link);
      formData.append('type', sliderForm.type);
      formData.append('_method', 'PUT');
      if (sliderForm.imageFile) formData.append('image_path', sliderForm.imageFile);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/sliders/${editingSlider.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) { toast.success('Slider updated successfully'); await fetchSliders(); resetSliderForm(); }
      else toast.error('Failed to update slider');
    } catch (error) { toast.error('Failed to update slider'); }
    finally { setSaving(false); }
  };

  const deleteSlider = async (sliderId) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        setSaving(true);
        const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/sliders/${sliderId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.success) { toast.success('Slider deleted successfully'); await fetchSliders(); }
        else toast.error('Failed to delete slider');
      } catch (error) { toast.error('Failed to delete slider'); }
      finally { setSaving(false); }
    }
  };

  const saveSettings = async (section) => {
    if (section === 'general') { await saveGeneralSettings(); return; }
    try {
      setSaving(true);
      if (userType === 'subadmin' && section === 'branch') {
        const branchData = { name: settings.branch.branchName, address: settings.branch.branchAddress, phone: settings.branch.branchPhone, email: settings.branch.branchEmail, latitude: settings.branch.latitude, longitude: settings.branch.longitude, is_active: settings.branch.branchStatus === 'active' };
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/subadmin/branch`, branchData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        if (response.data.data.success) toast.success(response.data.message || 'Branch settings saved successfully');
      }
    } catch (error) { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const updateSetting = (section, field, value) => {
    setSettings(prev => {
      if (typeof field === 'object') return { ...prev, [section]: { ...prev[section], ...field } };
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
  };

  const editSlider = (slider) => { setEditingSlider(slider); setSliderForm({ title: slider.title || '', description: slider.description || '', link: slider.link || '', image: slider.image || '', imageFile: null, video: slider.video || '', type: slider.type || 'image' }); setSliderImagePreview(slider.image || ''); setShowSliderForm(true); };

  const handleSliderImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = (e) => { setSliderImagePreview(e.target.result); setSliderForm(prev => ({ ...prev, image: e.target.result, imageFile: file })); }; reader.readAsDataURL(file); }
  };

  const resetSliderForm = () => { setSliderForm({ title: '', description: '', link: '', image: '', imageFile: null, video: '', type: 'image' }); setSliderImagePreview(''); setShowSliderForm(false); setEditingSlider(null); };
  const handleSliderFormSubmit = async (e) => { e.preventDefault(); if (editingSlider) await updateSlider(); else await addSlider(); };

  const tabs = userType === 'subadmin' ? [{ id: 'branch', label: 'Branch Settings', icon: '🏢' }] : [{ id: 'general', label: 'General', icon: '🏪' },
    //  { id: 'shipping', label: 'Shipping', icon: '🚚' },
      { id: 'delivery', label: 'Delivery Fees', icon: '💰' }, { id: 'sliders', label: 'Homepage Sliders', icon: '🖼️' }, { id: 'ads', label: 'Advertisements', icon: '📢' }];

  if (loading) return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column' }}><div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div><p style={{ marginTop: '16px', color: '#6c757d' }}>Loading settings...</p></div>);

  const renderGeneralTab = () => (
    <div>
      <div style={{ marginBottom: '32px' }}><h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>General Settings</h2><p style={{ color: '#6c757d', margin: '0 0 24px 0' }}>Configure your store's basic information and preferences</p></div>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>Store Logo</h3>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 200px' }}>
              <div style={{ width: '200px', height: '150px', border: '2px dashed #e5e7eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
                {logoPreview || logo ? <img src={logoPreview || logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <div style={{ textAlign: 'center', color: '#9ca3af' }}><div style={{ fontSize: '40px' }}>🖼️</div><div>No logo</div></div>}
              </div>
              {(logoPreview || logo) && <button type="button" onClick={removeLogo} style={{ marginTop: '12px', padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '13px', cursor: 'pointer', width: '100%' }}>Remove Logo</button>}
            </div>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Upload New Logo</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }} />
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={handleLogoUpload} disabled={saving || !logoFile} style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', backgroundColor: (saving || !logoFile) ? '#6c757d' : '#28a745', color: '#fff', cursor: (saving || !logoFile) ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                  {saving ? 'Uploading...' : 'Upload Logo'}
                </button>
                {logoFile && <div style={{ padding: '12px', backgroundColor: '#d1fae5', borderRadius: '8px', color: '#065f46' }}>✓ Logo selected. Click Upload to save.</div>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>Store Information</h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Store Name</label><input type="text" value={settings.general?.storeName || ''} onChange={(e) => updateSetting('general', 'storeName', e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Store Email</label><input type="email" value={settings.general?.storeEmail || ''} onChange={(e) => updateSetting('general', 'storeEmail', e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            </div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Store Description</label><ReactQuill value={settings.general?.storeDescription || ''} onChange={handleStoreDescriptionChange} modules={quillModules} formats={quillFormats} theme="snow" style={{ border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Mission Statement</label><ReactQuill value={settings.general?.missionStatement || ''} onChange={handleMissionChange} modules={quillModules} formats={quillFormats} theme="snow" style={{ border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Vision Statement</label><ReactQuill value={settings.general?.visionStatement || ''} onChange={handleVisionChange} modules={quillModules} formats={quillFormats} theme="snow" style={{ border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Phone Number</label><input type="tel" value={settings.general?.storePhone || ''} onChange={(e) => updateSetting('general', 'storePhone', e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Currency</label><select value={settings.general?.currency || 'USD'} onChange={(e) => updateSetting('general', 'currency', e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }}><option value="USD">USD - US Dollar</option><option value="EUR">EUR - Euro</option><option value="GBP">GBP - British Pound</option><option value="NGN">NGN - Nigerian Naira</option></select></div>
            </div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Store Address</label><textarea value={settings.general?.storeAddress || ''} onChange={(e) => updateSetting('general', 'storeAddress', e.target.value)} rows={3} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} /></div>
          </div>
        </div>

        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>Social Media Links</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Facebook</label><input type="url" value={settings.general?.socialMedia?.facebook || ''} onChange={(e) => updateSetting('general', 'socialMedia', { ...settings.general.socialMedia, facebook: e.target.value })} placeholder="https://facebook.com/yourpage" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Instagram</label><input type="url" value={settings.general?.socialMedia?.instagram || ''} onChange={(e) => updateSetting('general', 'socialMedia', { ...settings.general.socialMedia, instagram: e.target.value })} placeholder="https://instagram.com/yourpage" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Twitter</label><input type="url" value={settings.general?.socialMedia?.twitter || ''} onChange={(e) => updateSetting('general', 'socialMedia', { ...settings.general.socialMedia, twitter: e.target.value })} placeholder="https://twitter.com/yourpage" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>TikTok</label><input type="url" value={settings.general?.socialMedia?.tiktok || ''} onChange={(e) => updateSetting('general', 'socialMedia', { ...settings.general.socialMedia, tiktok: e.target.value })} placeholder="https://tiktok.com/@yourpage" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>LinkedIn</label><input type="url" value={settings.general?.socialMedia?.linkedin || ''} onChange={(e) => updateSetting('general', 'socialMedia', { ...settings.general.socialMedia, linkedin: e.target.value })} placeholder="https://linkedin.com/company/yourpage" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>YouTube</label><input type="url" value={settings.general?.socialMedia?.youtube || ''} onChange={(e) => updateSetting('general', 'socialMedia', { ...settings.general.socialMedia, youtube: e.target.value })} placeholder="https://youtube.com/@yourchannel" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>WhatsApp</label><input type="url" value={settings.general?.socialMedia?.whatsapp || ''} onChange={(e) => updateSetting('general', 'socialMedia', { ...settings.general.socialMedia, whatsapp: e.target.value })} placeholder="https://wa.me/yournumber" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
          </div>
        </div>

        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>💳 Payment Settings</h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Paystack Secret Key (leave blank to keep current)</label><input type="text"  onChange={(e) => updateSetting('general', 'payment', { ...settings.general.payment, paystackSecretKey: e.target.value })} placeholder="sk_live_..." style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Paystack Public Key</label><input type="text" value={settings.general?.payment?.paystackPublicKey || ''} onChange={(e) => updateSetting('general', 'payment', { ...settings.general.payment, paystackPublicKey: e.target.value })} placeholder="pk_live_..." style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
          </div>
        </div>

        <div style={{ paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => saveSettings('general')} disabled={saving} style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', backgroundColor: saving ? '#6c757d' : '#007bff', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );

  const renderShippingTab = () => (
    <div>
      <div style={{ marginBottom: '32px' }}><h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>Shipping Settings</h2><p style={{ color: '#6c757d', margin: '0 0 24px 0' }}>Configure your store's shipping options</p></div>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <input type="checkbox" checked={settings.shipping?.freeShipping?.enabled || false} onChange={(e) => updateSetting('shipping', 'freeShipping', { ...settings.shipping.freeShipping, enabled: e.target.checked })} id="freeShippingEnabled" style={{ width: '18px', height: '18px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', margin: 0 }}>🚚 Free Shipping</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingLeft: '30px' }}>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Minimum Order Amount</label><input type="number" value={settings.shipping?.freeShipping?.minimumOrder || 0} onChange={(e) => updateSetting('shipping', 'freeShipping', { ...settings.shipping.freeShipping, minimumOrder: parseFloat(e.target.value) })} min="0" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
          </div>
        </div>

        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <input type="checkbox" checked={settings.shipping?.flatRate?.enabled || false} onChange={(e) => updateSetting('shipping', 'flatRate', { ...settings.shipping.flatRate, enabled: e.target.checked })} id="flatRateEnabled" style={{ width: '18px', height: '18px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', margin: 0 }}>💵 Flat Rate Shipping</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingLeft: '30px' }}>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Flat Rate Amount</label><input type="number" value={settings.shipping?.flatRate?.rate || 0} onChange={(e) => updateSetting('shipping', 'flatRate', { ...settings.shipping.flatRate, rate: parseFloat(e.target.value) })} min="0" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
          </div>
        </div>

        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <input type="checkbox" checked={settings.shipping?.localPickup?.enabled || false} onChange={(e) => updateSetting('shipping', 'localPickup', { ...settings.shipping.localPickup, enabled: e.target.checked })} id="localPickupEnabled" style={{ width: '18px', height: '18px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', margin: 0 }}>🏪 Local Pickup</h3>
          </div>
          <div style={{ paddingLeft: '30px' }}>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Description</label><textarea value={settings.shipping?.localPickup?.description || ''} onChange={(e) => updateSetting('shipping', 'localPickup', { ...settings.shipping.localPickup, description: e.target.value })} rows={3} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} /></div>
          </div>
        </div>

        <div style={{ paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => saveSettings('general')} disabled={saving} style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', backgroundColor: saving ? '#6c757d' : '#007bff', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );

  const renderDeliveryFeesTab = () => (
    <div>
      <div style={{ marginBottom: '32px' }}><h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>Delivery Fees Settings</h2><p style={{ color: '#6c757d', margin: '0 0 24px 0' }}>Configure delivery fees based on weight and distance</p></div>
      <div style={{ display: 'grid', gap: '32px' }}>
        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px', backgroundColor: settings.deliveryFees?.weightBased?.enabled ? '#f0fdf4' : '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <input type="checkbox" checked={settings.deliveryFees?.weightBased?.enabled || false} onChange={(e) => updateSetting('deliveryFees', 'weightBased', { ...settings.deliveryFees.weightBased, enabled: e.target.checked })} id="weightBasedEnabled" style={{ width: '18px', height: '18px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', margin: 0 }}>⚖️ Weight-Based Delivery Fee</h3>
          </div>
          <div style={{ paddingLeft: '30px', display: 'grid', gap: '20px' }}>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>Apply delivery fee when the total weight of ordered products exceeds the minimum weight threshold.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Minimum Weight (kg)</label><input type="number" value={settings.deliveryFees?.weightBased?.minimumWeight || 1} onChange={(e) => updateSetting('deliveryFees', 'weightBased', { ...settings.deliveryFees.weightBased, minimumWeight: parseFloat(e.target.value) })} min="0" step="0.1" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Delivery Fee ({settings.general?.currency || 'USD'})</label><input type="number" value={settings.deliveryFees?.weightBased?.fee || 0} onChange={(e) => updateSetting('deliveryFees', 'weightBased', { ...settings.deliveryFees.weightBased, fee: parseFloat(e.target.value) })} min="0" step="0.01" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px', backgroundColor: settings.deliveryFees?.distanceBased?.enabled ? '#f0fdf4' : '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <input type="checkbox" checked={settings.deliveryFees?.distanceBased?.enabled || false} onChange={(e) => updateSetting('deliveryFees', 'distanceBased', { ...settings.deliveryFees.distanceBased, enabled: e.target.checked })} id="distanceBasedEnabled" style={{ width: '18px', height: '18px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', margin: 0 }}>📍 Distance-Based Delivery Fee</h3>
          </div>
          <div style={{ paddingLeft: '30px', display: 'grid', gap: '20px' }}>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>Apply delivery fee when the delivery distance exceeds the minimum distance threshold.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Minimum Distance (km)</label><input type="number" value={settings.deliveryFees?.distanceBased?.minimumDistance || 1} onChange={(e) => updateSetting('deliveryFees', 'distanceBased', { ...settings.deliveryFees.distanceBased, minimumDistance: parseFloat(e.target.value) })} min="0" step="0.1" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Delivery Fee ({settings.general?.currency || 'USD'})</label><input type="number" value={settings.deliveryFees?.distanceBased?.fee || 0} onChange={(e) => updateSetting('deliveryFees', 'distanceBased', { ...settings.deliveryFees.distanceBased, fee: parseFloat(e.target.value) })} min="0" step="0.01" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => saveSettings('general')} disabled={saving} style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', backgroundColor: saving ? '#6c757d' : '#007bff', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );

  const renderSliderForm = () => (
    <div style={{ marginBottom: '32px', padding: '24px', border: '2px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f8f9fa' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>{editingSlider ? 'Edit Slider' : 'Add New Slider'}</h3>
      <form onSubmit={handleSliderFormSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Title *</label><input type="text" value={sliderForm.title} onChange={(e) => setSliderForm(prev => ({ ...prev, title: e.target.value }))} required style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Type</label><select value={sliderForm.type} onChange={(e) => setSliderForm(prev => ({ ...prev, type: e.target.value }))} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }}><option value="image">Image</option></select></div>
          </div>
          <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Description</label><ReactQuill value={sliderForm.description} onChange={handleSliderDescriptionChange} modules={quillModules} formats={quillFormats} theme="snow" style={{ border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Upload Image *</label><input type="file" accept="image/*" onChange={handleSliderImageChange} required={!editingSlider} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />{sliderImagePreview && <img src={sliderImagePreview} alt="Preview" style={{ marginTop: '12px', maxHeight: '150px', borderRadius: '8px' }} />}</div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Link URL</label><input type="url" value={sliderForm.link} onChange={(e) => setSliderForm(prev => ({ ...prev, link: e.target.value }))} placeholder="https://example.com" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={resetSliderForm} style={{ padding: '12px 24px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', backgroundColor: saving ? '#6c757d' : '#007bff', color: '#fff', cursor: 'pointer' }}>{saving ? 'Saving...' : (editingSlider ? 'Update' : 'Add')} Slider</button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderTabContent = () => {
    if (userType === 'subadmin' && activeTab === 'branch') {
      return (
        <div>
          <div style={{ marginBottom: '32px' }}><h2 style={{ fontSize: '24px', fontWeight: '600' }}>Branch Settings</h2><p style={{ color: '#6c757d' }}>Manage your branch information</p></div>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Branch Name</label><input type="text" value={settings.branch?.branchName || ''} onChange={(e) => updateSetting('branch', 'branchName', e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Branch Email</label><input type="email" value={settings.branch?.branchEmail || ''} onChange={(e) => updateSetting('branch', 'branchEmail', e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
            </div>
            <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Branch Address</label><textarea value={settings.branch?.branchAddress || ''} onChange={(e) => updateSetting('branch', 'branchAddress', e.target.value)} rows={3} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Phone Number</label><input type="tel" value={settings.branch?.branchPhone || ''} onChange={(e) => updateSetting('branch', 'branchPhone', e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Status</label><select value={settings.branch?.branchStatus || 'active'} onChange={(e) => updateSetting('branch', 'branchStatus', e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            </div>
            <div style={{ paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => fetchSettings()} style={{ padding: '12px 24px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>Reset</button>
              <button onClick={() => saveSettings('branch')} disabled={saving} style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', backgroundColor: saving ? '#6c757d' : '#007bff', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'general') return renderGeneralTab();
    if (activeTab === 'shipping') return renderShippingTab();
    if (activeTab === 'delivery') return renderDeliveryFeesTab();
    if (activeTab === 'sliders') {
      return (
        <div>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><h2 style={{ fontSize: '24px', fontWeight: '600' }}>Homepage Sliders</h2><p style={{ color: '#6c757d' }}>Manage homepage slider content</p></div>
            <button onClick={() => setShowSliderForm(true)} style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }}>Add Slider</button>
          </div>
          {showSliderForm && renderSliderForm()}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ backgroundColor: '#f8f9fa' }}><th style={{ padding: '16px', textAlign: 'left' }}>Preview</th><th style={{ padding: '16px', textAlign: 'left' }}>Title</th><th style={{ padding: '16px', textAlign: 'left' }}>Type</th><th style={{ padding: '16px', textAlign: 'left' }}>Status</th><th style={{ padding: '16px', textAlign: 'left' }}>Actions</th></tr></thead>
              <tbody>
                {settings.sliders?.map((slider) => (
                  <tr key={slider.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px' }}>{slider.type === 'image' && slider.image ? <img src={slider.image} alt={slider.title} style={{ width: '60px', height: '40px', borderRadius:'4px', objectFit:'4px' }} /> : '📷'}</td>
                    <td style={{ padding: '16px' }}>{slider.title}</td>
                    <td style={{ padding: '16px', textTransform: 'capitalize' }}>{slider.type}</td>
                    <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: slider.status === 'active' ? '#d4edda' : '#f8d7da', color: slider.status === 'active' ? '#155724' : '#721c24' }}>{slider.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => editSlider(slider)} style={{ padding: '8px 12px', border: 'none', borderRadius: '6px', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteSlider(slider.id)} disabled={saving} style={{ padding: '8px 12px', border: 'none', borderRadius: '6px', backgroundColor: saving ? '#6c757d' : '#dc3545', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!settings.sliders || settings.sliders.length === 0) && <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>No sliders added yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    if (activeTab === 'ads') return <AdminAds token={token} apiUrl={import.meta.env.VITE_API_URL} />;
    return <div style={{ textAlign: 'center', padding: '60px' }}><div style={{ fontSize: '48px' }}>🚧</div><h3>Coming Soon</h3><p>This section is under development</p></div>;
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '0' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e9ecef', padding: '24px 32px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}><h1 style={{ fontSize: '28px', fontWeight: '600', margin: '0 0 8px 0' }}>Settings</h1><p style={{ color: '#6c757d', margin: '0' }}>Manage your store configuration and preferences</p></div>
      </div>
      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>Configuration</h3>
            <nav>
              {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', borderRadius: '8px', backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent', color: activeTab === tab.id ? '#fff' : '#6c757d', cursor: 'pointer', marginBottom: '4px', textAlign: 'left' }}><span style={{ fontSize: '18px' }}>{tab.icon}</span>{tab.label}</button>))}
            </nav>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
