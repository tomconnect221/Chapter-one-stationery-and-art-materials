import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { updateProfileSuccess, changePasswordSuccess } from '../../store/authSlice'; 

const useInjectStyles = () => {
  useEffect(() => {
    const id = 'profile-settings-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `
      :root{
        --ps-bg:#f8f9fa;
        --ps-card:#ffffff;
        --ps-muted:#6c757d;
        --ps-text:#212529;
        --ps-brand:#f68b1e;
        --ps-brand-600:#e27d18;
        --ps-brand-700:#cc6f15;
        --ps-border:#dee2e6;
        --ps-hover:#f1f3f5;
        --ps-success:#22c55e;
        --ps-danger:#ef4444;
        --ps-warning:#fbbf24;
      }
      .ps-wrap{color:var(--ps-text);background:var(--ps-bg);min-height:100vh;}
      .ps-container{padding:20px;max-width:1200px;margin:0 auto;}
      @media(min-width:992px){.ps-container{padding:28px;}}

      /* Header */
      .ps-header{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;margin-bottom:24px;}
      .ps-title{display:flex;gap:12px;align-items:center;}
      .ps-title h1{font-size:24px;margin:0;font-weight:700;}
      .ps-sub{color:var(--ps-muted);font-size:14px;margin-top:4px;}
      .ps-actions{display:flex;gap:10px;flex-wrap:wrap;}

      /* Buttons */
      .ps-btn{border:1px solid var(--ps-border);background:var(--ps-card);color:var(--ps-text);padding:10px 16px;border-radius:10px;cursor:pointer;transition:.2s;font-size:14px;font-weight:500;display:inline-flex;align-items:center;gap:8px;}
      .ps-btn:hover{background:var(--ps-hover);border-color:#adb5bd;transform:translateY(-1px);box-shadow:0 2px 4px rgba(0,0,0,0.05);}
      .ps-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
      .ps-btn.brand{background:var(--ps-brand);border-color:var(--ps-brand);color:#fff;font-weight:600;}
      .ps-btn.brand:hover{background:var(--ps-brand-600);box-shadow:0 2px 8px rgba(246,139,30,0.3);}
      .ps-btn.danger{background:var(--ps-danger);border-color:var(--ps-danger);color:#fff;}
      .ps-btn.danger:hover{background:#dc2626;}
      .ps-btn.success{background:var(--ps-success);border-color:var(--ps-success);color:#fff;}
      .ps-btn.success:hover{background:#16a34a;}

      /* Grid Layout */
      .ps-grid{display:grid;gap:20px;grid-template-columns:1fr;}
      @media(min-width:992px){.ps-grid{grid-template-columns:350px 1fr;}}

      /* Cards */
      .ps-card{background:var(--ps-card);border:1px solid var(--ps-border);border-radius:14px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.05);}
      .ps-card h3{margin:0 0 8px 0;font-size:18px;font-weight:600;}
      .ps-card p{margin:0 0 16px 0;color:var(--ps-muted);font-size:14px;line-height:1.5;}
      .ps-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--ps-border);}

      /* Profile Picture Section */
      .ps-avatar-section{display:flex;flex-direction:column;align-items:center;gap:16px;}
      .ps-avatar-wrapper{position:relative;width:150px;height:150px;}
      .ps-avatar{width:150px;height:150px;border-radius:50%;object-fit:cover;border:4px solid var(--ps-border);box-shadow:0 4px 12px rgba(0,0,0,0.1);}
      .ps-avatar-badge{position:absolute;bottom:8px;right:8px;width:36px;height:36px;background:var(--ps-brand);border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.2s;box-shadow:0 2px 8px rgba(0,0,0,0.15);}
      .ps-avatar-badge:hover{background:var(--ps-brand-600);transform:scale(1.1);}
      .ps-avatar-badge input{display:none;}
      .ps-avatar-info{text-align:center;}
      .ps-avatar-name{font-size:20px;font-weight:700;margin-bottom:4px;}
      .ps-avatar-role{color:var(--ps-muted);font-size:14px;margin-bottom:8px;}
      .ps-avatar-email{color:var(--ps-muted);font-size:13px;}

      /* Form Fields */
      .ps-form{display:grid;gap:20px;}
      .ps-row{display:grid;grid-template-columns:1fr;gap:16px;}
      @media(min-width:768px){.ps-row{grid-template-columns:1fr 1fr;}}
      .ps-row.full{grid-template-columns:1fr;}
      .ps-field{display:grid;gap:8px;}
      .ps-field label{font-size:13px;color:var(--ps-text);font-weight:500;display:flex;align-items:center;gap:6px;}
      .ps-field label .required{color:var(--ps-danger);}
      .ps-input, .ps-select, .ps-textarea{background:#fff;border:1px solid var(--ps-border);color:var(--ps-text);padding:10px 12px;border-radius:8px;font-size:14px;transition:.2s;width:100%;font-family:inherit;}
      .ps-input:focus, .ps-select:focus, .ps-textarea:focus{outline:none;border-color:var(--ps-brand);box-shadow:0 0 0 3px rgba(246,139,30,0.1);}
      .ps-input:hover, .ps-select:hover, .ps-textarea:hover{border-color:#adb5bd;}
      .ps-input:disabled, .ps-select:disabled, .ps-textarea:disabled{background:#e9ecef;cursor:not-allowed;}
      .ps-textarea{resize:vertical;min-height:100px;}

      /* Password Strength */
      .ps-password-wrapper{position:relative;}
      .ps-password-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--ps-muted);cursor:pointer;font-size:18px;padding:4px;}
      .ps-password-toggle:hover{color:var(--ps-text);}
      .ps-strength-bar{height:4px;background:#e9ecef;border-radius:2px;margin-top:8px;overflow:hidden;}
      .ps-strength-fill{height:100%;transition:.3s;border-radius:2px;}
      .ps-strength-fill.weak{width:33%;background:var(--ps-danger);}
      .ps-strength-fill.medium{width:66%;background:var(--ps-warning);}
      .ps-strength-fill.strong{width:100%;background:var(--ps-success);}
      .ps-strength-text{font-size:12px;color:var(--ps-muted);margin-top:4px;}

      /* Alert Messages */
      .ps-alert{padding:12px 16px;border-radius:8px;font-size:14px;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
      .ps-alert.success{background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;}
      .ps-alert.error{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;}
      .ps-alert.warning{background:#fef3c7;color:#92400e;border:1px solid #fcd34d;}
      .ps-alert.info{background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;}

      /* Stats */
      .ps-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px;}
      .ps-stat{text-align:center;padding:12px;background:var(--ps-hover);border-radius:8px;}
      .ps-stat-value{font-size:20px;font-weight:700;color:var(--ps-brand);}
      .ps-stat-label{font-size:12px;color:var(--ps-muted);margin-top:4px;}

      /* Footer Actions */
      .ps-footer{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;padding-top:20px;border-top:1px solid var(--ps-border);flex-wrap:wrap;}

      /* Badge */
      .ps-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:500;}
      .ps-badge.verified{background:#d1fae5;color:#065f46;}
      .ps-badge.pending{background:#fef3c7;color:#92400e;}

      /* Loading State */
      .ps-loading{opacity:0.6;pointer-events:none;position:relative;}
      .ps-loading::after{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.7);z-index:1;}

      /* Responsive */
      @media(max-width:768px){
        .ps-row{grid-template-columns:1fr;}
        .ps-footer{justify-content:stretch;}
        .ps-footer .ps-btn{flex:1;}
      }
    `;
    document.head.appendChild(style);
  }, []);
};

const ProfileSettings = ({ userType = 'admin' }) => {
  useInjectStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // Get user data from Redux store
  const { user, token } = useSelector((state) => state.auth);

  // User profile state - will be populated from API
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    bio: '',
    profilePicture: null,
    role: '',
    isActive: true,
    name: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Fetch profile data from API
  const fetchProfileData = async () => {
    try {
      setFetchLoading(true);
      const endpoint = userType === 'admin'
        ? `${import.meta.env.VITE_API_URL}/api/admin/profile`
        : `${import.meta.env.VITE_API_URL}/api/subadmin/profile`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const profileData = data.data;
        setProfile({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          postalCode: profileData.postal_code || '',
          bio: profileData.bio || '',
          profilePicture: profileData.profile_picture,
          role: profileData.role || '',
          isActive: profileData.is_active || true,
          name: profileData.name || ''
        });

        if (profileData.profile_picture) {
          setAvatarPreview(profileData.profile_picture);
        }
        
        // toast.success('Profile data loaded successfully!');
      } else {
        toast.error(data.message || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error fetching profile data');
    } finally {
      setFetchLoading(false);
    }
  };

  // Update profile via API and Redux
  const updateProfile = async (profileData) => {
    try {
      const formData = new URLSearchParams();
      formData.append('first_name', profileData.firstName);
      formData.append('last_name', profileData.lastName);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      formData.append('address', profileData.address);
      formData.append('city', profileData.city);
      formData.append('state', profileData.state);
      formData.append('bio', profileData.bio);
      formData.append('postal_code', profileData.postalCode);

      const endpoint = userType === 'admin'
        ? `${import.meta.env.VITE_API_URL}/api/admin/profile`
        : `${import.meta.env.VITE_API_URL}/api/subadmin/profile`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Update local state with the response data
        const updatedProfile = data.data;
        const newProfileState = {
          firstName: updatedProfile.first_name || '',
          lastName: updatedProfile.last_name || '',
          email: updatedProfile.email || '',
          phone: updatedProfile.phone || '',
          address: updatedProfile.address || '',
          city: updatedProfile.city || '',
          state: updatedProfile.state || '',
          postalCode: updatedProfile.postal_code || '',
          bio: updatedProfile.bio || '',
          profilePicture: updatedProfile.profile_picture,
          role: updatedProfile.role || '',
          isActive: updatedProfile.is_active || true,
          name: updatedProfile.name || ''
        };
        
        setProfile(newProfileState);

        // Update Redux store with the new user data
        dispatch(updateProfileSuccess({
          user: {
            ...user,
            first_name: updatedProfile.first_name,
            last_name: updatedProfile.last_name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
            address: updatedProfile.address,
            city: updatedProfile.city,
            state: updatedProfile.state,
            postal_code: updatedProfile.postal_code,
            bio: updatedProfile.bio,
            profile_picture: updatedProfile.profile_picture,
            name: updatedProfile.name || `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim()
          },
          message: data.message || 'Profile updated successfully!'
        }));
        
        return { success: true, message: data.message || 'Profile updated successfully!' };
      } else {
        return { 
          success: false, 
          message: data.message || 'Failed to update profile',
          fieldErrors: data.errors || {}
        };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Failed to update profile. Please try again.' };
    }
  };

  // Change password via API and update Redux state
  const changePassword = async (passwordData) => {
    try {
      const formData = new URLSearchParams();
      formData.append('current_password', passwordData.currentPassword);
      formData.append('password', passwordData.newPassword);
      formData.append('password_confirmation', passwordData.confirmPassword);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/password/change`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Update Redux store with success message
        dispatch(changePasswordSuccess({
          message: data.message || 'Password changed successfully!'
        }));
        
        return { success: true, message: data.message || 'Password changed successfully!' };
      } else {
        return { 
          success: false, 
          message: data.message || 'Failed to change password',
          fieldErrors: data.errors || {}
        };
      }
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, message: 'Failed to change password. Please try again.' };
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token]);

  // Handle profile field changes
  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Handle password field changes
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Calculate password strength for new password
    if (field === 'newPassword') {
      calculatePasswordStrength(value);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        toast.success('Profile picture updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(profile);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
        
        // Show field errors if any
        if (result.fieldErrors) {
          Object.values(result.fieldErrors).forEach(errorMessage => {
            toast.error(errorMessage);
          });
        }
      }
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordData);
      
      if (result.success) {
        toast.success(result.message);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStrength('');
      } else {
        toast.error(result.message);
        
        // Show field errors if any
        if (result.fieldErrors) {
          Object.values(result.fieldErrors).forEach(errorMessage => {
            toast.error(errorMessage);
          });
        }
      }
    } catch (error) {
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (profile.profilePicture) return profile.profilePicture;
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiByeD0iNzUiIGZpbGw9IiNGNjhCMUUiLz4KPHBhdGggZD0iTTc1IDc1QzgzLjI4NDMgNzUgOTAgNjguMjg0MyA5MCA2MEM5MCA1MS43MTU3IDgzLjI4NDMgNDUgNzUgNDVDNjYuNzE1NyA0NSA2MCA1MS43MTU3IDYwIDYwQzYwIDY4LjI4NDMgNjYuNzE1NyA3NSA3NSA3NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik03NSA4NUMxMDEuNTEgODUgMTIzIDk2LjQ5MDQgMTIzIDExMEMxMjMgMTEwIDEyMyAxMjAgNzUgMTIwQzI3IDEyMCAyNyAxMTAgMjcgMTEwQzI3IDk2LjQ5MDQgNDguNDkwMyA4NSA3NSA4NVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
  };

  const getDisplayName = () => {
    if (profile.firstName || profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`.trim();
    }
    return profile.name || user?.name || 'User';
  };

  if (fetchLoading) {
    return (
      <div className="ps-wrap">
        <div className="ps-container">
          <div className="ps-header">
            <div className="ps-title">
              <h1>Profile Settings</h1>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading profile data...
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="ps-wrap">
      <div className="ps-container">
        {/* Header */}
        <div className="ps-header">
          <div className="ps-title">
            <div>
              <h1>Profile Settings</h1>
              <div className="ps-sub">Manage your account information and preferences</div>
            </div>
          </div>
          <div className="ps-actions">
            <button className="ps-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="ps-gri">
          {/* Right Column - Forms */}
          <div className={loading ? 'ps-loading' : ''}>
            {/* Personal Information */}
            <div className="ps-card w-100">
              <div className="ps-card-header">
                <h3>Personal Information</h3>
              </div>

              <div className="ps-form">
                <div className="ps-row">
                  <div className="ps-field">
                    <label>First Name</label>
                    <input 
                      type="text"
                      className="ps-input"
                      value={profile.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="ps-field">
                    <label>Last Name</label>
                    <input 
                      type="text"
                      className="ps-input"
                      value={profile.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="ps-row">
                  <div className="ps-field">
                    <label>Email Address</label>
                    <input 
                      type="email"
                      className="ps-input"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="ps-field">
                    <label>Phone Number</label>
                    <input 
                      type="tel"
                      className="ps-input"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="ps-row full">
                  <div className="ps-field">
                    <label>Address</label>
                    <input 
                      type="text"
                      className="ps-input"
                      value={profile.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>
                </div>

                <div className="ps-row">
                  <div className="ps-field">
                    <label>City</label>
                    <input 
                      type="text"
                      className="ps-input"
                      value={profile.city}
                      onChange={(e) => handleProfileChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="ps-field">
                    <label>State</label>
                    <input 
                      type="text"
                      className="ps-input"
                      value={profile.state}
                      onChange={(e) => handleProfileChange('state', e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="ps-row">
                  <div className="ps-field">
                    <label>Postal Code</label>
                    <input 
                      type="text"
                      className="ps-input"
                      value={profile.postalCode}
                      onChange={(e) => handleProfileChange('postalCode', e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div className="ps-row full">
                  <div className="ps-field">
                    <label>Bio</label>
                    <textarea 
                      className="ps-textarea"
                      value={profile.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="ps-footer">
                  <button 
                    className="ps-btn brand"
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="ps-card" style={{marginTop: '20px'}}>
              <div className="ps-card-header">
                <h3>Change Password</h3>
              </div>

              <div className="ps-form">
                <div className="ps-row full">
                  <div className="ps-field">
                    <label>Current Password</label>
                    <div className="ps-password-wrapper">
                      <input 
                        type={showPasswords.current ? 'text' : 'password'}
                        className="ps-input"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button 
                        type="button"
                        className="ps-password-toggle"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="ps-row full">
                  <div className="ps-field">
                    <label>New Password</label>
                    <div className="ps-password-wrapper">
                      <input 
                        type={showPasswords.new ? 'text' : 'password'}
                        className="ps-input"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="Enter new password"
                      />
                      <button 
                        type="button"
                        className="ps-password-toggle"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {passwordData.newPassword && (
                      <>
                        <div className="ps-strength-bar">
                          <div className={`ps-strength-fill ${passwordStrength}`}></div>
                        </div>
                        <div className="ps-strength-text">
                          Password strength: {passwordStrength || 'Too weak'}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="ps-row full">
                  <div className="ps-field">
                    <label>Confirm New Password</label>
                    <div className="ps-password-wrapper">
                      <input 
                        type={showPasswords.confirm ? 'text' : 'password'}
                        className="ps-input"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <button 
                        type="button"
                        className="ps-password-toggle"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="ps-footer">
                  <button 
                    className="ps-btn brand"
                    onClick={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
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
    </div>
  );
};

export default ProfileSettings;