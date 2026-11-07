import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../component/Auth/AuthContext';
import siteLogo from '/assets/image/dark_logo.png';
import './Auth.css';

const staffRoles = [
  { value: 'admin', label: 'Super Admin', icon: '👨‍💼' },
  { value: 'subadmin', label: 'Sub Admin', icon: '👤' },
  { value: 'rider', label: 'Rider', icon: '🚚' },
];

const AdminForgotPassword = () => {
  const { forgotPassword, loading, error, success, clearError, clearSuccess } = useAuth();
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('admin');
  const selectedRole = staffRoles.find(({ value }) => value === userType);

  const handleChange = (e) => {
    setEmail(e.target.value);
    clearError();
    clearSuccess();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    await forgotPassword(email.trim(), userType);
  };

  return (
    <div className="auth-container admin-auth-container">
      <div className="auth-wrapper admin-auth-wrapper">
        <div className="auth-card admin-auth-card forgot-password-card">
          <div className="auth-logo">
            <Link to="/" className="admin-auth-logo-link" aria-label="Go to homepage">
              <img src={siteLogo} alt="Chapter One Stationery and Art Materials" />
            </Link>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="step-indicator">
                <div className="step-icon">🔐</div>
                <h2 className="auth-title">Reset your password</h2>
                <p className="auth-description">
                  Choose your staff account type and enter the email address associated with it.
                </p>
              </div>

              <div className="user-type-selector" aria-label="Staff account type">
                {staffRoles.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`type-btn ${userType === value ? 'active' : ''}`}
                    onClick={() => {
                      setUserType(value);
                      clearError();
                      clearSuccess();
                    }}
                    aria-pressed={userType === value}
                  >
                    <span className="type-icon d-block w-100">{icon}</span>
                    <span className="type-label">{label}</span>
                  </button>
                ))}
              </div>

              {error && (
                <div className="auth-alert error admin-login-feedback" role="alert">
                  <span className="alert-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">{selectedRole.label} Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder={`Enter your ${selectedRole.label.toLowerCase()} email`}
                    required
                    autoComplete="email"
                    style={{ paddingLeft: '50px' }}
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn primary w-100" disabled={loading}>
                {loading ? (
                  <>
                    <span  style={{width:'14px',height:'14px',padding:'0px', margin:'0px'}} className="spinner" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="auth-footer">
                <Link to="/admin/login" className="back-link">
                  ← Back to Staff Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="auth-form success-screen text-center" role="status">
              <div className="step-indicator">
                <div className="step-icon success admin-reset-success-icon">✓</div>
                <h2 className="auth-title">Check Your Email</h2>
                <p className="auth-description">
                  If an account matches <strong>{email}</strong> for {selectedRole.label}, a reset link
                  will arrive shortly. Please check your inbox.
                </p>
              </div>
              <div className="auth-footer">
                <Link to="/admin/login" className="auth-btn primary text-decoration-none d-inline-block">
                  Back to Staff Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="auth-side-panel">
          <div className="panel-content">
            <div className="panel-icon">🔐</div>
            <h2>Secure Account Recovery</h2>
            <p className="text-light">
              Reset access safely for Super Admin, Sub Admin, or Rider accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
