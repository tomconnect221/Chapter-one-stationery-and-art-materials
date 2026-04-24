import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import './authmodal.css';

/**
 * AuthModal - Professional authentication modal component
 * Handles user login, registration, and password reset
 */
const AuthModal = ({ show, onClose, initialView = 'signin' }) => {
  const { login, register, forgotPassword, loading, error, fieldErrors, success, clearError, clearSuccess } = useAuth();

  // Form state management
  const [view, setView] = useState(initialView);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer',
    firstName: '',
    lastName: '',
    password_confirmation: ''
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // Reset modal when opened or initialView changes
  useEffect(() => {
    if (show) {
      setView(initialView);
      clearError();
      clearSuccess();
      // Reset form data
      setFormData({
        email: '',
        password: '',
        role: 'customer',
        firstName: '',
        lastName: '',
        password_confirmation: ''
      });
      // Reset password visibility
      setShowPassword(false);
      setShowPasswordConfirmation(false);
    }
  }, [show, initialView]); // Removed clearError, clearSuccess from deps to prevent infinite loop

  // Don't render if modal is not shown
  if (!show) return null;

  // Theme colors
  const theme = {
    primary: '#81d4f5',
    accent: '#F5C34B',
    error: '#dc3545',
    success: '#28a745'
  };

  /**
   * Handle input field changes
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific errors when user starts typing
    if (fieldErrors && fieldErrors[name]) {
      clearError();
    }
  }, [fieldErrors, clearError]);

  /**
   * Handle view switching (signin/signup/forgot)
   */
  const switchView = useCallback((newView) => {
    setView(newView);
    clearError();
    clearSuccess();
  }, []); // Removed dependencies to prevent infinite re-renders

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      if (view === 'signin') {
        await login(formData.email, formData.password, formData.role);
      } else if (view === 'signup') {
        await register(formData);
      } else {
        // Forgot password functionality
        await forgotPassword(formData.email);
      }
    } catch (error) {
      // Error handling is managed by AuthContext
      console.error('Authentication error:', error);
    }
  }, [view, formData, login, register, forgotPassword]);

  /**
   * Handle modal close
   */
  const handleClose = useCallback(() => {
    clearError();
    clearSuccess();
    onClose();
  }, [onClose]); // Removed clearError, clearSuccess to prevent infinite loop

  return (
    <div
      className="auth-modal-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '450px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Modal Header */}
        <div
          className="auth-modal-header"
          style={{
            borderBottom: `2px solid ${theme.accent}`,
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h4
            id="auth-modal-title"
            style={{
              color: theme.primary,
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '600'
            }}
          >
            {view === 'signin' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
          </h4>
          <button
            className="auth-close"
            onClick={handleClose}
            aria-label="Close authentication modal"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="auth-modal-body" style={{ padding: '24px' }}>
          {/* Status Messages */}
          {error && (
            <div
              className="auth-message auth-message--error"
              style={{
                backgroundColor: '#f8d7da',
                color: theme.error,
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                border: `1px solid #f5c6cb`,
                fontSize: '14px'
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="auth-message auth-message--success"
              style={{
                backgroundColor: '#d4edda',
                color: theme.success,
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                border: `1px solid #c3e6cb`,
                fontSize: '14px'
              }}
              role="status"
            >
              {success}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Sign Up Form */}
            {view === 'signup' && (
              <div className="auth-form-fields">
                <div className="row gx-3">
                  <div className="col-6 mb-3">
                    <label
                      htmlFor="firstName"
                      className="form-label"
                      style={{
                        fontWeight: '500',
                        color: '#333',
                        marginBottom: '6px',
                        display: 'block'
                      }}
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                      className="form-control"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${fieldErrors.firstName ? theme.error : '#ddd'}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        transition: 'border-color 0.2s'
                      }}
                    />
                    {fieldErrors.firstName && (
                      <div
                        className="field-error"
                        style={{
                          color: theme.error,
                          fontSize: '12px',
                          marginTop: '4px'
                        }}
                      >
                        {fieldErrors.firstName[0]}
                      </div>
                    )}
                  </div>

                  <div className="col-6 mb-3">
                    <label
                      htmlFor="lastName"
                      className="form-label"
                      style={{
                        fontWeight: '500',
                        color: '#333',
                        marginBottom: '6px',
                        display: 'block'
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                      className="form-control"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${fieldErrors.lastName ? theme.error : '#ddd'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    {fieldErrors.lastName && (
                      <div
                        className="field-error"
                        style={{
                          color: theme.error,
                          fontSize: '12px',
                          marginTop: '4px'
                        }}
                      >
                        {fieldErrors.lastName[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="email"
                    className="form-label"
                    style={{
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '6px',
                      display: 'block'
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${fieldErrors.email ? theme.error : '#ddd'}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {fieldErrors.email && (
                    <div
                      className="field-error"
                      style={{
                        color: theme.error,
                        fontSize: '12px',
                        marginTop: '4px'
                      }}
                    >
                      {fieldErrors.email[0]}
                    </div>
                  )}
                </div>

                <div className="row gx-3">
                  <div className="col-xl-6 col-lg-6  col-md-6 col-sm-12 mb-3">
                    <label
                      htmlFor="password"
                      className="form-label"
                      style={{
                        fontWeight: '500',
                        color: '#333',
                        marginBottom: '6px',
                        display: 'block'
                      }}
                    >
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create password"
                        required
                        className="form-control"
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 12px',
                          border: `1px solid ${fieldErrors.password ? theme.error : '#ddd'}`,
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#666',
                          fontSize: '16px',
                          padding: '4px 8px'
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <div
                        className="field-error"
                        style={{
                          color: theme.error,
                          fontSize: '12px',
                          marginTop: '4px'
                        }}
                      >
                        {fieldErrors.password[0]}
                      </div>
                    )}
                  </div>

                  <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                    <label
                      htmlFor="password_confirmation"
                      className="form-label"
                      style={{
                        fontWeight: '500',
                        color: '#333',
                        marginBottom: '6px',
                        display: 'block'
                      }}
                    >
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showPasswordConfirmation ? 'text' : 'password'}
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        required
                        className="form-control"
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 12px',
                          border: `1px solid ${fieldErrors.password_confirmation ? theme.error : '#ddd'}`,
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#666',
                          fontSize: '16px',
                          padding: '4px 8px'
                        }}
                        aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fas ${showPasswordConfirmation ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {fieldErrors.password_confirmation && (
                      <div
                        className="field-error"
                        style={{
                          color: theme.error,
                          fontSize: '12px',
                          marginTop: '4px'
                        }}
                      >
                        {fieldErrors.password_confirmation[0]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sign In Form */}
            {view === 'signin' && (
              <div className="auth-form-fields">
                <div className="mb-3">
                  <label
                    htmlFor="login_email"
                    className="form-label"
                    style={{
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '6px',
                      display: 'block'
                    }}
                  >
                    Email or Phone Number
                  </label>
                  <input
                    id="login_email"
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email or phone"
                    required
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${fieldErrors.email ? theme.error : '#ddd'}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {fieldErrors.email && (
                    <div
                      className="field-error"
                      style={{
                        color: theme.error,
                        fontSize: '12px',
                        marginTop: '4px'
                      }}
                    >
                      {fieldErrors.email[0]}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="login_password"
                    className="form-label"
                    style={{
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '6px',
                      display: 'block'
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login_password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                      className="form-control"
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 12px',
                        border: `1px solid ${fieldErrors.password ? theme.error : '#ddd'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#666',
                        fontSize: '16px',
                        padding: '4px 8px'
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <div
                      className="field-error"
                      style={{
                        color: theme.error,
                        fontSize: '12px',
                        marginTop: '4px'
                      }}
                    >
                      {fieldErrors.password[0]}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Forgot Password Form */}
            {view === 'forgot' && (
              <div className="auth-form-fields">
                <div className="mb-3">
                  <label
                    htmlFor="forgot_email"
                    className="form-label"
                    style={{
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '6px',
                      display: 'block'
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    id="forgot_email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="form-control"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${fieldErrors.email ? theme.error : '#ddd'}`,
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  {fieldErrors.email && (
                    <div
                      className="field-error"
                      style={{
                        color: theme.error,
                        fontSize: '12px',
                        marginTop: '4px'
                      }}
                    >
                      {fieldErrors.email[0]}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="auth-actions" style={{ marginTop: '24px' }}>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
                style={{
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Please wait...
                  </>
                ) : (
                  view === 'signin' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'
                )}
              </button>

              {view !== 'signup' && (
                view === 'forgot' ? (
                  <button
                    type="button"
                    className="btn btn-link w-100 mt-3"
                    onClick={() => switchView('signin')}
                    style={{
                      color: theme.primary,
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <Link
                    to="/forgot-password"
                    className="btn btn-link w-100 mt-3"
                    onClick={() => {
                      onClose();
                      clearError();
                    }}
                    style={{
                      color: theme.primary,
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    Forgot your password?
                  </Link>
                )
              )}
            </div>
          </form>

          {/* Separator */}
          <div
            className="auth-separator"
            style={{
              margin: '24px 0',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <span
              style={{
                backgroundColor: '#fff',
                color: '#666',
                padding: '0 16px',
                fontSize: '12px',
                position: 'relative',
                zIndex: 1
              }}
            >
              OR
            </span>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: '#ddd',
                zIndex: 0
              }}
            />
          </div>

          {/* Footer */}
          <div className="auth-footer" style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '16px'
              }}
            >
              By continuing, you agree to our{' '}
              <a href="#" style={{ color: theme.primary, textDecoration: 'none' }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" style={{ color: theme.primary, textDecoration: 'none' }}>
                Privacy Policy
              </a>
            </p>

            <div className="auth-switch-buttons">
              {view !== 'signin' && (
                <button
                  className="btn btn-outline-primary me-2"
                  onClick={() => switchView('signin')}
                  style={{
                    borderColor: theme.primary,
                    color: theme.primary,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  Sign In
                </button>
              )}
              {view !== 'signup' && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => switchView('signup')}
                  style={{
                    borderColor: theme.primary,
                    color: theme.primary,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AuthModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialView: PropTypes.oneOf(['signin', 'signup', 'forgot'])
};

export default AuthModal;
