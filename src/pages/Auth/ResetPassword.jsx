import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../component/Auth/AuthContext';
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
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');
        
        if (tokenParam) setToken(tokenParam);
        if (emailParam) setEmail(emailParam);

        // Clear any previous errors/success messages
        clearError();
        clearSuccess();
    }, [searchParams, clearError, clearSuccess]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        clearSuccess();

        if (!formData.password || !formData.password_confirmation) {
            // Maybe set a local error/toast if fields are empty, but required attr handles basics
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            // You could dispatch an error or show a toast here
            // For now, depending on validation from backend, or we can check here.
            // Let's rely on backend or add simple check.
            // It's better to show error immediately if passwords don't match.
        }

        const result = await resetPassword({
            token,
            email,
            password: formData.password,
            password_confirmation: formData.password_confirmation
        });

        if (result.success) {
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    };

    return (
        <div className="auth-container bg-light" style={{ background: 'white' }}>
            <div className="auth-wrapper">
                <div className="auth-card">
                    {/* Reset Password Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <h2 className="auth-title">Reset Password</h2>
                        <p className="auth-description">
                            Create a new password for your account
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

                        {!token || !email ? (
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
                            <Link to="/login">← Back to Login</Link>
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
