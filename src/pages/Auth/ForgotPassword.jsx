import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../component/Auth/AuthContext';
import './Auth.css';

const ForgotPassword = () => {
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

    await forgotPassword(email);
  };

  return (
    <div className="auth-container bg-light" style={{ background: 'white' }}>
      <div className="auth-wrapper">
        <div className="auth-card forgot-password-card">
          {/* Logo - Assuming reused from Login but keeping it simple for now */}

          {!success ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="step-indicator">
                <div className="step-icon">🔐</div>
                <h2 className="auth-title">Forgot Password?</h2>
                <p className="auth-description">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="auth-alert error p-2 d-flex align-items-center mb-3">
                  <span className="alert-icon me-2">⚠️</span>
                  {error}
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
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="form-control"
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
                <Link to="/login" className="back-link text-decoration-none">
                  ← Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="auth-form success-screen text-center">
              <div className="step-indicator">
                <div className="step-icon success mb-3" style={{ fontSize: '3rem', color: '#28a745' }}>✓</div>
                <h2 className="auth-title">Check Your Email</h2>
                <p className="auth-description">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and follow the instructions.
                </p>
              </div>

              <div className="auth-footer mt-4">
                <Link to="/login" className="auth-btn primary text-decoration-none d-inline-block">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel matching Login style */}
        <div className="auth-side-panel">
          <div className="panel-content">
            <div className="panel-icon">🔐</div>
            <h2>Secure Account Recovery</h2>
            <p className="text-light">
              We'll help you get back into your account safely and quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;