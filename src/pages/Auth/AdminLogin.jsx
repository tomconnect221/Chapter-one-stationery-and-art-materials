import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import apiClient from '../../apiClient';
import siteLogo from '/assets/image/dark_logo.png';
import './Auth.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'admin', // admin, subadmin, rider
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    dispatch(loginStart());

    try {
      const response = await apiClient.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
        role: formData.userType
      });

      if (response.data.success) {
        // Ensure role is set in user data, using the role from login form as fallback
        const userData = {
          ...response.data.data.user,
          role: response.data.data.user.role || formData.userType // Use API response role, fallback to form selection
        };

        dispatch(loginSuccess({
          user: userData,
          token: response.data.data.token,
          message: response.data.message
        }));

        setSuccess(response.data.message);

        // Redirect based on role (use the ensured role)
        const userRole = userData.role;
        if (userRole === 'admin' || userRole === 'subadmin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'rider' || userRole === 'dispatch') {
          navigate('/dispatch/dashboard');
        } else {
          navigate('/admin/dashboard'); // fallback
        }
      } else {
        dispatch(loginFailure(response.data.message || 'Login failed'));
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Network error. Please check your connection.';
      dispatch(loginFailure(errorMessage));
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container admin-auth-container">
      <div className="auth-wrapper admin-auth-wrapper">
        <div className="auth-card admin-auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <Link to="/" className="admin-auth-logo-link" aria-label="Go to homepage">
              <img src={siteLogo} alt="Chapter One Stationery and Art Materials" />
            </Link>
          </div>



          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-description">
              Enter your credentials to access your account
            </p>
            {/* User Type Selector */}
            <div className="user-type-selector">
              <button
                type="button"
                className={`type-btn ${formData.userType === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'admin' })}
              >
                <span className="type-icon d-block w-100" >👨‍💼</span>
                <span className="type-label d-block">Super Admin</span>
              </button>
              <button
                type="button"
                className={`type-btn ${formData.userType === 'subadmin' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'subadmin' })}
              >
                <span className="type-icon d-block w-100">👤</span>
                <span className="type-label">Sub Admin</span>
              </button>
              <button
                type="button"
                className={`type-btn ${formData.userType === 'rider' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, userType: 'rider' })}
              >
                <span className="type-icon d-block w-100">🚚</span>
                <span className="type-label">Rider</span>
              </button>
            </div>
            {error && (
              <div className="auth-alert error p-1 d-flex align-items-center">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="auth-alert success p-1 d-flex align-items-center">
                <span className="alert-icon">✅</span>
                {success}
              </div>
            )}

            {/* Login Info */}
            <div className="auth-alert info admin-login-info">
              <span className="alert-icon">ℹ️</span>
              <div>
                <strong><span className='text-capitalize'>{formData.userType}</span> Login:</strong>
                <div className="admin-login-info-detail">
                  Use your <span className='text-capitalize'>{formData.userType}</span> credentials to access the dashboard
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  style={{ paddingLeft: '50px' }}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  style={{ paddingLeft: '50px' }}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="/admin/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? (
                <>
                <span style={{width:'14px',height:'14px',padding:'0px', margin:'0px'}} className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            {/* <p>
              Need help? <Link to="/contact">Contact Support</Link>
            </p> */}
            <p className="back-link">
              <Link to="/">← Back to Store</Link>
            </p>
          </div>
        </div>

        {/* Side Panel */}
        <div className="auth-side-panel">
          <div className="panel-content">
            <div className="panel-icon">🎯</div>
            <h2>Welcome Back!</h2>
            <p className='text-light'>
              Access your dashboard to manage products, orders, and deliveries efficiently.
            </p>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;