import React from 'react';
import './RiderView.css';

const RiderView = ({ rider, onBack, onEdit, canEdit }) => {
  const getVehicleIcon = (type) => {
    const icons = {
      bike: '🏍️',
      car: '🚗',
      van: '🚐',
      bicycle: '🚲'
    };
    return icons[type] || '🚗';
  };

  const getStatusColor = (status) => {
    const colors = {
      online: '#28a745',
      offline: '#6c757d',
      busy: '#ffc107',
      available: '#d6e9ec'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      online: 'status-online',
      offline: 'status-offline',
      busy: 'status-busy',
      available: 'status-available'
    };
    return classes[status] || 'status-offline';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="rider-view">
      {/* Header Section */}
      <div className="rider-view-header">
        <button className="back-button" onClick={onBack}>
          ← Back to List
        </button>
        {canEdit && (
          <button className="edit-button" onClick={() => onEdit(rider)}>
            ✏️ Edit Rider
          </button>
        )}
      </div>

      {/* Rider Profile Card */}
      <div className="rider-profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle-large">
              {rider?.name ? rider.name.charAt(0).toUpperCase() : '👤'}
            </div>
          </div>
          <div className="profile-info">
            <h1>{rider?.name || 'Unknown Rider'}</h1>
            <div className="profile-badges">
              <span className={`status-badge-large text-light ${getStatusBadgeClass(rider?.status)}`}>
                <span className="status-dot" style={{ backgroundColor: getStatusColor(rider?.status) }}></span>
                {rider?.status || 'Unknown'}
              </span>
              <span className={`account-status ${rider?.is_active ? 'active' : 'inactive'}`}>
                {rider?.is_active ? '✅ Active Account' : '❌ Inactive Account'}
              </span>
            </div>
            <div className="profile-meta">
              <span className="meta-item">📧 {rider?.email}</span>
              <span className="meta-item">📱 {rider?.phone || 'Not provided'}</span>
              <span className="meta-item">🚗 {getVehicleIcon(rider?.vehicle_type)} {rider?.vehicle_type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="rider-stats-grid">
        <div className="stat-card-modern">
          <div className="stat-icon-modern">📦</div>
          <div className="stat-content">
            <div className="stat-value-modern">{rider?.orders_count || rider?.orders?.length || 0}</div>
            <div className="stat-label-modern">Total Deliveries</div>
          </div>
        </div>
       
      
      </div>

      {/* Content Grid */}
      <div className="rider-content-grid">
        {/* Personal Information */}
        <div className="info-section">
          <div className="section-header">
            <span className="section-icon">👤</span>
            <h2>Personal Information</h2>
          </div>
          <div className="section-content">
            <div className="info-item">
              <label>Full Name</label>
              <span className="info-value">{rider?.name || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <span className="info-value">{rider?.email || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <span className="info-value">{rider?.phone || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Account Status</label>
              <span className={`status-pill ${rider?.is_active ? 'active' : 'inactive'}`}>
                {rider?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="info-section">
          <div className="section-header">
            <span className="section-icon">🚗</span>
            <h2>Vehicle Information</h2>
          </div>
          <div className="section-content">
            <div className="info-item">
              <label>License Number</label>
              <span className="info-value license-number">{rider?.license_number || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Vehicle Type</label>
              <span className="info-value">
                {getVehicleIcon(rider?.vehicle_type)} {rider?.vehicle_type || 'Not provided'}
              </span>
            </div>
            <div className="info-item">
              <label>Vehicle Number</label>
              <span className="info-value vehicle-number">{rider?.vehicle_number || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="info-section">
          <div className="section-header">
            <span className="section-icon">📊</span>
            <h2>Account Details</h2>
          </div>
          <div className="section-content">
            <div className="info-item">
              <label>Rider ID</label>
              <span className="info-value">#{rider?.id || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Joined Date</label>
              <span className="info-value">{formatDate(rider?.created_at)}</span>
            </div>
            <div className="info-item">
              <label>Last Updated</label>
              <span className="info-value">{formatDate(rider?.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {rider?.orders && rider.orders.length > 0 && (
        <div className="orders-section">
          <div className="section-header">
            <span className="section-icon">📦</span>
            <h2>Recent Deliveries ({rider.orders.length})</h2>
          </div>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Date</th>
                  {/* <th>Customer</th> */}
                  <th>Delivery Address</th>
                  <th>Status</th>
                  <th>Delivered At</th>
                </tr>
              </thead>
              <tbody>
                {rider.orders.map((order, index) => (
                  <tr key={index}>
                    <td className="order-id">#{order.order_number || order.id}</td>
                    <td>{formatDate(order.created_at)}</td>
                    {/* <td>{order.customer_name || 'N/A'}</td> */}
                    <td className="delivery-address">{order.delivery_address || 'N/A'}</td>
                    <td>
                      <span className={`order-status status-${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatDate(order.delivered_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {(!rider?.orders || rider.orders.length === 0) && (
        <div className="empty-orders-section">
          <div className="empty-icon">📦</div>
          <h3>No Deliveries Yet</h3>
          <p>This rider hasn't made any deliveries yet.</p>
        </div>
      )}
    </div>
  );
};

export default RiderView;
