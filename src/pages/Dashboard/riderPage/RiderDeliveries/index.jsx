import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DispatchDeliveries.css';
import OrderView from './OrderView';
import axios from 'axios';
import { useSelector } from 'react-redux';

const DispatchDeliveries = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState({ today: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('inactive');
  const locationTimerRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_URL || '';
  const { token } = useSelector(state => state.auth);

  // helper to categorize orders by status
  const categorize = (items) => {
    const today = [];
    const upcoming = [];
    const completed = [];
    items.forEach((o) => {
      if (o.status === 'completed' || o.status === 'delivered') completed.push(o);
      else if (o.status === 'scheduled') upcoming.push(o);
      else today.push(o);
    });
    return { today, upcoming, completed };
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/rider/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        const categorized = categorize(res.data.data || []);
        setOrders(categorized);
      } else {
        console.error('Failed to load orders', res);
      }
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    startLocationUpdates();
    return () => {
      stopLocationUpdates();
    };
  }, []);

  // Enhanced location update logic - every 1 minute
  const sendLocation = async (latitude, longitude) => {
    try {
      setLocationStatus('updating');
      await axios.put(`${baseUrl}/api/rider/location?latitude=${latitude}&longitude=${longitude}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      setLocationStatus('active');
    } catch (err) {
      setLocationStatus('error');
      console.warn('Failed to send location', err);
    }
  };

  const startLocationUpdates = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    const pushLocation = () => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        sendLocation(latitude, longitude);
      }, (err) => {
        setLocationStatus('error');
        console.debug('geolocation error', err.message);
      });
    };

    // Initial push
    pushLocation();

    // Every 1 minute (60 seconds)
    locationTimerRef.current = setInterval(pushLocation, 60 * 1000);
  };

  const stopLocationUpdates = () => {
    if (locationTimerRef.current) {
      clearInterval(locationTimerRef.current);
      setLocationStatus('inactive');
    }
  };

  const formatPrice = (price) => {
    const p = parseFloat(price || 0);
    if (Number.isNaN(p)) return '₦0.00';
    return `₦${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { label: 'Assigned', class: 'status-assigned', color: '#3b82f6' },
      'in-progress': { label: 'In Progress', class: 'status-in-progress', color: '#f59e0b' },
      completed: { label: 'Completed', class: 'status-completed', color: '#10b981' },
      scheduled: { label: 'Scheduled', class: 'status-scheduled', color: '#8b5cf6' },
      delivered: { label: 'Delivered', class: 'status-completed', color: '#10b981' },
      cancelled: { label: 'Cancelled', class: 'status-cancelled', color: '#ef4444' }
    };
    const config = statusConfig[status] || { label: status, class: 'status-default', color: '#6b7280' };
    return (
      <span 
        className={`status-badge ${config.class}`}
        style={{
          background: `${config.color}15`,
          color: config.color,
          border: `1px solid ${config.color}30`,
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500'
        }}
      >
        {config.label}
      </span>
    );
  };

  const getProductImage = (orderItems) => {
    if (!orderItems || orderItems.length === 0) return '/api/placeholder/40/40';
    const firstItem = orderItems[0];
    if (firstItem.product?.images && firstItem.product.images.length > 0) {
      return baseUrl + firstItem.product.images[0];
    }
    if (firstItem.product?.image) {
      return baseUrl + firstItem.product.image;
    }
    return '/api/placeholder/40/40';
  };

  const getLocationStatusIcon = () => {
    const statusConfig = {
      active: { icon: '🟢', text: 'Location Active' },
      updating: { icon: '🟡', text: 'Updating...' },
      error: { icon: '🔴', text: 'Location Error' },
      inactive: { icon: '⚫', text: 'Location Off' },
      unavailable: { icon: '❌', text: 'GPS Unavailable' }
    };
    return statusConfig[locationStatus] || statusConfig.inactive;
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      const res = await axios.put(`${baseUrl}/api/rider/orders/${orderId}/delivered`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        await fetchOrders();
        setShowOrderModal(false);
      } else {
        console.error('Failed to mark delivered', res);
      }
    } catch (err) {
      console.error('Error marking delivered', err);
    }
  };

  const handleCallCustomer = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleNavigate = ({ lat, lng }) => {
    if (!lat || !lng) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const filteredDeliveries = (orders[activeTab] || []).filter((o) => {
    const matchesSearch = (o.order_number || o.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || (o.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getTodayStats = () => {
    const allOrders = [...(orders.today || []), ...(orders.completed || [])];
    const completedOrders = allOrders.filter(d => d.status === 'completed' || d.status === 'delivered');
    const inProgressOrders = allOrders.filter(d => d.status === 'in-progress' || d.status === 'out_for_delivery');
    
    return {
      total: allOrders.length,
      completed: completedOrders.length,
      inProgress: inProgressOrders.length,
      earnings: completedOrders.reduce((sum, d) => sum + parseFloat(d.total_amount || 0), 0)
    };
  };

  const todayStats = getTodayStats();

  const statusFilters = [
    { value: 'all', label: 'All Deliveries' },
   

     { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'confirmed', label: 'Confirmed' },
  ];

  return (
    <div className="dispatch-deliveries p-3" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Enhanced Tabs */}
      <div className="deliveries-tabs p-0 m-0" style={{
        display: 'flex',
        background: 'white',
        borderRadius: '16px',
        // padding: '6px',
        // margin: '0 24px 24px 24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        gap: '4px'
      }}>
        <button
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            borderRadius: '12px',
            background: activeTab === 'today' ? '#667eea' : 'transparent',
            color: activeTab === 'today' ? 'white' : '#64748b',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Today's Deliveries
          <span style={{
            background: activeTab === 'today' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
            color: activeTab === 'today' ? 'white' : '#64748b',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '600'
          }}>{orders.today.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            borderRadius: '12px',
            background: activeTab === 'upcoming' ? '#667eea' : 'transparent',
            color: activeTab === 'upcoming' ? 'white' : '#64748b',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Upcoming
          <span style={{
            background: activeTab === 'upcoming' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
            color: activeTab === 'upcoming' ? 'white' : '#64748b',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '600'
          }}>{orders.upcoming.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            borderRadius: '12px',
            background: activeTab === 'completed' ? '#667eea' : 'transparent',
            color: activeTab === 'completed' ? 'white' : '#64748b',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Completed
          <span style={{
            background: activeTab === 'completed' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
            color: activeTab === 'completed' ? 'white' : '#64748b',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '600'
          }}>{orders.completed.length}</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        margin: '0 24px 14px 14px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{
            position: 'relative',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <svg 
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}
              width="20" height="20" viewBox="0 0 24 24" fill="none"
            >
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search orders or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>
        <div style={{ minWidth: '150px' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: 'none',
              borderRadius: '12px',
              background: 'white',
              fontSize: '14px',
              outline: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
          >
            {statusFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Delivery Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
        padding: '0 24px 24px 24px'
      }}>
        {loading ? (
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#64748b', margin: 0 }}>Loading deliveries...</p>
            </div>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No deliveries found</h3>
            <p style={{ color: '#64748b', margin: 0 }}>No deliveries match your current filters</p>
          </div>
        ) : (
          filteredDeliveries.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                border: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                navigate(`/dispatch/deliveries/${order.id}`);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
              }}
            >
              {/* Order Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>#{order.order_number || order.id}</h3>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#64748b'
                  }}>{formatDate(order.created_at)} • {formatTime(order.created_at)}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>
{console.log(order.customer)}
              {/* Product Preview */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '12px'
              }}>
                <img
                  src={getProductImage(order.order_items)}
                  alt="Product"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    marginRight: '12px'
                  }}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/40/40';
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: '0 0 2px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1e293b'
                  }}>
                    {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    {order.order_items?.[0]?.product?.name || 'Product'}
                    {(order.order_items?.length || 0) > 1 && ` +${(order.order_items?.length || 0) - 1} more`}
                  </p>
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {formatPrice(order.total_amount)}
                </div>
              </div>

              {/* Customer Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                    {(order.customer?.name || 'C')[0].toUpperCase()}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: '0 0 2px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1e293b'
                  }}>{order.customer?.name || 'Customer'}</p>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#64748b'
                  }}>{order.customer?.phone || 'No phone'}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <svg 
                  style={{ marginRight: '8px', marginTop: '2px', color: '#64748b' }}
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                >
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#64748b',
                  lineHeight: '1.4'
                }}>{order.delivery_address || 'No address provided'}</p>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCallCustomer(order.customer?.phone);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C10.93 21 3 13.07 3 3.08C3 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.04 8.7 5.94C8.89 6.35 8.78 6.84 8.43 7.19L6.9 8.72C8.07 11.19 10.81 13.93 13.28 15.1L14.81 13.57C15.16 13.22 15.65 13.11 16.06 13.3C16.96 13.65 17.92 13.84 18.92 13.84C19.52 13.84 20 14.32 20 14.92V16.92H22Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Call
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate({ lat: order.delivery_latitude, lng: order.delivery_longitude });
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#667eea',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Navigate
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedOrder && (
        <OrderView
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
          onMarkDelivered={handleMarkDelivered}
          onCallCustomer={handleCallCustomer}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default DispatchDeliveries;