import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const AdminForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password, 4: success
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    // Calculate password strength
    if (name === 'newPassword') {
      calculatePasswordStrength(value);
    }
  };

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

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // In real app, send reset code to email
      console.log('Sending reset code to:', formData.email);
      setStep(2);
      setLoading(false);
    }, 1500);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.code) {
      setError('Please enter the verification code');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // In real app, verify code with backend
      if (formData.code === '123456') {
        setStep(3);
      } else {
        setError('Invalid verification code. Try 123456 for demo.');
      }
      setLoading(false);
    }, 1000);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // In real app, update password in backend
      console.log('Password reset successful');
      setStep(4);
      setLoading(false);
    }, 1500);
  };

  const handleResendCode = () => {
    setLoading(true);
    setTimeout(() => {
      console.log('Resending code to:', formData.email);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card forgot-password-card">
          {/* Logo */}
          <div className="auth-logo">
            <p className="auth-subtitle">Admin Password Recovery</p>
          </div>

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="auth-form">
              <div className="step-indicator">
                <div className="step-icon">🔐</div>
                <h2 className="auth-title">Forgot Admin Password?</h2>
                <p className="auth-description">
                  No worries! Enter your admin email address and we'll send you a code to reset your password.
                </p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <span className="alert-icon">⚠️</span>
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
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your admin email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-btn primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending Code...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>

              <div className="auth-footer">
                <Link to="/admin/login" className="back-link">
                  ← Back to Admin Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="auth-form">
              <div className="step-indicator">
                <div className="step-icon">📬</div>
                <h2 className="auth-title">Check Your Email</h2>
                <p className="auth-description">
                  We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                </p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <span className="alert-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="auth-alert info">
                <span className="alert-icon">ℹ️</span>
                For demo purposes, use code: <strong>123456</strong>
              </div>

              <div className="form-group">
                <label htmlFor="code">Verification Code</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔢</span>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-btn primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="resend-section">
                <p>Didn't receive the code?</p>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  Resend Code
                </button>
              </div>

              <div className="auth-footer">
                <button
                  type="button"
                  className="back-link"
                  onClick={() => setStep(1)}
                >
                  ← Change Email
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="step-indicator">
                <div className="step-icon">🔑</div>
                <h2 className="auth-title">Create New Admin Password</h2>
                <p className="auth-description">
                  Your new password must be different from previously used passwords.
                </p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <span className="alert-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
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
                {formData.newPassword && (
                  <>
                    <div className="password-strength-bar">
                      <div className={`strength-fill ${passwordStrength}`}></div>
                    </div>
                    <div className="password-strength-text">
                      Password strength: <strong>{passwordStrength || 'Too weak'}</strong>
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                    One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                    One lowercase letter
                  </li>
                  <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
                    One number
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                className="auth-btn primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="auth-form success-screen">
              <div className="step-indicator">
                <div className="step-icon success">✓</div>
                <h2 className="auth-title">Password Reset Successful!</h2>
                <p className="auth-description">
                  Your admin password has been successfully reset. You can now login with your new password.
                </p>
              </div>

              <Link to="/admin/login" className="auth-btn primary">
                Go to Admin Login
              </Link>

              <div className="auth-footer">
                <Link to="/" className="back-link">
                  ← Back to Store
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
            <p>
              We take admin security seriously. Follow the steps to safely reset your admin password.
            </p>
            <div className="panel-features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Email Verification</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Secure Code Generation</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Password Strength Check</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Instant Access Restoration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;