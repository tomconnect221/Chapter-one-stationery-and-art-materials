import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../../component/Auth/AuthContext';
import { clearCart } from '../../../store/cartSlice';
import './style.css';
import useSettings from '../../../hooks/useSettings';
import { calculateDistance, calculateDeliveryFee, getTotalWeight } from '../../../utils/deliveryCalculator';

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
  console.log('cart items', cart);
  const { isAuthenticated } = useAuth();
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const { settings, isLoading: settingsLoading } = useSettings();
  console.log('system settings', settings);

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    payment: 'card',
    email: '',
    branch_id: '',
    longitude: '',
    latitude: ''
  });

  // Delivery calculation state
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [distance, setDistance] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryBreakdown, setDeliveryBreakdown] = useState(null);

  const [branches, setBranches] = useState([]);
  const [fullPageLoading, setFullPageLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);

  // Calculate total weight from cart
  const totalWeight = useMemo(() => getTotalWeight(cart), [cart]);

  // Calculate delivery fee when branch or form changes
  const calculateDeliveryAsync = useCallback(async () => {
    if (!selectedBranch || !form.latitude || !form.longitude || settingsLoading) {
setDeliveryFee(0);
      setDistance(0);
      setDeliveryBreakdown({
        baseDeliveryFee: 0,
        weightFee: 0,
        distanceFee: 0,
        weightBased: { enabled: false, minimumWeight: 0, feePerUnit: 0, totalWeight: 0 },
        distanceBased: { enabled: false, minimumDistance: 0, feePerUnit: 0, distance: '0' }
      });
      toast.error('Please select a branch with coordinates to calculate delivery.');
      return;
    }

    try {
      const dist = await calculateDistance(
        selectedBranch.latitude,
        selectedBranch.longitude,
        parseFloat(form.latitude),
        parseFloat(form.longitude)
      );
      setDistance(dist);

      const fee = calculateDeliveryFee(settings, totalWeight, dist);
      setDeliveryFee(fee.totalFee);
      setDeliveryBreakdown(fee.breakdown);
    } catch (error) {
      console.error('Distance calculation failed:', error);
      toast.error('Unable to calculate delivery distance. Please verify address and branch coordinates.');
      // Don't use base fee - set to 0 and require user to retry
      setDeliveryFee(0);
      setDistance(0);
      setDeliveryBreakdown({
        baseDeliveryFee: 0,
        weightFee: 0,
        distanceFee: 0,
        weightBased: { enabled: false, minimumWeight: 0, feePerUnit: 0, totalWeight: 0 },
        distanceBased: { enabled: false, minimumDistance: 0, feePerUnit: 0, distance: '0' }
      });
    }
  }, [selectedBranch, form.latitude, form.longitude, settings, totalWeight, settingsLoading]);

  useEffect(() => {
    calculateDeliveryAsync();
  }, [calculateDeliveryAsync]);

  // Handle branch selection
  const handleBranchChange = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    setSelectedBranch(branch || null);
    setForm(prev => ({ ...prev, branch_id: branchId }));
  };

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
        console.log(res);
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
            longitude: activeAddress?.longitude || userData.longitude || prev.longitude,
            latitude: activeAddress?.latitude || userData.latitude || prev.latitude,
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

  // Calculate subtotal from cart items
  const { subtotal, itemsWithPrice, totalTax } = cart.reduce((acc, i) => {
    const price = typeof i.product.price === 'number' ?
      i.product.price :
      parseFloat(String(i.product.price).replace(/[^0-9.]/g, '')) || 0;
    
    const itemSubtotal = price * (i.qty || 0);
    
    // Calculate tax for this item based on product's tax_rate
    const taxRate = parseFloat(i.product.tax_rate) || 0;
    const itemTax = (itemSubtotal * taxRate) / 100;
    
    acc.subtotal += itemSubtotal;
    acc.totalTax += itemTax;
    acc.itemsWithPrice.push({
      ...i,
      itemSubtotal,
      itemTax
    });
    
    return acc;
  }, { subtotal: 0, itemsWithPrice: [], totalTax: 0 });
  
  // Calculate total discount from cart items
  const totalDiscount = cart.reduce((s, i) => {
    // Get the discount amount from product - check different possible field names
    const discount = i.product.discountAmount || 
                    i.product.ad_discount_amount || 
                    i.product.discount || 
                    0;
    return s + (parseFloat(discount) * (i.qty || 1));
  }, 0);
  
  // Calculate grand total with delivery fee and tax
  const grandTotal = subtotal + deliveryFee + totalTax;

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handlePlaceOrder = async () => {
    // Validate phone number
    if (!form.phone || form.phone.trim() === '') {
      toast.error('Phone number is required');
      return;
    }

    // Validate branch selection
    if (!form.branch_id) {
      toast.error('Please select a delivery branch');
      return;
    }

    // Validate delivery fee is calculated
    if (distance === 0 || deliveryFee === undefined || deliveryFee === null) {
      toast.error('Delivery fee has not been calculated. Please verify your address and branch selection.');
      return;
    }

    if (!form.name || !form.address || !form.email) {
      toast.error('Please complete all required details');
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
        delivery_city: form.city,
        delivery_state: form.state,
        delivery_latitude: form.latitude,
        delivery_longitude: form.longitude,
        delivery_phone: form.phone,
        delivery_fee: deliveryFee,
        delivery_weight_fee: deliveryBreakdown?.weightFee || 0,
        delivery_distance_fee: deliveryBreakdown?.distanceFee || 0,
        delivery_base_fee: deliveryBreakdown?.baseDeliveryFee || 0,
        delivery_distance: distance,
        delivery_weight: totalWeight,
        tax_amount: totalTax,
        notes: '',
        items
      };

      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/customer/orders`,
        orderPayload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (orderRes.data && orderRes.data.success) {
        // Clear the cart after successful order
        dispatch(clearCart());
        
        const paymentRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/customer/initialize-payment`,
          orderPayload,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        if (paymentRes.data && paymentRes.status == 200) {
          const ref = paymentRes.data.data.reference;
          localStorage.setItem('payment_reference', ref);
          window.location.href = paymentRes.data.data.authorization_url;
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
        <div className="container verticalLimit">
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
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h3>Shipping Information</h3>
                  <Link 
                    to="/account/address" 
                    className="btn btn-sm w-5" style={{background:'#ff9900', color:'white', width:'40px'}}
                   
                  >
                    Manage Addresses
                  </Link>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        className="form-control"
                        placeholder="Enter your full name"
                        value={form.name}
                        readOnly
                        style={{ background: '#f5f5f5', cursor: 'default' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        className="form-control"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        readOnly
                        style={{ background: '#f5f5f5', cursor: 'default' }}
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
                    <div className="form-group full-width">
                      <label>Delivery Address</label>
                      <div className="address-info-card">
                        <div className="address-info-row">
                          <span className="address-info-icon">📍</span>
                          <div className="address-info-content">
                            <span className="address-info-label">Street Address</span>
                            <span className="address-info-value">
                              {form.address || <em className="address-info-empty">No address saved — <a href="/account/address">update your profile</a></em>}
                            </span>
                          </div>
                        </div>
                        <div className="address-info-divider" />
                        <div className="address-info-row">
                          <span className="address-info-icon">🏙️</span>
                          <div className="address-info-content">
                            <span className="address-info-label">City</span>
                            <span className="address-info-value">{form.city || <em className="address-info-empty">—</em>}</span>
                          </div>
                        </div>
                        <div className="address-info-divider" />
                        <div className="address-info-row">
                          <span className="address-info-icon">🗺️</span>
                          <div className="address-info-content">
                            <span className="address-info-label">State</span>
                            <span className="address-info-value">{form.state || <em className="address-info-empty">—</em>}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label>Branch <small className="text-primary">( Please select the branch you would like to order from) </small> *</label>
                      <select
                        className="form-control"
                        value={form.branch_id}
                        onChange={e => handleBranchChange(e.target.value)}
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name} - {branch.address}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location Coordinates Display */}
                    <div className="form-group full-width">
                      {/* <div className="location-info-box"> */}
                        {/* <h6 className="mb-3">Location Coordinates</h6> */}
                        
                        {selectedBranch ? (
                          <div className="coordinate-section mb-3">
                            {/* <div className="coordinate-label">
                              <i className="fas fa-store-alt me-2"></i>
                              <strong>Branch Location:</strong> {selectedBranch.name}
                            </div> */}
                            {/* <div className="coordinate-values">
                              <span className="badge bg-primary me-2">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                Lat: {selectedBranch.latitude}
                              </span>
                              <span className="badge bg-primary">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                Lng: {selectedBranch.longitude}
                              </span>
                            </div> */}
                          </div>
                        ) : (
                          <div className="coordinate-section mb-3 text-muted">
                            <small><i className="fas fa-info-circle me-1"></i> Select a branch you will like to order from</small>
                          </div>
                        )}

                        <div className="coordinate-section">
                          {/* <div className="coordinate-label">
                            <i className="fas fa-home me-2"></i>
                            <strong>Your Delivery Location:</strong>
                          </div> */}
                          {form.latitude && form.longitude ? (
                            <div className="coordinate-values">
                              {/* <span className="badge bg-success me-2">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                Lat: {form.latitude}
                              </span>
                              <span className="badge bg-success">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                Lng: {form.longitude}
                              </span> */}
                            </div>
                          ) : (
                            <div className="text-muted">
                              <small><i className="fas fa-exclamation-triangle me-1 text-warning"></i> No coordinates found. Please update your shipping address with a valid location.</small>
                            </div>
                          )}
                        </div>

                        {/* {selectedBranch && form.latitude && form.longitude && distance > 0 && (
                          <div className="distance-display mt-3 p-2 bg-light rounded">
                            <i className="fas fa-route me-2"></i>
                            <strong>Distance:</strong> {distance.toFixed(2)} km
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              {/* <div className="checkout-card p-3">
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
              </div> */}

            {/* Order Summary */}
            <div className="checkout-sidebar">
              <div className="order-summary-card p-3">
                <div className="card-header">
                  <h3>Order Summary</h3>
                </div>
                <div className="order-items">
                  {itemsWithPrice.map(i => (
                    <div key={i.id} className="order-item w-100 ">
                      <div className="item-image " style={{ height: '40px', width: '40px' }}>
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
                        {formatNumber(i.itemSubtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>{formatNumber(subtotal)}</span>
                  </div>
                  
                  {/* Discount Display - show savings */}
                  {totalDiscount > 0 && (
                    <div className="total-row" style={{ color: '#28a745' }}>
                      <span>Discount Saved</span>
                      <span>-{formatNumber(totalDiscount)}</span>
                    </div>
                  )}
                  
                  {/* Delivery Fee Display */}
                  <div className="total-row">
                    <span>Delivery Fee {deliveryBreakdown && distance > 0 && `(${distance.toFixed(1)} km)`}</span>
                    <span>{formatNumber(deliveryFee)}</span>
                  </div>
                  
                  {/* Tax Display */}
                  {totalTax > 0 && (
                    <div className="total-row" style={{ color: '#dc3545' }}>
                      <span>Tax</span>
                      <span>{formatNumber(totalTax)}</span>
                    </div>
                  )}
                  
                  {/* Show delivery breakdown details when available */}
                  {deliveryBreakdown && (
                    <div className="delivery-breakdown" style={{ fontSize: '12px', color: '#666', padding: '8px 0', borderTop: '1px dashed #ddd', marginTop: '4px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>Delivery Fee Breakdown:</div>
                      
                      {/* Weight Fee Calculation - only shown if weight > 0 and enabled */}
                      {deliveryBreakdown.weightBased.enabled && totalWeight > 0 && (
                        <div style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: '500' }}>
                            <span>📦 Weight Fee:</span>
                            <span>{formatNumber(deliveryBreakdown.weightFee)}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#666', paddingLeft: '4px' }}>
                            {totalWeight.toFixed(1)} kg ÷ {deliveryBreakdown.weightBased.minimumWeight} kg × {formatNumber(deliveryBreakdown.weightBased.feePerUnit)}
                            <br />
                            <span style={{ color: '#888' }}>= {formatNumber(deliveryBreakdown.weightFee)}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Distance Fee Calculation - only shown if distance > 0 and enabled */}
                      {deliveryBreakdown.distanceBased.enabled && distance > 0 && (
                        <div style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: '500' }}>
                            <span>📍 Distance Fee:</span>
                            <span>{formatNumber(deliveryBreakdown.distanceFee || 0)}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#666', paddingLeft: '4px' }}>
                            {distance.toFixed(1)} km ÷ {deliveryBreakdown.distanceBased.minimumDistance} km × {formatNumber(deliveryBreakdown.distanceBased.feePerUnit)}
                            <br />
                            <span style={{ color: '#888' }}>= {formatNumber(deliveryBreakdown.distanceFee || 0)}</span>
                          </div>
                        </div>
                      )}

                      {/* Show message if weight is 0 and only distance is being charged */}
                      {totalWeight === 0 && deliveryBreakdown.distanceBased.enabled && distance > 0 && (
                        <div style={{ fontSize: '10px', color: '#27a745', padding: '4px', fontStyle: 'italic', marginBottom: '4px' }}>
                          ✓ No weight fee (items are weightless)
                        </div>
                      )}

                      {/* Show message if not enough fees are enabled or distance/weight are 0 */}
                      {!deliveryBreakdown.weightBased.enabled && !deliveryBreakdown.distanceBased.enabled && (
                        <div style={{ fontSize: '10px', color: '#dc3545', padding: '4px', fontStyle: 'italic' }}>
                          ⚠️ Delivery fee settings not configured
                        </div>
                      )}

                      {deliveryBreakdown.distanceBased.enabled && distance === 0 && (
                        <div style={{ fontSize: '10px', color: '#dc3545', padding: '4px', fontStyle: 'italic' }}>
                          ⚠️ Distance is 0 - fee calculation unavailable
                        </div>
                      )}
                      
                      {/* Total Delivery Fee */}
                      {(deliveryBreakdown.weightBased.enabled || deliveryBreakdown.distanceBased.enabled) && (deliveryBreakdown.weightFee > 0 || deliveryBreakdown.distanceFee > 0) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd', fontWeight: '600', color: '#333' }}>
                          <span>💰 Total Delivery Fee:</span>
                          <span>{formatNumber(deliveryFee)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span className="total-amount">{formatNumber(grandTotal)}</span>
                  </div>
                </div>

                {/* Validation Requirements */}
                {(!form.phone?.trim() || !form.branch_id || distance === 0) && (
                  <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    padding: '12px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    color: '#856404'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>⚠️ Please complete the following to proceed:</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {!form.phone?.trim() && <li>Enter a valid phone number</li>}
                      {!form.branch_id && <li>Select a delivery branch</li>}
                      {distance === 0 && <li>Delivery fee is calculating... Please ensure address and branch have valid coordinates</li>}
                    </ul>
                  </div>
                )}

                <button
                  className={`place-order-btn ${loading ? 'loading' : ''}`}
                  onClick={handlePlaceOrder}
                  disabled={fullPageLoading || !form.phone?.trim() || !form.branch_id || distance === 0}
                  title={
                    !form.phone?.trim() ? 'Phone number is required' :
                    !form.branch_id ? 'Please select a branch' :
                    distance === 0 ? 'Delivery fee is calculating... Please wait' :
                    ''
                  }
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px', margin: '0px' }}></div>
                      Processing Order...
                    </>
                  ) : (
                    `Place Order - ${formatNumber(grandTotal)}`
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
