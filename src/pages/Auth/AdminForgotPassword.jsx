import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../component/Auth/AuthContext';
import './Auth.css';

const AdminForgotPassword = () => {
  const { forgotPassword, loading, error, success, clearError, clearSuccess } = useAuth();
  const [email, setEmail] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    clearError();
    clearSuccess();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    // Pass role as 'admin' to use the admin endpoint
    await forgotPassword(email, 'admin');
  };

  return (
    <div className="auth-container" style={{ background: 'white' }}>
      <div className="auth-wrapper">
        <div className="auth-card forgot-password-card">
          {/* Logo */}
          <div className="auth-logo">
            <p className="auth-subtitle">Admin Password Recovery</p>
          </div>

          {/* Success State */}
          {!success ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="step-indicator">
                <div className="step-icon">🔐</div>
                <h2 className="auth-title">Forgot Admin Password?</h2>
                <p className="auth-description">
                  No worries! Enter your admin email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="auth-alert error p-2 d-flex align-items-center mb-3">
                  <span className="alert-icon me-2">⚠️</span>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Admin Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your admin email"
                    required
                    className="form-control"
                    style={{ paddingLeft: '50px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-btn primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="auth-footer text-center mt-3">
                <Link to="/admin/login" className="back-link text-decoration-none">
                  ← Back to Admin Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="auth-form success-screen text-center">
              <div className="step-indicator">
                <div className="step-icon success mb-3 text-light" style={{ fontSize: '3rem', color: '#28a745' }}>✓</div>
                <h2 className="auth-title">Check Your Email</h2>
                <p className="auth-description">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and follow the instructions.
                </p>
              </div>

              <div className="auth-footer mt-4">
                <Link to="/admin/login" className="auth-btn primary text-decoration-none d-inline-block">
                  Back to Admin Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="auth-side-panel">
          <div className="panel-content">
            <div className="panel-icon">🔐</div>
            <h2>Secure Admin Password Reset</h2>
            <p style={{color:'white'}}>
              We take admin security seriously. Follow the steps to safely reset your admin password.
            </p>
            <div className="panel-features">
             
             
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
