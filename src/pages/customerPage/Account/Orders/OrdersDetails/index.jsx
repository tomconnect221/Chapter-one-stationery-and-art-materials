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

  if (loading) {
    return (
      <div className="col-lg-10">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="col-lg-10">
        <div style={{ padding: '40px', textAlign: 'center' }}>
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
    <div className="col-lg-10">
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#fff', padding: '20px', marginBottom: '20px', borderRadius: '4px' }}>
          <button 
            onClick={() => navigate('/account/orders')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#f68b1e', 
              fontSize: '14px',
              marginBottom: '10px',
              cursor: 'pointer'
            }}
          >
            ← Back to Orders
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Order #{order.order_number}</h2>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                backgroundColor: order.status === 'delivered' ? '#4caf50' : 
                              order.status === 'cancelled' ? '#f44336' : '#ff9800',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {order.status}
              </span>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                Payment: <b style={{textTransform:'capitalize'}}> {order.payment_status} </b>
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Left Column - Order Items */}
          <div className="col-lg-8">
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                Items in your Order
              </h3>
              
              {order.order_items.map((item, index) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  padding: '20px 0',
                  borderBottom: index < order.order_items.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <div style={{ width: '80px', height: '80px', marginRight: '15px' }}>
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: '4px',
                        border: '1px solid #eee'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Product';
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 1}}>
                    <Link to={'/product/'+item.product.id} style={{textTransform:'capitalize', textDecoration:'none' , fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0', color: '#333' }}>
                      {item.product.name}
                    </Link>
                    
                    {item.product.description && (
                      <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {item.product.description.length > 100 ? 
                          `${item.product.description.substring(0, 100)}...` : 
                          item.product.description}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#888' }}>
                      {item.product.brand && <span>Brand: {item.product.brand}</span>}
                      {item.product.color && <span>Color: {item.product.color}</span>}
                      {item.product.size && <span>Size: {item.product.size}</span>}
                    </div>
                    
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>Qty: {item.quantity}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#f68b1e' }}>
                          {formatPrice(item.total_price)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
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
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Order Summary</h3>
              
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                
                {parseFloat(order.delivery_fee) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Delivery Fee:</span>
                    <span>{formatPrice(order.delivery_fee)}</span>
                  </div>
                )}
                
                {parseFloat(order.tax_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Tax:</span>
                    <span>{formatPrice(order.tax_amount)}</span>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
                <span>Total:</span>
                <span style={{ color: '#f68b1e' }}>{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            {/* Delivery Information */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Delivery Details</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ fontSize: '14px', color: '#333' }}>Delivery Address</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                  {order.delivery_address}
                </p>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ fontSize: '14px', color: '#333' }}>Phone Number</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                  {order.delivery_phone}
                </p>
              </div>

              {order.branch && (
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ fontSize: '14px', color: '#333' }}>Fulfillment Center</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    {order.branch.name}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#888' }}>
                    {order.branch.phone} • {order.branch.email}
                  </p>
                </div>
              )}

              {order.rider && (
                <div>
                  <strong style={{ fontSize: '14px', color: '#333' }}>Delivery Agent</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    {order.rider.name}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#888' }}>
                    {order.rider.phone}
                  </p>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '35px' }}>Order Timeline</h3>
              
              <div style={{ position: 'relative', paddingLeft: '20px' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '8px', 
                  top: '0', 
                  bottom: '0', 
                  width: '2px', 
                  backgroundColor: '#eee' 
                }}></div>
                
                <div style={{ position: 'relative', marginBottom: '50px' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: '-12px', 
                    // top:'5px',
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: '#4caf50', 
                    borderRadius: '50%',
                    border: '3px solid #fff',
                    boxShadow: '0 0 0 2px #4caf50'
                  }}></div>
                  <div style={{marginLeft:'20px', marginTop:'-20px'}}>
                    <strong style={{ fontSize: '14px', color: '#333' }}>Order Placed</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#888' }}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>

                {order.status !== 'pending' && (
                  <div style={{ position: 'relative', marginBottom: '50px' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-12px', 
                      width: '16px', 
                      height: '16px', 
                      backgroundColor: order.status === 'cancelled' ? '#f44336' : '#4caf50', 
                      borderRadius: '50%',
                      border: '3px solid #fff',
                      boxShadow: `0 0 0 2px ${order.status === 'cancelled' ? '#f44336' : '#4caf50'}`
                    }}></div>
                    <div style={{marginLeft:'20px', marginTop:'-20px'}}>
                      <strong style={{ fontSize: '14px', color: '#333' }}>
                        {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Confirmed'}
                      </strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#888' }}>
                        {formatDate(order.updated_at)}
                      </p>
                    </div>
                  </div>
                )}

                {order.delivered_at && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-12px', 
                      width: '16px', 
                      height: '16px', 
                      backgroundColor: '#4caf50', 
                      borderRadius: '50%',
                      border: '3px solid #fff',
                      boxShadow: '0 0 0 2px #4caf50'
                    }}></div>
                    <div style={{marginLeft:'20px', marginTop:'-20px'}}>
                      <strong style={{ fontSize: '14px', color: '#333' }}>Order Delivered</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#888' }}>
                        {formatDate(order.delivered_at)}
                      </p>
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