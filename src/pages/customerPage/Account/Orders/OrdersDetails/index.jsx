import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderDetails.css';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector(state => state.auth);
  const baseUrl = import.meta.env.VITE_API_URL || '{{base_url}}';

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return baseUrl + product.images[0];
    }
    if (product.image) {
      return baseUrl + product.image;
    }
    return 'https://via.placeholder.com/80x80?text=Product';
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/customer/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Order Details Response:', response.data);
        if (response.data.success) {
          console.log(response.data.data);
          setOrder(response.data.data);
        } else {
          setError('Failed to fetch order details');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'order-status delivered';
      case 'cancelled':
        return 'order-status cancelled';
      case 'out_for_delivery':
      case 'ready_for_delivery':
        return 'order-status shipping';
      default:
        return 'order-status pending';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pending',
      preparing: 'Preparing',
      confirmed: 'Confirmed',
      ready_for_delivery: 'Out for Delivery',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  if (loading) {
    return (
      <div className="col-lg-10">
        <div className="loading-container">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="col-lg-10">
        <div className="error-container">
          <h3>Order not found</h3>
          <p>{error}</p>
          <button 
            className="btn btn-warning"
            onClick={() => navigate('/account/orders')}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-10 customer-order-details-section">
      <div className="customer-order-details">
        
        {/* Header */}
        <div className="order-header">
          <button 
            className="back-button text-primary"
            onClick={() => navigate('/account/orders')}
          >
            ← Back to Orders
          </button>
          <div className="order-header-content">
            <div>
              <h2>Order #{order.order_number}</h2>
              <p>Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="order-header-right">
              <span className={getStatusClass(order.status)}>
                {getStatusText(order.status)}
              </span>
              <p className="payment-status">
                Payment: <b> {order.payment_status} </b>
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Left Column - Order Items */}
          <div className="col-lg-8">
            <div className="order-items-card">
              <h3>Items in your Order</h3>
              
              {order.order_items.map((item, index) => (
                <div key={item.id} className="order-item w-100">
                  <div className="order-item-image">
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Product';
                      }}
                    />
                  </div>
                  
                  <div className="order-item-details">
                    <Link to={'/product/'+item.product.id} className="order-item-name">
                      {item.product.name}
                    </Link>
                    
                    {item.product.description && (
                      <p className="order-item-description">
                        {item.product.description.length > 100 ? 
                          `${item.product.description.substring(0, 100)}...` : 
                          item.product.description}
                      </p>
                    )}
                    
                    <div className="order-item-meta">
                      {item.product.brand && <span>Brand: {item.product.brand}</span>}
                      {item.variant_options
                        ? Object.entries(item.variant_options).filter(([, value]) => value).map(([key, value]) => <span key={key}>{key}: {value}</span>)
                        : <>
                          {item.product.color && <span>Color: {item.product.color}</span>}
                          {item.product.size && <span>Size: {item.product.size}</span>}
                        </>}
                    </div>
                    
                    <div className="order-item-pricing">
                      <span className="order-item-quantity">Qty: {item.quantity}</span>
                      <div className="order-item-price">
                        <div className="order-item-total">
                          {formatPrice(item.total_price)}
                        </div>
                        <div className="order-item-unit-price">
                          {formatPrice(item.unit_price)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Order Summary & Details */}
          <div className="col-lg-4">
            {/* Order Summary */}
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              
              <div className="order-summary-content">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                
                {parseFloat(order.delivery_fee) > 0 && (
                  <div className="summary-row">
                    <span>Delivery Fee:</span>
                    <span>{formatPrice(order.delivery_fee)}</span>
                  </div>
                )}
                
                {parseFloat(order.tax_amount) > 0 && (
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>{formatPrice(order.tax_amount)}</span>
                  </div>
                )}
              </div>
              
              <div className="order-summary-total">
                <span>Total:</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="delivery-details-card">
              <h3>Delivery Details</h3>
              
              <div className="delivery-detail-item">
                <strong>Delivery Address</strong>
                <p>{order.delivery_address}</p>
              </div>
              
              <div className="delivery-detail-item">
                <strong>Phone Number</strong>
                <p>{order.delivery_phone}</p>
              </div>

              {order.branch && (
                <div className="delivery-detail-item">
                  <strong>Fulfillment Center</strong>
                  <p>{order.branch.name}</p>
                  <p className="small-text">{order.branch.phone} • {order.branch.email}</p>
                </div>
              )}

              {order.rider && (
                <div className="delivery-detail-item">
                  <strong>Delivery Agent</strong>
                  <p>{order.rider.name}</p>
                  <p className="small-text">{order.rider.phone}</p>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div className="order-timeline-card">
              <h3>Order Timeline</h3>
              
              <div className="timeline">
                {/* Order Placed */}
                <div className="timeline-item">
                  <div className="timeline-dot placed">✓</div>
                  <div className="timeline-content placed">
                    <span className="timeline-status-badge placed">✓ Completed</span>
                    <strong>Order Placed</strong>
                    <div className="timeline-date">
                      <span className="timeline-icon">📅</span>
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>

                {/* Order Confirmed or Cancelled */}
                {order.status !== 'pending' && (
                  <div className="timeline-item">
                    <div className={`timeline-dot ${order.status === 'cancelled' ? 'cancelled' : 'confirmed'}`}>
                      {order.status === 'cancelled' ? '✕' : '✓'}
                    </div>
                    <div className={`timeline-content ${order.status === 'cancelled' ? 'cancelled' : 'confirmed'}`}>
                      <span className={`timeline-status-badge ${order.status === 'cancelled' ? 'cancelled' : 'confirmed'}`}>
                        {order.status === 'cancelled' ? '✕ Cancelled' : '✓ Confirmed'}
                      </span>
                      <strong>
                        {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Confirmed'}
                      </strong>
                      <div className="timeline-date">
                        <span className="timeline-icon">📅</span>
                        {formatDate(order.updated_at)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Delivered */}
                {order.delivered_at && (
                  <div className="timeline-item">
                    <div className="timeline-dot delivered">✓</div>
                    <div className="timeline-content delivered">
                      <span className="timeline-status-badge delivered">✓ Delivered</span>
                      <strong>Order Delivered</strong>
                      <div className="timeline-date">
                        <span className="timeline-icon">📅</span>
                        {formatDate(order.delivered_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
