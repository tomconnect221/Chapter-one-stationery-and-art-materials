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

const getProductImageUrl = (image) => {
    if (!image || typeof image !== 'string') return '';
    if (/^https?:\/\//i.test(image)) return image;

    const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    return `${apiBaseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
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
                                        <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#2f8652" fillOpacity="0.1" stroke="#2f8652" strokeWidth="2"/>
                                        <path d="M16 24L22 30L32 20" stroke="#2f8652" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
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
                                <div className="order-items-heading">
                                    <h4>Order Items</h4>
                                    <span>{orderData.order_items?.length || 0} {orderData.order_items?.length === 1 ? 'item' : 'items'}</span>
                                </div>
                                <div className="items-list">
                                    {(Array.isArray(orderData.order_items) ? orderData.order_items : []).map((item, index) => (
                                        <div key={item.id || `${item.product_id || 'item'}-${index}`} className="order-item">
                                            <div className="item-image">
                                                <svg className="item-image-placeholder" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M4 5.75A1.75 1.75 0 0 1 5.75 4h12.5A1.75 1.75 0 0 1 20 5.75v12.5A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V5.75Zm2 .25v12h12V6H6Zm1.25 10.5 2.7-3.2a.75.75 0 0 1 1.15-.02l1.6 1.8 1.2-1.35a.75.75 0 0 1 1.13.02l2.1 2.75H7.25ZM9 11a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 9 11Z" />
                                                </svg>
                                                {getProductImageUrl(item.product?.image) && (
                                                    <img
                                                        src={getProductImageUrl(item.product.image)}
                                                        alt={item.product?.name || 'Ordered product'}
                                                        loading="lazy"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="item-info">
                                                <span className="item-name">{item.product?.name || 'Product unavailable'}</span>
                                                {item.variant_options && typeof item.variant_options === 'object' && (
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
                                        <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#c54343" fillOpacity="0.08" stroke="#c54343" strokeWidth="2"/>
                                        <path d="M18 18L30 30M30 18L18 30" stroke="#c54343" strokeWidth="3" strokeLinecap="round"/>
                                    </svg>
                                </div>
                            </div>
                            
                            <div className="failed-header">
                                <span className="failed-eyebrow">PAYMENT STATUS</span>
                                <h2>Payment not confirmed</h2>
                                <div className="current-step-indicator">
                                    We couldn’t verify this payment yet.
                                </div>
                            </div>

                            <div className="error-section">
                                <div className="error-details">
                                    <span className="error-card-icon" aria-hidden="true">!</span>
                                    <div>
                                        <h3 className="failed-message">Your order has not been confirmed</h3>
                                        <p className="error-copy">If your bank or payment provider shows a debit, please contact support before trying again. Some payments take a short time to update.</p>
                                    </div>
                                </div>

                                <div className="recommendation">
                                    <h4>Next steps</h4>
                                    <ol className="next-steps">
                                        <li>Check your bank or payment-provider transaction status.</li>
                                        <li>If no payment was taken, retry checkout or return to your cart.</li>
                                        <li>If you were charged, contact support so we can help verify it.</li>
                                    </ol>
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