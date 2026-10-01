import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../component/Auth/AuthContext';
import './PaymentConfirmation.css';

const formatNumber = (number) => {
    const n = parseFloat(String(number).replace(/[^0-9.]/g, '')) || 0;
    return n.toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export default function PaymentConfirmation() {
    const navigate = useNavigate();
    const { token } = useSelector(state => state.auth);
    const { isAuthenticated } = useAuth();
    const [verificationStatus, setVerificationStatus] = useState('pending');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeStep, setActiveStep] = useState(2);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated, token, navigate]);

    useEffect(() => {
        const verifyPayment = async () => {
            // Don't proceed if not authenticated
            if (!isAuthenticated || !token) {
                return;
            }

            const reference = localStorage.getItem('payment_reference');

            if (!reference || !token) {
                setVerificationStatus('failed');
                setLoading(false);
                toast.error('Payment reference or authentication token missing');
                return;
            }

            try {
                setLoading(true);

                const formData = new URLSearchParams();
                formData.append('reference', reference);

                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/customer/verify-payment`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );

                if (response.data.success) {
                    setVerificationStatus('success');
                    setOrderData(response.data.data);
                    localStorage.removeItem('payment_reference');
                    setActiveStep(3);
                    toast.success('Payment verified successfully!');
                } else {
                    setVerificationStatus('failed');
                    setActiveStep(2);
                    toast.error(response.data.message || 'Payment verification failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setVerificationStatus('failed');
                setActiveStep(2);
                toast.error(error.response?.data?.message || 'Payment verification failed');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [token, isAuthenticated]);

    // Show nothing if not authenticated (will redirect)
    if (!isAuthenticated || !token) {
        return null;
    }

    const handleContinueShopping = () => {
        navigate('/products');
    };

    const handleViewOrder = () => {
        if (orderData) {
            navigate(`/account/orders/${orderData.id}`);
        }
    };

    const handleRetryPayment = () => {
        localStorage.removeItem('payment_reference');
        navigate('/checkout');
    };

    const getStepClass = (stepNumber) => {
        if (stepNumber === 1) return 'completed';
        if (stepNumber === 2) {
            if (verificationStatus === 'success') return 'completed';
            if (verificationStatus === 'failed') return 'error';
            return activeStep >= 2 ? 'active' : '';
        }
        if (stepNumber === 3) {
            return activeStep >= 3 ? 'active' : '';
        }
        return '';
    };

    return (
        <section className="payment-confirmation">
            <div className="container">
                {/* Progress Steps */}
                <div className="checkout-progress">
                    <div className={`progress-step ${getStepClass(1)}`}>
                        <div className="step-number">1</div>
                        <span>Shipping</span>
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${getStepClass(2)}`}>
                        <div className="step-number">2</div>
                        <span>Payment</span>
                        {verificationStatus === 'failed' && (
                            <div className="step-error-indicator">!</div>
                        )}
                    </div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${getStepClass(3)}`}>
                        <div className="step-number">3</div>
                        <span>Confirmation</span>
                    </div>
                </div>

                <div className="confirmation-card">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner">
                                <div className="spinner-large"></div>
                            </div>
                            <div className="loading-content">
                                <h3>Verifying Payment</h3>
                                <p>Please wait while we confirm your payment</p>
                            </div>
                        </div>
                    ) : verificationStatus === 'success' && orderData ? (
                        // SUCCESS STATE - Show confirmation
                        <div className="confirmation-success">
                            <div className="status-icon success">
                                <div className="icon-wrapper">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#81d4f5" fillOpacity="0.1" stroke="#81d4f5" strokeWidth="2"/>
                                        <path d="M16 24L22 30L32 20" stroke="#81d4f5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <h2>Payment Successful!</h2>
                            <p className="success-message">Your order has been placed successfully</p>

                            <div className="order-details">
                                <h4>Order Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Order Number</span>
                                        <span className="detail-value">{orderData.order_number}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Total Amount</span>
                                        <span className="detail-value highlight">{formatNumber(orderData.total_amount)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Payment Status</span>
                                        <span className="status-badge paid">{orderData.payment_status}</span>
                                    </div>
                                    <div className="detail-item full-width">
                                        <span className="detail-label">Delivery Address</span>
                                        <span className="detail-value">{orderData.delivery_address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-items-summary">
                                <h4>Order Items</h4>
                                <div className="items-list">
                                    {orderData.order_items.map(item => (
                                        <div key={item.id} className="order-item">
                                            <div className="item-info">
                                                <span className="item-name">{item.product.name}</span>
                                                {item.variant_options && (
                                                    <span className="item-meta">
                                                        {Object.entries(item.variant_options).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(' · ')}
                                                    </span>
                                                )}
                                                <span className="item-meta">Qty: {item.quantity} × {formatNumber(item.unit_price)}</span>
                                            </div>
                                            <span className="item-total">{formatNumber(item.total_price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="btn btn-primary" onClick={handleViewOrder}>
                                    View Order Details
                                </button>
                                <button className="btn btn-secondary" onClick={handleContinueShopping}>
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    ) : (
                        // FAILED STATE - Show payment error (stays in payment tab)
                        <div className="confirmation-failed">
                            <div className="status-icon error">
                                <div className="icon-wrapper">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#FF6B6B" fillOpacity="0.1" stroke="#FF6B6B" strokeWidth="2"/>
                                        <path d="M18 18L30 30M30 18L18 30" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round"/>
                                    </svg>
                                </div>
                            </div>
                            
                            <div className="failed-header">
                                <h2>Payment Failed</h2>
                                <div className="current-step-indicator">
                                    Current Step: <span className="step-badge">Payment</span>
                                </div>
                            </div>

                            <div className="error-section">
                                <div className="error-details">
                                    <p className="failed-message">
                                        We couldn't verify your payment. This could be due to:
                                    </p>
                                    <ul className="error-reasons">
                                        <li>Insufficient funds in your account</li>
                                        <li>Network connectivity issues</li>
                                        <li>Payment gateway timeout</li>
                                        <li>Card authorization failure</li>
                                    </ul>
                                </div>

                                <div className="recommendation">
                                    <h4>What to do next?</h4>
                                    <p>You can try the payment again with the same or a different payment method.</p>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="btn btn-primary" onClick={handleRetryPayment}>
                                    Try Payment Again
                                </button>
                                <button className="btn btn-secondary" onClick={() => navigate('/cart')}>
                                    Back to Cart
                                </button>
                                <button className="btn btn-outline" onClick={() => navigate('/contact')}>
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}