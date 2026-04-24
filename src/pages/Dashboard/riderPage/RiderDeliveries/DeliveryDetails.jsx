import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
const formatPrice = (price) => {
  const p = parseFloat(price || 0);
  if (Number.isNaN(p)) return '₦0.00';
  return `₦${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status) => {
  const statusColors = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    preparing: '#8b5cf6',
    ready: '#10b981',
    out_for_delivery: '#f97316',
    delivered: '#22c55e',
    cancelled: '#ef4444'
  };

  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white',
      background: statusColors[status] || '#64748b'
    }}>
      {status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
    </span>
  );
};

const DeliveryDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/rider/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      if (data.success) {
        console.log('customer details ',data.data)
        setOrder(data.data);
      } else {
        throw new Error('Failed to load order details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCallCustomer = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`);
    }
  };

  const handleNavigate = (coordinates) => {
    if (coordinates?.lat && coordinates?.lng) {
      window.open(`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}`);
    }
  };

  const handleMarkDelivered = async () => {
    try {
      setDeliveryLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/rider/orders/${orderId}/delivered`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccessMessage(data.message);
          fetchOrderDetails();
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error('Failed to mark as delivered:', err);
    } finally {
      setDeliveryLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#ef4444', marginBottom: '16px' }}>Error: {error}</div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Order not found</div>
      </div>
    );
  }

  // Calculate total weight from all order items
  const totalWeight = order.order_items?.reduce((sum, item) => {
    const itemWeight = parseFloat(item.product?.weight) || 0;
    return sum + (itemWeight * item.quantity);
  }, 0) || 0;

  return (
    <div style={{ padding: '15px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'block',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            marginRight: '16px',
            color: '#64748b'
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
            Order #{order.order_number}
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            {formatDate(order.created_at)} • {formatTime(order.created_at)}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Customer Information */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid #f1f5f9'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
          Customer Information
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                {(order.customer?.name || 'C')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '500', color: '#1e293b' }}>
                {order.customer?.name || 'N/A'}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                {order.customer?.email || 'N/A'}
              </p>
            </div>
          </div>
          <div style={{ paddingLeft: '52px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>
              <strong>Phone:</strong> {order.delivery_phone || order.customer?.phone || 'N/A'}
            </p>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>
              <strong>Address:</strong> {order.delivery_address || 'N/A'}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              <strong>Branch:</strong> {order.branch?.name || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid #f1f5f9'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
          Order Items
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {order.order_items?.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <img
                src={`${import.meta.env.VITE_API_URL}`+item.product?.image || '/api/placeholder/50/50'}
                alt={item.product?.name}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  marginRight: '12px'
                }}
                onError={(e) => {
                  e.target.src = '/api/placeholder/50/50';
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '500', color: '#1e293b' }}>
                  {item.product?.name || 'Product'}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  Quantity: {item.quantity} × {formatPrice(item.unit_price)}
                  {item.product?.weight && (
                    <span style={{ marginLeft: '8px' }}>• Weight: {(parseFloat(item.product.weight) || 0).toFixed(2)} kg</span>
                  )}
                </p>
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                {formatPrice(item.total_price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid #f1f5f9'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
          Order Summary
        </h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
            <span>Subtotal:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
            <span>Tax:</span>
            <span>{formatPrice(order.tax_amount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
            <span>Delivery Fee:</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          {totalWeight > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
              <span>Total Weight:</span>
              <span>{totalWeight.toFixed(2)} kg</span>
            </div>
          )}
          <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
            <span>Total:</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
            <span>Payment Status:</span>
            <span style={{ textTransform: 'capitalize' }}>{order.payment_status || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {order.status !== 'delivered' && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px 20px',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            ✅ Mark as Delivered
          </button>
        )}
        <button
          onClick={() => handleCallCustomer(order.delivery_phone || order.customer?.phone)}
          style={{
            flex: 1,
            minWidth: '150px',
            padding: '12px 20px',
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📞 Call Customer
        </button>
        <button
          onClick={() => handleNavigate({
            lat: order.branch?.latitude,
            lng: order.branch?.longitude
          })}
          style={{
            flex: 1,
            minWidth: '150px',
            padding: '12px 20px',
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🗺️ Navigate
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>
              Confirm Delivery
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#64748b' }}>
              Are you sure you want to mark this order as delivered?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={deliveryLoading}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: deliveryLoading ? 'not-allowed' : 'pointer',
                  opacity: deliveryLoading ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkDelivered}
                disabled={deliveryLoading}
                style={{
                  padding: '10px 20px',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: deliveryLoading ? 'not-allowed' : 'pointer',
                  opacity: deliveryLoading ? 0.8 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {deliveryLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Delivery'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Modal */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#22c55e',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px'
            }}>
              ✅
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>
              Success!
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#64748b' }}>
              {successMessage}
            </p>
            <button
              onClick={() => setSuccessMessage('')}
              style={{
                padding: '12px 24px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DeliveryDetails;