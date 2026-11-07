import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './OrderDetails.css';
import '../AdminProducts/AdminProducts.css';
import ProductAttributes from './ProductAttributes';

const OrderDetails = ({ userType, userBranch }) => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base_url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const endpoint = userType === 'admin' 
          ? `${base_url}/api/admin/orders/${orderId}`
          : `${base_url}/api/subadmin/orders/${orderId}`;
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          console.log('OrderDetails page data:', response.data.data);
          setOrderDetails(response.data.data);
        } else {
          setError('Failed to fetch order details');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      fetchOrderDetails();
    }
  }, [orderId, userType, token, base_url]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return { bg: '#ecfdf5', color: '#10b981', border: '#10b981' };
      case 'processing':
      case 'confirmed':
        return { bg: '#eff6ff', color: '#3b82f6', border: '#3b82f6' };
      case 'pending':
        return { bg: '#fef3c7', color: '#f59e0b', border: '#f59e0b' };
      case 'cancelled':
        return { bg: '#fef2f2', color: '#ef4444', border: '#ef4444' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', border: '#6b7280' };
    }
  };

  const getProductImage = (product) => {
    return `${base_url}/${product.image}`;
  };

  if (loading) {
    return (
      <div className="admin-products" style={{padding: '40px', textAlign: 'center'}}>
        <div className="spinner-border" role="status" style={{width: '3rem', height: '3rem'}}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{marginTop: '16px'}}>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-products" style={{padding: '40px', textAlign: 'center', maxWidth: '800px', margin: '0 auto'}}>
        <div style={{color: '#dc3545', background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: '8px', padding: '24px', marginBottom: '24px'}}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>⚠️</div>
          <h3>Error Loading Order #{orderId}</h3>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} style={{padding: '12px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="admin-products" style={{padding: '40px', textAlign: 'center'}}>
        <h3>Order not found</h3>
        <button onClick={() => navigate(-1)} className="btn btn-primary" style={{padding: '12px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px'}}>
          ← Back to Orders
        </button>
      </div>
    );
  }

  const statusStyle = getStatusColor(orderDetails.status);
  const paymentStatusStyle = getStatusColor(orderDetails.payment_status);

  const totalWeight = orderDetails.order_items.reduce((sum, item) => {
    const itemWeight = parseFloat(item.product?.weight) || 0;
    return sum + (itemWeight * item.quantity);
  }, 0);

  return (
    <div className="admin-products">
      <div className="products-header" style={{marginBottom: '24px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 12px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Back to Orders
          </button>
          <div>
            <h1>Order #{orderDetails.order_number}</h1>
            <p>Placed on {formatDate(orderDetails.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="order-details-content">
        <div className="status-cards">
          <div className="status-card" style={{ borderColor: statusStyle.border, backgroundColor: statusStyle.bg }}>
            <h4>Order Status</h4>
            <span style={{ color: statusStyle.color }}>{orderDetails.status}</span>
          </div>
          
          <div className="status-card" style={{ borderColor: paymentStatusStyle.border, backgroundColor: paymentStatusStyle.bg }}>
            <h4>Payment Status</h4>
            <span style={{ color: paymentStatusStyle.color }}>{orderDetails.payment_status}</span>
          </div>
          
          <div className="status-card amount">
            <h4>Total Amount</h4>
            <span>{formatPrice(orderDetails.total_amount)}</span>
          </div>

          <div className="status-card order-number">
            <h4>Order Number</h4>
            <span>{orderDetails.order_number}</span>
          </div>

          <div className="status-card payment-ref">
            <h4>Payment Reference</h4>
            <span>{orderDetails.payment_reference || 'N/A'}</span>
          </div>

          <div className="status-card total-items">
            <h4>Total Items</h4>
            <span>{orderDetails.order_items.length} {orderDetails.order_items.length === 1 ? 'Item' : 'Items'}</span>
          </div>

          <div className="status-card total-weight">
            <h4>Total Weight</h4>
            <span>{totalWeight.toFixed(2)} kg</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>👤 Customer Information</h3>
            <div className="info-card-content">
              <div className="info-item">
                <label>Name</label>
                <p className="bold">{orderDetails.customer.name}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{orderDetails.customer.email || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{orderDetails.delivery_phone || orderDetails.customer.phone || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>City</label>
                <p>{orderDetails.customer.city || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>State</label>
                <p>{orderDetails.customer.state || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3>📍 Delivery Information</h3>
            <div className="info-card-content">
              <div className="info-item">
                <label>Delivery Address</label>
                <p className="word-break">{orderDetails.delivery_address}</p>
              </div>
              <div className="info-item">
                <label>Delivery Phone</label>
                <p>{orderDetails.delivery_phone || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Delivery Fee</label>
                <p className="bold">{formatPrice(orderDetails.delivery_fee || 0)}</p>
              </div>
              <div className="info-item">
                <label>Branch</label>
                <p>{orderDetails.branch?.name || 'N/A'}</p>
              </div>
              {orderDetails.delivered_at && (
                <div className="info-item">
                  <label>Delivered At</label>
                  <p>{formatDate(orderDetails.delivered_at)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="info-card">
            <h3>💰 Order Summary</h3>
            <div className="info-card-content">
              <div className="order-summary-item">
                <span>Subtotal</span>
                <span>{formatPrice(orderDetails.subtotal || 0)}</span>
              </div>
              <div className="order-summary-item">
                <span>Tax</span>
                <span>{formatPrice(orderDetails.tax_amount || 0)}</span>
              </div>
              <div className="order-summary-item">
                <span>Delivery Fee</span>
                <span>{formatPrice(orderDetails.delivery_fee || 0)}</span>
              </div>
              {orderDetails.discount && (
                <div className="order-summary-item discount-item">
                  <span>Discount</span>
                  <span>-{formatPrice(orderDetails.discount)}</span>
                </div>
              )}
              <div className="order-summary-total">
                <span>Total</span>
                <span>{formatPrice(orderDetails.total_amount)}</span>
              </div>
            </div>
          </div>

          {orderDetails.rider ? (
            <div className="info-card">
              <h3>🚚 Rider Information</h3>
              <div className="info-card-content">
                <div className="info-item">
                  <label>Name</label>
                  <p className="bold">{orderDetails.rider.name}</p>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <p>{orderDetails.rider.phone}</p>
                </div>
                <div className="info-item">
                  <label>Vehicle Type</label>
                  <p>{orderDetails.rider.vehicle_type}</p>
                </div>
                <div className="info-item">
                  <label>Vehicle Number</label>
                  <p>{orderDetails.rider.vehicle_number || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <p style={{ textTransform: 'capitalize' }}>{orderDetails.rider.status || 'N/A'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rider-not-assigned">
              <h3>🚚 Rider Not Assigned</h3>
              <p>No rider assigned yet. Use rider assignment in orders list.</p>
            </div>
          )}
        </div>

        <div className="order-items-card">
          <div className="order-items-header">
            <h3>📦 Order Items ({orderDetails.order_items.length})</h3>
            <p>{orderDetails.order_items.reduce((sum, item) => sum + item.quantity, 0)} units</p>
          </div>
          <div className="order-items-content">
            {orderDetails.order_items.map((item) => (
              <div key={item.id} className="order-item">
                <div className="order-item-image">
                  <img
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="order-item-image-placeholder">📦</div>
                </div>
                <div className="order-item-details">
                  <h4>{item.product.name}</h4>
                  <ProductAttributes item={item} />
                  <p className="order-item-description">
                    {item.product.short_description || item.product.description || 'No description available'}
                  </p>
                  <div className="order-item-pricing">
                    <div className="order-item-pricing-item">
                      <label>Qty</label>
                      <p>{item.quantity}</p>
                    </div>
                    <div className="order-item-pricing-item">
                      <label>Weight</label>
                      <p>{(parseFloat(item.product.weight) || 0).toFixed(2)} kg</p>
                    </div>
                    <div className="order-item-pricing-item">
                      <label>Unit Price</label>
                      <p>{formatPrice(item.unit_price)}</p>
                    </div>
                    <div className="order-item-pricing-item">
                      <label>Subtotal</label>
                      <p className="price">{formatPrice(item.total_price)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
