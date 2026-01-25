import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../component/Auth/AuthContext';
import { clearCart } from '../../../store/cartSlice';
import './style.css';

const formatNumber = (number) => {
  const n = parseFloat(String(number).replace(/[^0-9.]/g, '')) || 0;
  return n.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector(s => (s.cart && s.cart.items) || []);
  const { isAuthenticated } = useAuth();
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    payment: 'card',
    email: '',
    branch_id: ''
  });

  const [branches, setBranches] = useState([]);
  const [fullPageLoading, setFullPageLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);

  // Redirect if not authenticated OR if cart is empty
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    // Redirect to cart page if cart is empty
    if (cart.length === 0) {
      toast.error('Your cart is empty. Please add items to proceed to checkout.');
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, token, navigate, cart]);

  // Handle redirect after loader is shown
  useEffect(() => {
    if (redirectUrl && fullPageLoading) {
      // Small delay to ensure loader is visible before redirect
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [redirectUrl, fullPageLoading]);

  // Fetch user profile and branches
  useEffect(() => {
    if (!isAuthenticated || !token || cart.length === 0) {
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.success) {
          const userData = res.data.data;
          const activeAddress = userData.shipping_addresses?.find(addr => addr.is_default);

          setForm(prev => ({
            ...prev,
            name: userData.name || prev.name,
            email: userData.email || prev.email,
            phone: userData.phone || prev.phone,
            address: activeAddress?.address || userData.address || prev.address,
            city: activeAddress?.city || userData.city || prev.city,
            state: activeAddress?.state || userData.state || prev.state,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    const fetchBranches = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/branches`);
        if (res.data && res.data.success) {
          setBranches(res.data.data || []);
        }
      } catch (err) {
        setBranches([]);
      }
    };

    fetchUserProfile();
    fetchBranches();
  }, [isAuthenticated, token, cart]);

  // Show nothing if not authenticated or cart is empty (will redirect)
  if (!isAuthenticated || !token || cart.length === 0) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-large"></div>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((s, i) => {
    const price = typeof i.product.price === 'number' ?
      i.product.price :
      parseFloat(String(i.product.price).replace(/[^0-9.]/g, '')) || 0;
    return s + (price * (i.qty || 0));
  }, 0);
  const total = subtotal;

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.email || !form.branch_id) {
      toast.error('Please complete all required details, including branch selection');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setFullPageLoading(true);

    try {
      const items = cart.map(i => ({
        product_id: i.product.id,
        quantity: i.qty
      }));

      const orderPayload = {
        branch_id: form.branch_id,
        delivery_address: form.address,
        delivery_phone: form.phone,
        notes: '',
        items
      };

      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/customer/orders`,
        orderPayload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (orderRes.data && orderRes.data.success) {
        const paymentRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/customer/initialize-payment`,
          orderPayload,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        if (paymentRes.data && paymentRes.status == 200) {
          const ref = paymentRes.data.data.reference;
          localStorage.setItem('payment_reference', ref);
          window.location.href = paymentRes.data.data.authorization_url;
          // setRedirectUrl(paymentRes.data.data.authorization_url);
          // Clear cart and set redirect URL (will trigger useEffect)
          // dispatch(clearCart());
        } else {
          toast.error(paymentRes.data?.message || 'Payment initialization failed');
          setFullPageLoading(false);
        }
      } else {
        if (orderRes.data.errors) {
          const errorMsgs = Object.values(orderRes.data.errors).flat().join(' ');
          toast.error(errorMsgs);
        } else {
          toast.error(orderRes.data.message || 'Order creation failed');
        }
        setFullPageLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order or payment failed');
      setFullPageLoading(false);
    }
  };

  const states = [
    'Lagos', 'Abuja', 'Rivers', 'Kano', 'Oyo', 'Edo', 'Delta',
    'Kaduna', 'Ogun', 'Enugu', 'Anambra', 'Imo', 'Plateau', 'Kwara'
  ];

  return (
    <>
      {/* Full Page Loader */}
      {fullPageLoading && (
        <div className="full-page-loader">
          <div className="loader-content">
            <div className="spinner-large"></div>
            <h3>Processing Your Order</h3>
            <p>Please wait while we process your payment...</p>
          </div>
        </div>
      )}

      <section className="checkout-page">
        <div className="containe verticalLimit">
          {/* Progress Steps */}
          <div className="checkout-progress">
            <div className={`progress-step ${activeStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Shipping</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${activeStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Payment</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${activeStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Confirmation</span>
            </div>
          </div>
          <div className="checkout-grid p-0 m-0 ">
            <div className="checkout-main p-0 m-0">
              {/* Shipping Details */}
              <div className="checkout-card p-3">
                <div className="card-header">
                  <h3>Shipping Information</h3>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        className="form-control"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        className="form-control"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        className="form-control"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="form-group ">
                      <label>Delivery Address *</label>
                      <input
                        className="form-control"
                        placeholder="Enter your complete address"
                        value={form.address}
                        onChange={e => handleChange('address', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        className="form-control"
                        placeholder="Enter your city"
                        value={form.city}
                        onChange={e => handleChange('city', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <select
                        className="form-control"
                        value={form.state}
                        onChange={e => handleChange('state', e.target.value)}
                      >
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Branch <small className="text-primary">( Please select the branch you would like to order from) </small> *</label>
                      <select
                        className="form-control"
                        value={form.branch_id}
                        onChange={e => handleChange('branch_id', e.target.value)}
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name} - {branch.address}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-card p-3">
                <div className="card-header">
                </div>
                <div className="card-body">
                  <div className="payment-options">
                    <div className={`payment-option ${form.payment === 'card' ? 'selected' : ''}`}>
                      <label className="form-check-label" htmlFor="pay-card">
                        <div className="payment-icon">💳</div>
                        <div>
                          <div className="payment-title">Pay with Card</div>
                          <div className="payment-desc">Secure online payment</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="checkout-sidebar">
              <div className="order-summary-card p-3">
                <div className="card-header">
                  <h3>Order Summary</h3>
                </div>
                <div className="order-items">
                  {cart.map(i => (
                    <div key={i.id} className="order-item ">
                      <div className="item-image">
                        <img
                          src={`${import.meta.env.VITE_API_URL}/` + i.product.image}
                          alt={i.product.title || i.product.name}
                        />
                      </div>
                      <div className="item-details" style={{ height: 'fit-content', width: 'fit-content' }}>
                        <div className="item-name" style={{ height: 'fit-content', width: 'fit-content' }}>{i.product.title || i.product.name}</div>
                        <div className="item-quantity">Qty: {i.qty}</div>
                      </div>
                      <div className="item-price">
                        {formatNumber(
                          (typeof i.product.price === 'number' ?
                            i.product.price :
                            parseFloat(String(i.product.price).replace(/[^0-9.]/g, '')) || 0
                          ) * i.qty
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>{formatNumber(subtotal)}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span className="total-amount">{formatNumber(total)}</span>
                  </div>
                </div>

                <button
                  className={`place-order-btn ${loading ? 'loading' : ''}`}
                  onClick={handlePlaceOrder}
                  disabled={fullPageLoading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px', margin: '0px' }}></div>
                      Processing Order...
                    </>
                  ) : (
                    `Place Order - ${formatNumber(total)}`
                  )}
                </button>
              </div>

              {/* Security Badge */}
              <div className="security-badge">
                <div className="security-icon">🔒</div>
                <div className="security-text">
                  <div>Secure Checkout</div>
                  <small>Your information is protected</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}