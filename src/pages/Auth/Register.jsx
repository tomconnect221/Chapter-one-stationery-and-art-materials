import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../component/Auth/AuthContext';
import './Auth.css';

const Register = () => {
  const { register, loading, error, success, clearError, clearSuccess } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.password_confirmation) {
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      return;
    }

    await register(formData);
  };

  return (
    <div className="auth-container ">
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Logo */}


          {/* Register Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-description">
              Join thousands of satisfied customers shopping with us
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

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      style={{ paddingLeft: '50px' }}
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      style={{ paddingLeft: '50px' }}
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      required
                    />
                  </div>
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
                  placeholder="Create a password"
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

            <div className="form-group">
              <label htmlFor="password_confirmation">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  style={{ paddingLeft: '50px' }}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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

            {/* <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>I agree to the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link></span>
              </label>
            </div> */}

            <button
              type="submit"
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner p-0 m-0" style={{ width: '20px', height:'20px' }}></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
            <p className="back-link">
              <Link to="/">← Back to Store</Link>
            </p>
          </div>
        </div>

        {/* Side Panel */}
        <div className="auth-side-panel">
          <div className="panel-content">
            <div className="panel-icon">🎉</div>
            <h2>Join  Today!</h2>
            <p className='text-light'>
              Get access to exclusive deals, fast shipping, and personalized shopping experience.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
