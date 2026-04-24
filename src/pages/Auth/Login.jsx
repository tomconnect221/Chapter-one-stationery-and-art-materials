import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../component/Auth/AuthContext';
import './Auth.css';

const Login = () => {
  const { openAuth, login, loading, error, success, clearError, clearSuccess } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // If user is already authenticated, redirect to home
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
    clearSuccess();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    clearSuccess();

    if (!formData.email || !formData.password) {
      return;
    }

    await login(formData.email, formData.password, 'customer');
  };

  return (
    <div className="auth-container bg-light mt-5" style={{background:'white'}}>
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Logo */}
        
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-description">
              Enter your credentials to access your account
            </p>

            {error && (
              <div className="auth-alert error p-1 d-flex justify-content-start align-items-center">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="auth-alert success">
                <span className="alert-icon">✅</span>
                {success}
              </div>
            )}

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
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
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
                  <span className="spinner m-0 p-0" style={{ width: '20px', height:'20px' }}></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
            <p className="back-link">
              <Link to="/">← Back to Store</Link>
            </p>
          </div>
        </div>

        {/* Side Panel */}
        <div className="auth-side-panel">
          <div className="panel-content">
            <div className="panel-icon">🛒</div>
            <h2>Welcome Back!</h2>
            <p className='text-light'>
              Continue your shopping experience with personalized recommendations and fast checkout.
            </p>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
