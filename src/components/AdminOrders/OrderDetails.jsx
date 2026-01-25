import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderDetails = ({ orderId, userType, token, onClose }) => {
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
          setOrderDetails(response.data.data);
        } else {
          setError('Failed to fetch order details');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
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
    // console.log(base_url+'/'+product.image);
    // if (product.image && product.image.startsWith('http')) {
    //   return product.image;
    // }
    // if (product.image) {
      return `${base_url}/${product.image}`;
    // }
    // return '/api/placeholder/80/80';
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #f97316',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280', margin: 0 }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Order</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={onClose}
            style={{
              background: '#f97316',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  if (!orderDetails) return null;
  const statusStyle = getStatusColor(orderDetails.status);
  const paymentStatusStyle = getStatusColor(orderDetails.payment_status);
  return (
    <div 
      onClick={onClose} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#fff',
              margin: '0 0 4px 0'
            }}>
              Order #{orderDetails.order_number}
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
              fontSize: '14px'
            }}>
              Placed on {formatDate(orderDetails.created_at)}
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px'
        }}>
          {/* Status Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${statusStyle.border}`,
              backgroundColor: statusStyle.bg
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Order Status</h4>
              <span style={{
                color: statusStyle.color,
                fontSize: '18px',
                fontWeight: '700',
                textTransform: 'capitalize'
              }}>
                {orderDetails.status}
              </span>
            </div>
            
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${paymentStatusStyle.border}`,
              backgroundColor: paymentStatusStyle.bg
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Payment Status</h4>
              <span style={{
                color: paymentStatusStyle.color,
                fontSize: '18px',
                fontWeight: '700',
                textTransform: 'capitalize'
              }}>
                {orderDetails.payment_status}
              </span>
            </div>
            
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #10b981',
              backgroundColor: '#ecfdf5'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>Total Amount</h4>
              <span style={{
                color: '#10b981',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                {formatPrice(orderDetails.total_amount)}
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Customer Information */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👤 Customer Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Name</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                    {orderDetails.customer.name}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Email</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                    {orderDetails.customer.email}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Phone</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                    {orderDetails.customer.phone}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Delivery Address</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                    {orderDetails.delivery_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💰 Order Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Subtotal</span>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>{formatPrice(orderDetails.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Tax</span>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>{formatPrice(orderDetails.tax_amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Delivery Fee</span>
                  <span style={{ color: '#1f2937', fontWeight: '600' }}>{formatPrice(orderDetails.delivery_fee)}</span>
                </div>
                <div style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Total</span>
                  <span style={{ color: '#f97316', fontSize: '18px', fontWeight: '700' }}>
                    {formatPrice(orderDetails.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rider Information */}
            {orderDetails.rider && (
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🚚 Rider Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Name</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                      {orderDetails.rider.name}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Phone</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                      {orderDetails.rider.phone}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Vehicle</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#1f2937' }}>
                      {orderDetails.rider.vehicle_type}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px 24px 16px 24px',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📦 Order Items ({orderDetails.order_items.length})
              </h3>
            </div>
            
            <div style={{ padding: '0 24px 24px 24px' }}>
              {orderDetails.order_items.map((item, index) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 0',
                    borderBottom: index < orderDetails.order_items.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{
                      display: 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f3f4f6',
                      color: '#9ca3af',
                      fontSize: '24px'
                    }}>
                      📦
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 4px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.product.name}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 8px 0'
                    }}>
                      SKU: {item.product.sku || 'N/A'}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        Qty: <strong style={{ color: '#1f2937' }}>{item.quantity}</strong>
                      </span>
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        Unit Price: <strong style={{ color: '#1f2937' }}>{formatPrice(item.unit_price)}</strong>
                      </span>
                      <span style={{
                        fontSize: '16px',
                        color: '#f97316',
                        fontWeight: '700'
                      }}>
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #f3f4f6',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            Close
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .order-details-modal {
            margin: 10px !important;
            max-width: calc(100vw - 20px) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;