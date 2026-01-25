import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'color': [] }, { 'background': [] }], // Text color and background color
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

const AdminSettings = ({ userType = 'admin' }) => {
  const [activeTab, setActiveTab] = useState(userType === 'subadmin' ? 'branch' : 'general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSliderForm, setShowSliderForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [sliderForm, setSliderForm] = useState({ title: '', description: '', link: '', image: '', imageFile: null, video: '', type: 'image' });
  const [adForm, setAdForm] = useState({ title: '', description: '', link: '', image: '', imageFile: null, position: 'banner', active: true, type: 'image', priority: 1, starts_at: '', ends_at: '' });
  const [sliderImagePreview, setSliderImagePreview] = useState('');
  const [adImagePreview, setAdImagePreview] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [settings, setSettings] = useState(userType === 'subadmin' ? {
    branch: {
      branchName: '',
      branchAddress: '',
      branchPhone: '',
      branchEmail: '',
      branchManager: '',
      branchStatus: 'active'
    }
  } : {
    general: {
      storeName: '',
      storeDescription: '',
      missionStatement: '',
      visionStatement: '',
      storeEmail: '',
      storePhone: '',
      storeAddress: '',
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false,
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        tiktok: '',
        linkedin: '',
        youtube: '',
        whatsapp: ''
      },
      payment: {
        paystackSecretKey: '',
        paystackPublicKey: ''
      },
      vat: {
        enabled: false,
        rate: 0,
        number: ''
      },
      email: {
        mailer: 'smtp',
        host: 'smtp.mailtrap.io',
        port: '2525',
        username: 'your_username',
        password: 'your_password',
        encryption: 'tls',
        fromAddress: 'noreply@chapterone.com',
        fromName: 'Chapter One Stationery'
      }
    },
    shipping: {
      freeShipping: { enabled: true, minimumOrder: 50 },
      flatRate: { enabled: true, rate: 10 },
      localPickup: { enabled: true, description: 'Pickup from our store' }
    },
    sliders: [],
    ads: []
  });

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Quill change handlers
  const handleMissionChange = (value) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        missionStatement: value
      }
    }));
  };

  const handleVisionChange = (value) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        visionStatement: value
      }
    }));
  };

  const handleStoreDescriptionChange = (value) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        storeDescription: value
      }
    }));
  };

  const handleSliderDescriptionChange = (value) => {
    setSliderForm(prev => ({ ...prev, description: value }));
  };

  const handleAdDescriptionChange = (value) => {
    setAdForm(prev => ({ ...prev, description: value }));
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      if (userType === 'subadmin') {
        const branchResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/subadmin/branch`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (branchResponse.data.success) {
          const branchData = branchResponse.data.data;
          setSettings(prevSettings => ({
            ...prevSettings,
            branch: {
              ...prevSettings.branch,
              branchName: branchData.name || '',
              branchAddress: branchData.address || '',
              branchPhone: branchData.phone || '',
              branchEmail: branchData.email || '',
              latitude: branchData.latitude || '',
              longitude: branchData.longitude || '',
              branchStatus: branchData.is_active ? 'active' : 'inactive'
            }
          }));
        }
      } else {
        await fetchSliders();
        await fetchAds();
        await fetchGeneralSettings();
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
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
          image: `${import.meta.env.VITE_API_URL}/storage/${ad.media_url}`,
          position: ad.position,
          status: ad.status,
          priority: ad.priority,
          starts_at: ad.starts_at?.split('T')[0] || '',
          ends_at: ad.ends_at?.split('T')[0] || '',
          active: ad.status === 'active'
        }));
        setSettings(prev => ({ ...prev, ads: adsData }));
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    }
  };

  const fetchSliders = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const url = `${baseUrl}/api/admin/sliders`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const slidersData = response.data.data.map(slider => ({
          id: slider.id,
          title: slider.title,
          description: slider.description,
          link: slider.link,
          image: `${import.meta.env.VITE_API_URL}/storage/${slider.image_path}`,
          type: slider.type || 'image',
          status: slider.status || 'active'
        }));
        setSettings(prev => ({ ...prev, sliders: slidersData }));
      }
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    }
  };

  const fetchGeneralSettings = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const url = `${baseUrl}/api/settings`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const apiData = response.data.data;
        setSettings(prev => ({
          ...prev,
          general: {
            ...prev.general,
            storeName: apiData.site_name || '',
            storeDescription: apiData.store_description || '',
            missionStatement: apiData.mission_statement || '',
            visionStatement: apiData.vision_statement || '',
            storeEmail: apiData.store_email || '',
            storePhone: apiData.store_phone || '',
            storeAddress: apiData.store_address || '',
            currency: apiData.currency || 'USD',
            maintenanceMode: apiData.maintenance_mode === 'true',
            socialMedia: {
              facebook: apiData.facebook || '',
              instagram: apiData.instagram || '',
              twitter: apiData.twitter || '',
              tiktok: apiData.tiktok || '',
              linkedin: apiData.linkedin || '',
              youtube: apiData.youtube || '',
              whatsapp: apiData.whatsapp || ''
            },
            payment: {
              paystackSecretKey: apiData.paystack_secret_key || '',
              paystackPublicKey: apiData.paystack_public_key || ''
            },
            vat: {
              enabled: apiData.vat_enabled === 'true',
              rate: parseFloat(apiData.vat_rate) || 0,
              number: apiData.vat_number || ''
            },
            email: {
              mailer: apiData.mail_mailer || 'smtp',
              host: apiData.mail_host || 'smtp.mailtrap.io',
              port: apiData.mail_port || '2525',
              username: apiData.mail_username || 'your_username',
              password: apiData.mail_password || 'your_password',
              encryption: apiData.mail_encryption || 'tls',
              fromAddress: apiData.mail_from_address || 'noreply@chapterone.com',
              fromName: apiData.mail_from_name || 'Chapter One Stationery'
            }
          }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch general settings:', error);
    }
  };

  const saveGeneralSettings = async () => {
    try {
      setSaving(true);
      const { general } = settings;

      const settingsData = [
        { key: 'site_name', value: general.storeName },
        { key: 'store_description', value: general.storeDescription },
        { key: 'mission_statement', value: general.missionStatement },
        { key: 'vision_statement', value: general.visionStatement },
        { key: 'store_email', value: general.storeEmail },
        { key: 'store_phone', value: general.storePhone },
        { key: 'store_address', value: general.storeAddress },
        { key: 'currency', value: general.currency },
        { key: 'maintenance_mode', value: general.maintenanceMode.toString() },
        { key: 'facebook', value: general.socialMedia.facebook },
        { key: 'instagram', value: general.socialMedia.instagram },
        { key: 'twitter', value: general.socialMedia.twitter },
        { key: 'tiktok', value: general.socialMedia.tiktok },
        { key: 'linkedin', value: general.socialMedia.linkedin },
        { key: 'youtube', value: general.socialMedia.youtube },
        { key: 'whatsapp', value: general.socialMedia.whatsapp },
        { key: 'paystack_secret_key', value: general.payment.paystackSecretKey },
        { key: 'paystack_public_key', value: general.payment.paystackPublicKey },
        { key: 'vat_enabled', value: general.vat.enabled.toString() },
        { key: 'vat_rate', value: general.vat.rate.toString() },
        { key: 'vat_number', value: general.vat.number },
        { key: 'mail_mailer', value: general.email.mailer },
        { key: 'mail_host', value: general.email.host },
        { key: 'mail_port', value: general.email.port },
        { key: 'mail_username', value: general.email.username },
        { key: 'mail_password', value: general.email.password },
        { key: 'mail_encryption', value: general.email.encryption },
        { key: 'mail_from_address', value: general.email.fromAddress },
        { key: 'mail_from_name', value: general.email.fromName }
      ];

      const baseUrl = import.meta.env.VITE_API_URL;
      const url = `${baseUrl}/api/admin/settings`;

      const response = await axios.post(url, settingsData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Settings saved successfully');
        await fetchGeneralSettings();
      }
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Slider CRUD operations
  const addSlider = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('title', sliderForm.title);
      formData.append('description', sliderForm.description);
      formData.append('link', sliderForm.link);
      formData.append('type', sliderForm.type);

      if (sliderForm.imageFile) {
        formData.append('image_path', sliderForm.imageFile);
      }

      if (sliderForm.type === 'video') {
        formData.append('video', sliderForm.video);
      }

      const baseUrl = import.meta.env.VITE_API_URL;
      const url = `${baseUrl}/api/admin/sliders`;

      const response = await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Slider created successfully');
        await fetchSliders();
        resetSliderForm();
      } else {
        toast.error('Failed to create slider');
      }
    } catch (error) {
      toast.error('Failed to create slider');
      console.error('Create slider error:', error);
    } finally {
      setSaving(false);
    }
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

      if (sliderForm.imageFile) {
        formData.append('image_path', sliderForm.imageFile);
      }

      if (sliderForm.type === 'video') {
        formData.append('video', sliderForm.video);
      }

      const baseUrl = import.meta.env.VITE_API_URL;
      const url = `${baseUrl}/api/admin/sliders/${editingSlider.id}`;

      const response = await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Slider updated successfully');
        await fetchSliders();
        resetSliderForm();
      } else {
        toast.error('Failed to update slider');
      }
    } catch (error) {
      toast.error('Failed to update slider');
      console.error('Update slider error:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteSlider = async (sliderId) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      try {
        setSaving(true);
        const baseUrl = import.meta.env.VITE_API_URL;
        const url = `${baseUrl}/api/admin/sliders/${sliderId}`;

        const response = await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          toast.success('Slider deleted successfully');
          await fetchSliders();
        } else {
          toast.error('Failed to delete slider');
        }
      } catch (error) {
        toast.error('Failed to delete slider');
        console.error('Delete slider error:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  // Ad validation functions
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

  // Ad CRUD operations with validation
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
      formData.append('status', adForm.active ? 'active' : 'inactive');

      const baseUrl = import.meta.env.VITE_API_URL;
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
        // Handle validation errors from server
        const serverErrors = error.response.data.errors;
        setFormErrors(serverErrors);

        // Show specific error messages
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
      formData.append('status', adForm.active ? 'active' : 'inactive');
      formData.append('_method', 'POST');

      const baseUrl = import.meta.env.VITE_API_URL;
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
        // Handle validation errors from server
        const serverErrors = error.response.data.errors;
        setFormErrors(serverErrors);

        // Show specific error messages
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
        const baseUrl = import.meta.env.VITE_API_URL;
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

  const saveSettings = async (section) => {
    if (section === 'general') {
      await saveGeneralSettings();
      return;
    }

    try {
      setSaving(true);
      if (userType === 'subadmin' && section === 'branch') {
        const branchData = {
          name: settings.branch.branchName,
          address: settings.branch.branchAddress,
          phone: settings.branch.branchPhone,
          email: settings.branch.branchEmail,
          latitude: settings.branch.latitude,
          longitude: settings.branch.longitude,
          is_active: settings.branch.branchStatus === 'active'
        };

        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/subadmin/branch`,
          branchData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        if (response.data.data.success) {
          toast.success(response.data.message || 'Branch settings saved successfully');
          alert(response.data.message);
        }else{
          alert(response.data.message);
          toast.success(response.data.message || 'Branch settings failed to save');

        }
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section, field, value) => {
    setSettings(prev => {
      if (typeof field === 'object') {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            ...field
          }
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
    });
  };

  const editSlider = (slider) => {
    setEditingSlider(slider);
    setSliderForm({
      title: slider.title || '',
      description: slider.description || '',
      link: slider.link || '',
      image: slider.image || '',
      imageFile: null,
      video: slider.video || '',
      type: slider.type || 'image'
    });
    setSliderImagePreview(slider.image || '');
    setShowSliderForm(true);
  };

  const editAd = (ad) => {
    setEditingAd(ad);
    setAdForm({
      title: ad.title || '',
      description: ad.description || '',
      link: ad.link || '',
      image: ad.image || '',
      imageFile: null,
      position: ad.position || 'banner',
      active: ad.status === 'active',
      type: ad.type || 'image',
      priority: ad.priority || 1,
      starts_at: ad.starts_at || '',
      ends_at: ad.ends_at || ''
    });
    setAdImagePreview(ad.image || '');
    setShowAdForm(true);
    setFormErrors({}); // Clear previous errors when editing
  };

  const handleSliderImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setSliderImagePreview(imageData);
        setSliderForm(prev => ({ ...prev, image: imageData, imageFile: file }));
      };
      reader.readAsDataURL(file);
    }
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

  const resetSliderForm = () => {
    setSliderForm({ title: '', description: '', link: '', image: '', imageFile: null, video: '', type: 'image' });
    setSliderImagePreview('');
    setShowSliderForm(false);
    setEditingSlider(null);
  };

  const resetAdForm = () => {
    setAdForm({ title: '', description: '', link: '', image: '', imageFile: null, position: 'banner', active: true, type: 'image', priority: 1, starts_at: '', ends_at: '' });
    setAdImagePreview('');
    setShowAdForm(false);
    setEditingAd(null);
    setFormErrors({});
  };

  const handleSliderFormSubmit = async (e) => {
    e.preventDefault();
    if (editingSlider) {
      await updateSlider();
    } else {
      await addSlider();
    }
  };

  const handleAdFormSubmit = async (e) => {
    e.preventDefault();
    if (editingAd) {
      await updateAd();
    } else {
      await addAd();
    }
  };

  const tabs = userType === 'subadmin' ? [
    { id: 'branch', label: 'Branch Settings', icon: '🏢' }
  ] : [
    { id: 'general', label: 'General', icon: '🏪' },
    // { id: 'shipping', label: 'Shipping', icon: '🚚' },
    { id: 'sliders', label: 'Homepage Sliders', icon: '🖼️' },
    { id: 'ads', label: 'Advertisements', icon: '📢' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading settings...</p>
      </div>
    );
  }

  const renderGeneralTab = () => (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>General Settings</h2>
        <p style={{ color: '#6c757d', margin: '0 0 24px 0' }}>Configure your store's basic information and preferences</p>
      </div>

      <div style={{ display: 'grid', gap: '32px' }}>
        <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>Store Information</h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Store Name</label>
                <input
                  type="text"
                  value={settings.general?.storeName || ''}
                  onChange={(e) => updateSetting('general', 'storeName', e.target.value)}
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
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Store Email</label>
                <input
                  type="email"
                  value={settings.general?.storeEmail || ''}
                  onChange={(e) => updateSetting('general', 'storeEmail', e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Store Description</label>
              <ReactQuill
                value={settings.general?.storeDescription || ''}
                onChange={handleStoreDescriptionChange}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}
              />
            </div>

            <div >
              <div className="mb-3">
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Mission Statement</label>
                <ReactQuill
                  value={settings.general?.missionStatement || ''}
                  onChange={handleMissionChange}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Vision Statement</label>
                <ReactQuill
                  value={settings.general?.visionStatement || ''}
                  onChange={handleVisionChange}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Phone Number</label>
                <input
                  type="tel"
                  value={settings.general?.storePhone || ''}
                  onChange={(e) => updateSetting('general', 'storePhone', e.target.value)}
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
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Currency</label>
                <select
                  value={settings.general?.currency || 'USD'}
                  onChange={(e) => updateSetting('general', 'currency', e.target.value)}
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
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Store Address</label>
              <textarea
                value={settings.general?.storeAddress || ''}
                onChange={(e) => updateSetting('general', 'storeAddress', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ padding: '24px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>Social Media Links</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { key: 'facebook', label: 'Facebook', icon: '📘' },
              { key: 'instagram', label: 'Instagram', icon: '📷' },
              { key: 'twitter', label: 'Twitter', icon: '🐦' },
              { key: 'tiktok', label: 'TikTok', icon: '🎵' },
              { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
              { key: 'youtube', label: 'YouTube', icon: '📺' },
              { key: 'whatsapp', label: 'WhatsApp', icon: '💬' }
            ].map(social => (
              <div key={social.key}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  {social.icon} {social.label}
                </label>
                <input
                  type="url"
                  value={settings.general?.socialMedia?.[social.key] || ''}
                  onChange={(e) => updateSetting('general', 'socialMedia', { ...settings.general.socialMedia, [social.key]: e.target.value })}
                  placeholder={`https://${social.key}.com/yourpage`}
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
            ))}
          </div>
        </div>

        <div style={{ padding: '24px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>Payment Settings</h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Paystack Secret Key</label>
              <input
                type="password"
                value={settings.general?.payment?.paystackSecretKey || ''}
                onChange={(e) => updateSetting('general', 'payment', { ...settings.general.payment, paystackSecretKey: e.target.value })}
                placeholder="sk_test_..."
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Paystack Public Key</label>
              <input
                type="text"
                value={settings.general?.payment?.paystackPublicKey || ''}
                onChange={(e) => updateSetting('general', 'payment', { ...settings.general.payment, paystackPublicKey: e.target.value })}
                placeholder="pk_test_..."
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
        </div>

        <div style={{ padding: '24px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>Email Settings</h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Mailer</label>
                <select
                  value={settings.general?.email?.mailer || 'smtp'}
                  onChange={(e) => updateSetting('general', 'email', { ...settings.general.email, mailer: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="smtp">SMTP</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="sendgrid">SendGrid</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Host</label>
                <input
                  type="text"
                  value={settings.general?.email?.host || ''}
                  onChange={(e) => updateSetting('general', 'email', { ...settings.general.email, host: e.target.value })}
                  placeholder="smtp.mailtrap.io"
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Port</label>
                <input
                  type="text"
                  value={settings.general?.email?.port || ''}
                  onChange={(e) => updateSetting('general', 'email', { ...settings.general.email, port: e.target.value })}
                  placeholder="2525"
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
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Encryption</label>
                <select
                  value={settings.general?.email?.encryption || 'tls'}
                  onChange={(e) => updateSetting('general', 'email', { ...settings.general.email, encryption: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Username</label>
                <input
                  type="text"
                  value={settings.general?.email?.username || ''}
                  onChange={(e) => updateSetting('general', 'email', { ...settings.general.email, username: e.target.value })}
                  placeholder="your_username"
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
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Password</label>
                <input
                  type="password"
                  value={settings.general?.email?.password || ''}
                  onChange={(e) => updateSetting('general', 'email', { ...settings.general.email, password: e.target.value })}
                  placeholder="your_password"
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>From Address</label>
                <input
                  type="email"
                  value={settings.general?.email?.fromAddress || ''}
                  onChange={(e) => updateSetting('general', 'email', { ...settings.general.email, fromAddress: e.target.value })}
                  placeholder="noreply@chapterone.com"
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
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>From Name</label>
                <input
                  type="text"
                  value={settings.general?.email?.fromName || ''}
                  onChange={(e) => updateSetting('general', 'email', { ...settings.general.email, fromName: e.target.value })}
                  placeholder="Chapter One Stationery"
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
          </div>
        </div>

        <div style={{ padding: '24px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>VAT Settings</h3>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="vatEnabled"
                checked={settings.general?.vat?.enabled || false}
                onChange={(e) => updateSetting('general', 'vat', { ...settings.general.vat, enabled: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="vatEnabled" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Enable VAT</label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>VAT Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.general?.vat?.rate || 0}
                  onChange={(e) => updateSetting('general', 'vat', { ...settings.general.vat, rate: parseFloat(e.target.value) })}
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
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>VAT Number</label>
                <input
                  type="text"
                  value={settings.general?.vat?.number || ''}
                  onChange={(e) => updateSetting('general', 'vat', { ...settings.general.vat, number: e.target.value })}
                  placeholder="VAT123456789"
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
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <input
            type="checkbox"
            id="maintenanceMode"
            checked={settings.general?.maintenanceMode || false}
            onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="maintenanceMode" style={{ fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Enable Maintenance Mode</label>
        </div>

        <div style={{ paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => saveSettings('general')}
            disabled={saving}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: saving ? '#6c757d' : '#007bff',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSliderForm = () => (
    <div style={{ marginBottom: '32px', padding: '24px', border: '2px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f8f9fa' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', marginBottom: '20px' }}>
        {editingSlider ? 'Edit Slider' : 'Add New Slider'}
      </h3>
      <form onSubmit={handleSliderFormSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Title *</label>
              <input
                type="text"
                value={sliderForm.title}
                onChange={(e) => setSliderForm(prev => ({ ...prev, title: e.target.value }))}
                required
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Type</label>
              <select
                value={sliderForm.type}
                onChange={(e) => setSliderForm(prev => ({ ...prev, type: e.target.value }))}
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
                <option value="image">Image</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Description</label>
            <ReactQuill
              value={sliderForm.description}
              onChange={handleSliderDescriptionChange}
              modules={quillModules}
              formats={quillFormats}
              theme="snow"
              style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                {sliderForm.type === 'image' ? 'Upload Image *' : 'Video URL'}
              </label>
              {sliderForm.type === 'image' ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSliderImageChange}
                    required={!editingSlider}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#fff'
                    }}
                  />
                  {sliderImagePreview && (
                    <div style={{ marginTop: '12px' }}>
                      <img
                        src={sliderImagePreview}
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
              ) : (
                <input
                  type="url"
                  value={sliderForm.video}
                  onChange={(e) => setSliderForm(prev => ({ ...prev, video: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Link URL</label>
              <input
                type="url"
                value={sliderForm.link}
                onChange={(e) => setSliderForm(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://example.com"
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
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={resetSliderForm}
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
              {saving ? 'Saving...' : (editingSlider ? 'Update' : 'Add')} Slider
            </button>
          </div>
        </div>
      </form>
    </div>
  );

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
                <option value="sidebar">Sidebar</option>
                <option value="footer">Footer</option>
                <option value="popup">Popup</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
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
            </div>
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
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Link URL</label>
            <input
              type="url"
              value={adForm.link}
              onChange={(e) => setAdForm(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://example.com"
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

  const renderTabContent = () => {
    if (userType === 'subadmin' && activeTab === 'branch') {
      return (
        <div>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>Branch Settings</h2>
            <p style={{ color: '#6c757d', margin: '0 0 24px 0' }}>Manage your branch information and configuration</p>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Branch Name</label>
                <input
                  type="text"
                  value={settings.branch?.branchName || ''}
                  onChange={(e) => updateSetting('branch', 'branchName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Branch Email</label>
                <input
                  type="email"
                  value={settings.branch?.branchEmail || ''}
                  onChange={(e) => updateSetting('branch', 'branchEmail', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Branch Address</label>
              <textarea
                value={settings.branch?.branchAddress || ''}
                onChange={(e) => updateSetting('branch', 'branchAddress', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Phone Number</label>
                <input
                  type="tel"
                  value={settings.branch?.branchPhone || ''}
                  onChange={(e) => updateSetting('branch', 'branchPhone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Status</label>
                <select
                  value={settings.branch?.branchStatus || 'active'}
                  onChange={(e) => updateSetting('branch', 'branchStatus', e.target.value)}
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => fetchSettings()}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  color: '#6c757d',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#007bff';
                  e.target.style.color = '#007bff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.color = '#6c757d';
                }}
              >
                Reset
              </button>
              <button
                onClick={() => saveSettings('branch')}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: saving ? '#6c757d' : '#007bff',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.target.style.backgroundColor = '#0056b3';
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.target.style.backgroundColor = '#007bff';
                }}
              >
                {saving ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'general') {
      return renderGeneralTab();
    }

    if (activeTab === 'shipping') {
      return (
        <div>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>Shipping Settings</h2>
            <p style={{ color: '#6c757d', margin: '0 0 24px 0' }}>Configure shipping methods and rates</p>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="freeShipping"
                  checked={settings.shipping?.freeShipping?.enabled || false}
                  onChange={(e) => updateSetting('shipping', 'freeShipping', { ...settings.shipping.freeShipping, enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="freeShipping" style={{ fontSize: '16px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Free Shipping</label>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Minimum Order Amount</label>
                <input
                  type="number"
                  value={settings.shipping?.freeShipping?.minimumOrder || 0}
                  onChange={(e) => updateSetting('shipping', 'freeShipping', { ...settings.shipping.freeShipping, minimumOrder: parseFloat(e.target.value) })}
                  style={{
                    width: '200px',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="flatRate"
                  checked={settings.shipping?.flatRate?.enabled || false}
                  onChange={(e) => updateSetting('shipping', 'flatRate', { ...settings.shipping.flatRate, enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="flatRate" style={{ fontSize: '16px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Flat Rate Shipping</label>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Shipping Rate</label>
                <input
                  type="number"
                  value={settings.shipping?.flatRate?.rate || 0}
                  onChange={(e) => updateSetting('shipping', 'flatRate', { ...settings.shipping.flatRate, rate: parseFloat(e.target.value) })}
                  style={{
                    width: '200px',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '20px', border: '2px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  id="localPickup"
                  checked={settings.shipping?.localPickup?.enabled || false}
                  onChange={(e) => updateSetting('shipping', 'localPickup', { ...settings.shipping.localPickup, enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="localPickup" style={{ fontSize: '16px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>Local Pickup</label>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Description</label>
                <input
                  type="text"
                  value={settings.shipping?.localPickup?.description || ''}
                  onChange={(e) => updateSetting('shipping', 'localPickup', { ...settings.shipping.localPickup, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ paddingTop: '24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => saveSettings('shipping')}
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
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'sliders') {
      return (
        <div>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>Homepage Sliders</h2>
              <p style={{ color: '#6c757d', margin: '0' }}>Manage homepage slider content</p>
            </div>
            <button
              onClick={() => setShowSliderForm(true)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#007bff',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add Slider
            </button>
          </div>

          {showSliderForm && renderSliderForm()}

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Preview</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Title</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Type</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.sliders?.map((slider) => (
                  <tr key={slider.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px' }}>
                      {slider.type === 'image' && slider.image ? (
                        <img src={slider.image} alt={slider.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : slider.type === 'video' && slider.video ? (
                        <div style={{ width: '60px', height: '40px', backgroundColor: '#f8f9fa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎥</div>
                      ) : (
                        <div style={{ width: '60px', height: '40px', backgroundColor: '#f8f9fa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📷</div>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>{slider.title}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>{slider.type}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: slider.status === 'active' ? '#d4edda' : '#f8d7da',
                        color: slider.status === 'active' ? '#155724' : '#721c24'
                      }}>
                        {slider.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => editSlider(slider)}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSlider(slider.id)}
                          disabled={saving}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: saving ? '#6c757d' : '#dc3545',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: saving ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {saving ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!settings.sliders || settings.sliders.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                      No sliders added yet. Click "Add Slider" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'ads') {
      return (
        <div>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>Advertisements</h2>
              <p style={{ color: '#6c757d', margin: '0' }}>Manage advertisement banners and content</p>
            </div>
            <button
              onClick={() => setShowAdForm(true)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#007bff',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add Advertisement
            </button>
          </div>

          {showAdForm && renderAdForm()}

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Preview</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Title</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Position</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.ads?.map((ad, index) => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px' }}>
                      {ad.image ? (
                        <img src={ad.image} alt={ad.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '60px', height: '40px', backgroundColor: '#f8f9fa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📢</div>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>{ad.title}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>{ad.position}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: ad.status === 'active' ? '#d4edda' : '#f8d7da',
                        color: ad.status === 'active' ? '#155724' : '#721c24'
                      }}>
                        {ad.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => editAd(ad)}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAd(ad.id)}
                          disabled={saving}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: saving ? '#6c757d' : '#dc3545',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: saving ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {saving ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!settings.ads || settings.ads.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                      No advertisements added yet. Click "Add Advertisement" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Coming Soon</h3>
        <p style={{ color: '#6c757d' }}>This section is under development</p>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '0' }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @media (max-width: 768px) {
            .settings-grid { grid-template-columns: 1fr !important; }
            .form-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>

      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e9ecef', padding: '24px 32px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#212529', margin: '0 0 8px 0' }}>Settings</h1>
          <p style={{ color: '#6c757d', margin: '0', fontSize: '16px' }}>Manage your store configuration and preferences</p>
        </div>
      </div>

      <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0px' }}>
        <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212529', margin: '0 0 20px 0' }}>Configuration</h3>
            <nav>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : '#6c757d',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.color = '#495057';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#6c757d';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;