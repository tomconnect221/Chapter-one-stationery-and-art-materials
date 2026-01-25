import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';
import { useSelector } from 'react-redux';

// Enhanced Map component for rider tracking
const RiderMap = ({ latitude, longitude, riderName }) => {
  const [riderAddress, setRiderAddress] = useState('Loading address...');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);

  // Reverse geocoding to get address from coordinates
  const getRiderAddress = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        setRiderAddress(data.display_name);
      } else {
        setRiderAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      setRiderAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  useEffect(() => {
    getRiderAddress(latitude, longitude);
    setLastUpdated(new Date());
  }, [latitude, longitude]);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      
      if (window.L) {
        const map = window.L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 17,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true
        });
        
        mapInstanceRef.current = map;
        
        // Satellite imagery
        window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles © Esri',
          maxZoom: 19
        }).addTo(map);
        
        // Street labels overlay
        window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        }).addTo(map);
        
        // Simple rider marker
        const riderIcon = window.L.divIcon({
          html: `<div style="background: #f97316; border-radius: 50%; width: 24px; height: 24px; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
          iconSize: [24, 24],
          className: 'rider-marker'
        });
        
        const riderMarker = window.L.marker([latitude, longitude], { icon: riderIcon }).addTo(map);
        
        riderMarker.bindPopup(`<strong>${riderName}</strong><br/>Current Location<br/><small>${riderAddress}</small>`);
        
        // Add accuracy circle
        window.L.circle([latitude, longitude], {
          radius: 50,
          fillColor: '#f97316',
          fillOpacity: 0.1,
          color: '#f97316',
          weight: 1,
          opacity: 0.3
        }).addTo(map);
      }
    };

    const loadLeaflet = () => {
      if (window.L) {
        initMap();
      } else {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initMap;
        document.head.appendChild(script);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, riderName, riderAddress]);

  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={mapRef}
        style={{ 
          width: '100%', 
          height: '250px', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          background: '#f3f4f6'
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#374151',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '200px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>📍 Rider Location:</div>
        <div style={{ lineHeight: '1.3' }}>{riderAddress}</div>
        <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
          Updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ongoing');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(6);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const { token } = useSelector(state => state.auth);
  const baseUrl = import.meta.env.VITE_API_URL || '{{base_url}}';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/customer/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
//  console.log(response);
        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, baseUrl]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, filterStatus]);

  const tabs = [
    {
      id: 'ongoing', 
      label: 'Ongoing/Delivered', 
      count: orders.filter(order => order.status !== 'cancelled' && order.status !== 'returned').length
    },
    {
      id: 'cancelled', 
      label: 'Cancelled/Returned', 
      count: orders.filter(order => order.status === 'cancelled' || order.status === 'returned').length
    }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'confirmed', label: 'Confirmed' },
  ];

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      preparing: 'status-preparing',
      ready_for_delivery: 'status-shipping',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
      returned: 'status-returned',
      confirmed: 'status-confirmed'
    };
    return statusClasses[status] || 'status-default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pending',
      preparing: 'Preparing',
      ready_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      confirmed: 'Confirmed'
    };
    return statusMap[status] || status;
  };

  const getCurrentOrders = () => {
    let currentOrders = [];

    if (activeTab === 'ongoing') {
      currentOrders = orders.filter(order =>
        order.status !== 'cancelled' && order.status !== 'returned'
      );
    } else {
      currentOrders = orders.filter(order =>
        order.status === 'cancelled' || order.status === 'returned'
      );
    }

    if (searchTerm) {
      currentOrders = currentOrders.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_items.some(item =>
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filterStatus !== 'all') {
      currentOrders = currentOrders.filter(order => order.status === filterStatus);
    }

    return currentOrders;
  };

  const getPaginatedOrders = () => {
    const filteredOrders = getCurrentOrders();
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    return filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  };

  const totalPages = Math.ceil(getCurrentOrders().length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return baseUrl + product.images[0];
    }
    if (product.image) {
      return baseUrl + product.image;
    }
    return '/api/placeholder/60/60';
  };

  const handleViewDetails = (orderId) => {
    navigate(`/account/orders/${orderId}`);
  };

  const handleTrackOrder = (order) => {
    setTrackingOrder(order);
    setShowTrackingModal(true);
  };

  const closeTrackingModal = () => {
    setShowTrackingModal(false);
    setTrackingOrder(null);
  };

  const handleReorder = (order) => {
    alert(`Adding ${order.order_items.length} items to cart`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const calculateTotalItems = (orderItems) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="col-lg-10">
        <div className="orders-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-10">
        <div className="orders-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error loading orders</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='col-lg-10'>
      <div className="orders-container">
        {/* Header Section */}
        <div className="orders-header">
          <div className="header-conten">
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-subtitl p-0 m-0 text-light">Track and manage  your purchases</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="orders-nav">
          <div className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-text">{tab.label}</span>
                <span className="tab-badge">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="filter-bar">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search orders by product name or order number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-dropdown">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-select"
            >
              {statusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="orders-grid">
          {getCurrentOrders().length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <rect x="20" y="30" width="80" height="60" rx="8" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="2"/>
                  <rect x="30" y="40" width="20" height="20" rx="4" fill="#dee2e6"/>
                  <rect x="55" y="40" width="35" height="4" rx="2" fill="#dee2e6"/>
                  <rect x="55" y="50" width="25" height="4" rx="2" fill="#dee2e6"/>
                  <rect x="30" y="70" width="60" height="2" rx="1" fill="#e9ecef"/>
                </svg>
              </div>
              <h3 className="empty-title">No orders found</h3>
              <p className="empty-message">
                {activeTab === 'ongoing' 
                  ? "You don't have any ongoing orders at the moment"
                  : "No cancelled or returned orders found"
                }
              </p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/products')}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            getPaginatedOrders().map(order => (
              <div key={order.id} className="order-card-modern">
                {/* Card Header */}
                <div className="card-header">
                  <div className="order-meta">
                    <h3 className="order-number">#{order.order_number}</h3>
                    <span className="order-date">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="status-container">
                    <span className={`status-pill ${getStatusBadgeClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="items-preview">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="item-preview">
                      <div className="item-image-container">
                        <img 
                          src={getProductImage(item.product)} 
                          alt={item.product.name}
                          className="item-image"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/60/60';
                          }}
                        />
                      </div>
                      <div className="item-info">
                        <h4 className="item-name">{item.product.name}</h4>
                        <div className="item-details">
                          <span className="item-qty">Qty: {item.quantity}</span>
                          <span className="item-price">{formatPrice(item.unit_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="order-summary-modern">
                  <div className="summary-row">
                    <span className="summary-label">Total Items:</span>
                    <span className="summary-value">{calculateTotalItems(order.order_items)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Branch:</span>
                    <span className="summary-value">{order.branch.name}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span className="summary-label">Total Amount:</span>
                    <span className="total-amount">{formatPrice(order.total_amount)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card-actions">
                  <button 
                    className="btn-outline-primary"
                    onClick={() => handleViewDetails(order.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    View Details
                  </button>
                  
                  {/* {order.status === 'delivered' && (
                    <button 
                      className="btn-outline-secondary"
                      onClick={() => handleReorder(order)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Reorder
                    </button>
                  )} */}
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button 
                      className="btn-primary-small"
                      onClick={() => handleTrackOrder(order)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {getCurrentOrders().length > ordersPerPage && (
          <div className="pagination-container">
            <div className="pagination-info">
              <span className="pagination-text">
                Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, getCurrentOrders().length)} of {getCurrentOrders().length} orders
              </span>
            </div>
            <div className="pagination">
              <button 
                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = pageNumber === currentPage;
                const showPage = pageNumber === 1 || 
                                pageNumber === totalPages || 
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                
                if (!showPage) {
                  if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={pageNumber}
                    className={`pagination-number ${isCurrentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button 
                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tracking Modal */}
        {showTrackingModal && trackingOrder && (
          <div className="tracking-modal-overlay" onClick={closeTrackingModal}>
            <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tracking-modal-header">
                <h3>Track Order #{trackingOrder.order_number}</h3>
                <button className="close-btn" onClick={closeTrackingModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="tracking-content">
                {trackingOrder.rider ? (
                  <div className="rider-info">
                    <div className="rider-avatar">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="rider-details">
                      <h4>{trackingOrder.rider.name}</h4>
                      <p>{trackingOrder.rider.phone}</p>
                      <span className="vehicle-info">{trackingOrder.rider.vehicle_type} • {trackingOrder.rider.vehicle_number}</span>
                    </div>
                    <div className="rider-status">
                      <span className={`status-badge ${trackingOrder.rider.status}`}>{trackingOrder.rider.status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-rider-info">
                    <div className="status-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="2"/>
                        <path d="M12 6V12L16 14" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <h4>Order in Progress</h4>
                    <p>Your order is being prepared. A rider will be assigned soon.</p>
                  </div>
                )}

                <div className="map-container">
                  {trackingOrder.rider ? (
                    <>
                      <RiderMap 
                        latitude={trackingOrder.rider.latitude} 
                        longitude={trackingOrder.rider.longitude}
                        riderName={trackingOrder.rider.name}
                      />
                      <div className="coordinates-info" style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                        <span>Lat: {trackingOrder.rider.latitude}°, Lng: {trackingOrder.rider.longitude}°</span>
                      </div>
                    </>
                  ) : (
                    <div className="map-placeholder" style={{ 
                      height: '200px', 
                      background: '#f8f9fa', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}>
                      <div className="branch-marker">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" fill="#10b981" stroke="#fff" strokeWidth="2"/>
                          <circle cx="12" cy="10" r="3" fill="#fff"/>
                        </svg>
                      </div>
                      <div className="map-overlay">
                        <p>🏢 Branch Location</p>
                        <small>{trackingOrder.branch.name}</small>
                      </div>
                    </div>
                  )}
                </div>

                <div className="delivery-inf" style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  marginTop: '20px'
                }}>
                  <div style={{
                    display: 'fex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#dbeafe"/>
                    </svg>
                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>Delivery Details</h4>
                  </div>
                  
                  <div className="info-row" style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      minWidth: '36px',
                      height: '36px',
                      background: '#dbeafe',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="#3b82f6" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="#3b82f6" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="label" style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '500',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Delivery Address</span>
                      <span className="value" style={{
                        color: '#1e293b',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        fontWeight: '500'
                      }}>{trackingOrder.delivery_address}</span>
                    </div>
                  </div>
                  
                  <div className="info-row" style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      minWidth: '36px',
                      height: '36px',
                      background: '#dcfce7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C10.93 21 3 13.07 3 3.08C3 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.04 8.7 5.94C8.89 6.35 8.78 6.84 8.43 7.19L6.9 8.72C8.07 11.19 10.81 13.93 13.28 15.1L14.81 13.57C15.16 13.22 15.65 13.11 16.06 13.3C16.96 13.65 17.92 13.84 18.92 13.84C19.52 13.84 20 14.32 20 14.92V16.92H22Z" stroke="#16a34a" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="label" style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '500',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Contact Number</span>
                      <span className="value" style={{
                        color: '#1e293b',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>{trackingOrder.delivery_phone}</span>
                    </div>
                 
                  </div>
                  
                  <div className="info-row" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      minWidth: '36px',
                      height: '36px',
                      background: '#fef3c7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#d97706" strokeWidth="2"/>
                        <path d="M12 6V12L16 14" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="label" style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '500',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Order Status</span>
                      <span className={`status-pill ${getStatusBadgeClass(trackingOrder.status)}`} style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        textTransform: 'capitalize'
                      }}>
                        {getStatusText(trackingOrder.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="tracking-actions">
                  {trackingOrder.rider ? (
                    <>
                      <button className="btn-call" onClick={() => window.open(`tel:${trackingOrder.rider.phone}`)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C10.93 21 3 13.07 3 3.08C3 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.04 8.7 5.94C8.89 6.35 8.78 6.84 8.43 7.19L6.9 8.72C8.07 11.19 10.81 13.93 13.28 15.1L14.81 13.57C15.16 13.22 15.65 13.11 16.06 13.3C16.96 13.65 17.92 13.84 18.92 13.84C19.52 13.84 20 14.32 20 14.92V16.92H22Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Call Rider
                      </button>
                      <button className="btn-refresh" onClick={() => {
                        alert('Location refreshed!');
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M23 4V10H17M1 20V14H7M20.49 9C19.9 5.5 16.76 3 13 3C8.03 3 4 7.03 4 12M3.51 15C4.1 18.5 7.24 21 11 21C15.97 21 20 16.97 20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Refresh Location
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn-call" onClick={() => window.open(`tel:${trackingOrder.branch.phone}`)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C10.93 21 3 13.07 3 3.08C3 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.04 8.7 5.94C8.89 6.35 8.78 6.84 8.43 7.19L6.9 8.72C8.07 11.19 10.81 13.93 13.28 15.1L14.81 13.57C15.16 13.22 15.65 13.11 16.06 13.3C16.96 13.65 17.92 13.84 18.92 13.84C19.52 13.84 20 14.32 20 14.92V16.92H22Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Call Branch
                      </button>
                      <button className="btn-refresh" onClick={() => {
                        alert('Order status refreshed!');
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M23 4V10H17M1 20V14H7M20.49 9C19.9 5.5 16.76 3 13 3C8.03 3 4 7.03 4 12M3.51 15C4.1 18.5 7.24 21 11 21C15.97 21 20 16.97 20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Refresh Status
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;