import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../component/Auth/AuthContext';
import siteLogo from '/assets/image/dark_logo.png';
import './Auth.css';

const ResetPassword = () => {
    const { resetPassword, loading, error, success, clearError, clearSuccess } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationError, setValidationError] = useState('');
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';
    const role = searchParams.get('role') || '';
    const isStaffReset = ['admin', 'subadmin', 'rider'].includes(role);
    const loginPath = isStaffReset ? '/admin/login' : '/login';
    const roleLabel = role === 'subadmin' ? 'Sub Admin' : role === 'rider' ? 'Rider' : 'Admin';

    useEffect(() => {
        clearError();
        clearSuccess();
    }, [clearError, clearSuccess]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setValidationError('');
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        clearSuccess();
        setValidationError('');

        if (formData.password.length < 8) {
            setValidationError('Your password must be at least 8 characters long.');
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setValidationError('The passwords do not match.');
            return;
        }

        const result = await resetPassword({
            token,
            email,
            role,
            password: formData.password,
            password_confirmation: formData.password_confirmation
        });

        if (result.success) {
            setTimeout(() => {
                navigate(loginPath);
            }, 3000);
        }
    };

    return (
        <div className={`auth-container ${isStaffReset ? 'admin-auth-container' : 'bg-light'}`}>
            <div className={`auth-wrapper ${isStaffReset ? 'admin-auth-wrapper' : ''}`}>
                <div className={`auth-card ${isStaffReset ? 'admin-auth-card' : ''}`}>
                    {isStaffReset && (
                        <div className="auth-logo">
                            <Link to="/" className="admin-auth-logo-link" aria-label="Go to homepage">
                                <img src={siteLogo} alt="Chapter One Stationery and Art Materials" />
                            </Link>
                        </div>
                    )}
                    {/* Reset Password Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <h2 className="auth-title">Reset {isStaffReset ? `${roleLabel} ` : ''}Password</h2>
                        <p className="auth-description">
                            Create a new password for your account
                        </p>

                        {error && (
                            <div className="auth-alert error p-1 d-flex justify-content-start align-items-center" role="alert">
                                <span className="alert-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        {validationError && (
                            <div className="auth-alert error p-1 d-flex justify-content-start align-items-center" role="alert">
                                <span className="alert-icon">⚠️</span>
                                {validationError}
                            </div>
                        )}

                        {success && (
                            <div className="auth-alert success">
                                <span className="alert-icon">✅</span>
                                {success}
                            </div>
                        )}

                        {!token || !email || !role ? (
                            <div className="auth-alert error p-1 d-flex justify-content-start align-items-center">
                                <span className="alert-icon">⚠️</span>
                                Invalid or missing reset token. Please check the link from your email.
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label htmlFor="password">New Password</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            style={{ paddingLeft: '50px' }}
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
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
                                            placeholder="Confirm new password"
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
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

                                <button
                                    type="submit"
                                    className="auth-btn primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner m-0 p-0" style={{ width: '20px', height: '20px' }}></span>
                                            Resetting...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </>
                        )}

                    </form>

                    {/* Footer */}
                    <div className="auth-footer">
                        <p className="back-link">
                            <Link to={loginPath}>← Back to {isStaffReset ? 'Staff' : 'Customer'} Login</Link>
                        </p>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="auth-side-panel">
                    <div className="panel-content">
                        <div className="panel-icon">🔐</div>
                        <h2>Secure Account</h2>
                        <p className='text-light'>
                            Protect your account with a strong password.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
