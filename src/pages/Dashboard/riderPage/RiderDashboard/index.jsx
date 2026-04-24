// components/DispatchDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../../DashboardLayout/';
import useRiderOrders from '../../../../hooks/useRiderOrders';
import './DispatchRiderDashboardStyling.css';

const DispatchDashboard = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [locationStatus, setLocationStatus] = useState('inactive');
  const locationTimerRef = useRef(null);

  // Fetch rider's assigned orders
  const {
    orders,
    loading,
    error,
    stats,
    pagination,
    updateOrderStatus,
    getOrderStats,
    handlePageChange
  } = useRiderOrders({
    status: filterStatus,
    page: currentPage,
    limit: 10
  });

  // Calculate dispatch stats from actual data
  const localStats = getOrderStats();

  // Location tracking setup
  useEffect(() => {
    startLocationUpdates();
    return () => {
      stopLocationUpdates();
    };
  }, []);

  const startLocationUpdates = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    const pushLocation = () => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        // Location update logic here - integrate with your API
        setLocationStatus('active');
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

  const dispatchStats = [
    {
      title: 'Total Deliveries',
      value: localStats.total.toString(),
      change: `+${localStats.total}`,
      changeType: 'up',
      subtitle: `${localStats.completed} Completed`,
      icon: '🚚'
    },
    {
      title: 'Earnings',
      value: stats.totalEarnings ? `₦${parseFloat(stats.totalEarnings).toLocaleString()}` : '₦0',
      change: '+15%',
      changeType: 'up',
      subtitle: stats.totalEarnings ? `Today: ₦${parseFloat(stats.totalEarnings).toLocaleString()}` : 'No earnings',
      icon: '💰'
    },
    {
      title: 'In Progress',
      value: localStats.inProgress.toString(),
      change: `+${localStats.inProgress}`,
      changeType: 'up',
      subtitle: 'Active Deliveries',
      icon: '⏱️'
    },
    {
      title: 'Pending',
      value: localStats.pending.toString(),
      change: `+${localStats.pending}`,
      changeType: 'up',
      subtitle: 'Awaiting Assignment',
      icon: '⭐'
    }
  ];

  return (
    // <DashboardLayout userType="dispatch">
    <>
      {/* Enhanced Header - My Deliveries Section */}
      <div className="deliveries-header">
        <div className="deliveries-header-content">
          <div className="deliveries-header-title">
            <h1>My Deliveries</h1>
            <p>Manage and track your delivery assignments</p>
          </div>
          <div className="location-status-badge  d-flex">
            <span className="status-icon pr-3 m-0">{getLocationStatusIcon().icon}</span>
            <span className="status-text">{getLocationStatusIcon().text}</span>
          </div>
        </div>

        <div className="header-stats">
          <div className="header-stat-card">
            <div className="header-stat-value">{localStats.total}</div>
            <div className="header-stat-label">Total</div>
          </div>
          <div className="header-stat-card">
            <div className="header-stat-value">{localStats.inProgress}</div>
            <div className="header-stat-label">In Progress</div>
          </div>
          <div className="header-stat-card">
            <div className="header-stat-value">{localStats.delivered}</div>
            <div className="header-stat-label">Delivered</div>
          </div>
          <div className="header-stat-card earnings">
            <div className="header-stat-value">₦{localStats.todayEarnings ? localStats.todayEarnings.toLocaleString() : '0'}</div>
            <div className="header-stat-label">Today's Earnings</div>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="dashboard-page-header mt-4 p-0">
        <div className="page-title-area">
          <h1>Dispatch Dashboard</h1>
          <p className="page-subtitle">Manage your deliveries and earnings</p>
        </div>


      </div>
      {/* Dispatch Stats */}

      {/* Today's Deliveries */}
      <div className="deliveries-section p-3 m-4">
        <div className="section-header">
          <h3>Assigned Deliveries</h3>
          <div className="delivery-filters">
            <button
              className={`filter-btn ${!filterStatus ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus(null);
                setCurrentPage(1);
              }}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('pending');
                setCurrentPage(1);
              }}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('confirmed');
                setCurrentPage(1);
              }}
            >
              Confirmed
            </button>
            <button
              className={`filter-btn ${filterStatus === 'ready_for_delivery' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('ready_for_delivery');
                setCurrentPage(1);
              }}
            >
              Ready
            </button>
            <button
              className={`filter-btn ${filterStatus === 'out_for_delivery' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('out_for_delivery');
                setCurrentPage(1);
              }}
            >
              Out for Delivery
            </button>
            <button
              className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus('delivered');
                setCurrentPage(1);
              }}
            >
              Delivered
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading orders...</span>
            </div>
            <p className="mt-2">Loading your assigned deliveries...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            <strong>Error!</strong> {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="alert alert-info" role="alert">
            <strong>No Deliveries</strong> No orders assigned to you yet.
          </div>
        ) : (
          <div className="deliveries-lis row">
            {orders.map((delivery, index) => (
              <div key={delivery.id || index} className="col-md-3">
                <div
                  className="delivery-card m-0 delivery-card-grid m-1"
                  onClick={() => navigate(`/dispatch/deliveries/${delivery.id}`)}
                >
                  <div className="delivery-info w-100 delivery-info-full">
                    <div className="delivery-id">#{delivery.id || delivery.order_number}</div>
                    <div className="customer-name">{delivery.customer_name || delivery.customer?.name || 'Unknown'}</div>
                    <div className="delivery-address">
                      {delivery.delivery_address || delivery.address || 'Address not provided'}
                    </div>
                  </div>

                  <div className="delivery-meta">
                    <div className='d-flex w-100 justify-content-between'>
                      <div className="delivery-time">
                        {new Date(delivery.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="delivery-amount">
                        ₦{parseFloat(delivery.total_amount || delivery.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="delivery-actions d-flex justify-content-between mt-3 align-items-center">
                    <div>
                      {(delivery.status === 'pending' || delivery.status === 'assigned') && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(delivery.id, 'in_progress');
                          }}
                        >
                          Start Delivery
                        </button>
                      )}
                      {delivery.status === 'in_progress' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(delivery.id, 'completed');
                          }}
                        >
                          Complete
                        </button>
                      )}
                      {delivery.status === 'completed' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dispatch/deliveries/${delivery.id}`);
                          }}
                        >
                          View Details
                        </button>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dispatch/deliveries/${delivery.id}`);
                        }}
                      >
                        Navigate
                      </button>
                    </div>
                    <div className="delivery-meta p-0">
                      <div className={`delivery-status ${delivery.status}`}>
                        {delivery.status?.replace('_', ' ').charAt(0).toUpperCase() + delivery.status?.replace('_', ' ').slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && pagination.lastPage > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            <span className="mx-2">
              Page {pagination.currentPage} of {pagination.lastPage}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* Map and Performance */}
      {/* <div className="dispatch-overview">
        <div className="map-section">
          <h3>Delivery Area</h3>
          <div className="map-placeholder" style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {orders && orders.length > 0 ? (
              <MapContainer 
                center={[
                  orders[0]?.delivery_latitude || 6.5244, 
                  orders[0]?.delivery_longitude || 3.3792
                ]} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {orders
                  .filter(order => order.status === 'pending' || order.status === 'assigned')
                  .map((order) => (
                    order.delivery_latitude && order.delivery_longitude && (
                      <Marker
                        key={`pending-${order.id}`}
                        position={[order.delivery_latitude, order.delivery_longitude]}
                        icon={L.icon({
                          iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23EF4444" width="32" height="32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>',
                          iconSize: [32, 32],
                          iconAnchor: [16, 32],
                          popupAnchor: [0, -32]
                        })}
                      >
                        <Popup>
                          <div style={{ fontSize: '12px', minWidth: '150px' }}>
                            <strong>Pending Delivery</strong><br/>
                            Order: #{order.id}<br/>
                            Customer: {order.customer_name}<br/>
                            Amount: ₦{parseFloat(order.total_amount || 0).toLocaleString()}
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}

                {orders
                  .filter(order => order.status === 'in_progress')
                  .map((order) => (
                    order.delivery_latitude && order.delivery_longitude && (
                      <Marker
                        key={`progress-${order.id}`}
                        position={[order.delivery_latitude, order.delivery_longitude]}
                        icon={L.icon({
                          iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23F97316" width="32" height="32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>',
                          iconSize: [32, 32],
                          iconAnchor: [16, 32],
                          popupAnchor: [0, -32]
                        })}
                      >
                        <Popup>
                          <div style={{ fontSize: '12px', minWidth: '150px' }}>
                            <strong>In Progress</strong><br/>
                            Order: #{order.id}<br/>
                            Customer: {order.customer_name}<br/>
                            Amount: ₦{parseFloat(order.total_amount || 0).toLocaleString()}
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}

                {orders
                  .filter(order => order.status === 'completed')
                  .map((order) => (
                    order.delivery_latitude && order.delivery_longitude && (
                      <Marker
                        key={`completed-${order.id}`}
                        position={[order.delivery_latitude, order.delivery_longitude]}
                        icon={L.icon({
                          iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322C55E" width="32" height="32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>',
                          iconSize: [32, 32],
                          iconAnchor: [16, 32],
                          popupAnchor: [0, -32]
                        })}
                      >
                        <Popup>
                          <div style={{ fontSize: '12px', minWidth: '150px' }}>
                            <strong>Completed</strong><br/>
                            Order: #{order.id}<br/>
                            Customer: {order.customer_name}<br/>
                            Amount: ₦{parseFloat(order.total_amount || 0).toLocaleString()}
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
              </MapContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f0f0' }}>
                <p>No delivery locations to display</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444' }}></div>
              <span>Pending</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#F97316' }}></div>
              <span>In Progress</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#22C55E' }}></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default DispatchDashboard;