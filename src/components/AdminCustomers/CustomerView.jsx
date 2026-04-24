import React from 'react';
import './CustomerView.css';

const CustomerView = ({ customer, onBack, onEdit, canEdit }) => {
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
  const formatPrice = (price) => {
    if (!price) return '₦0.00';
    // Handle both price formats (with or without kobo kobo)
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₦${(numPrice / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };
  return (
    <div className="customer-view">
      {/* Header Section */}
      <div className="customer-view-header">
        <button className="back-button" onClick={onBack}>
          ← Back to List
        </button>
        {canEdit && (
          <button className="edit-button" onClick={() => onEdit(customer)}>
            ✏️ Edit Customer
          </button>
        )}
      </div>

      {/* Customer Profile Card */}
      <div className="customer-profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle-large">
              {customer?.name ? customer.name.charAt(0).toUpperCase() : '👤'}
            </div>
          </div>
          <div className="profile-info">
            <h1>{customer?.name || 'Unknown Customer'}</h1>
            <div className="profile-badges">
              <span className={`status-badge-large ${customer?.is_active ? 'active' : 'inactive'}`}>
                {customer?.is_active ? 'Active' : 'Inactive'}
              </span>
              {customer?.email_verified_at && (
                <span className="verified-badge-large">✓ Verified</span>
              )}
            </div>
            <div className="profile-meta">
              <span className="meta-item">📧 {customer?.email}</span>
              <span className="meta-item">📱 {customer?.phone || 'Not provided'}</span>
              <span className="meta-item">📅 Joined {formatDate(customer?.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="customer-stats-grid">
        <div className="stat-card-modern">
          <div className="stat-icon-modern">📦</div>
          <div className="stat-content">
            <div className="stat-value-modern">{customer?.orders_count || customer?.orders?.length || 0}</div>
            <div className="stat-label-modern">Total Orders</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="customer-content-grid">
        {/* Personal Information */}
        <div className="info-section">
          <div className="section-header">
            <span className="section-icon">👤</span>
            <h3>Personal Information</h3>
          </div>
          <div className="section-content">
            <div className="info-item">
              <label>Full Name</label>
              <span className="info-value">{customer?.name || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <span className="info-value">{customer?.email || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <span className="info-value">{customer?.phone || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Account Status</label>
              <span className={`status-pill ${customer?.is_active ? 'active' : 'inactive'}`}>
                {customer?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="info-section">
          <div className="section-header">
            <span className="section-icon">📍</span>
            <h3>Address Information</h3>
          </div>
          <div className="section-content">
            <div className="info-item">
              <label>Street Address</label>
              <span className="info-value">{customer?.address || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>City</label>
              <span className="info-value">{customer?.city || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>State</label>
              <span className="info-value">{customer?.state || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Postal Code</label>
              <span className="info-value">{customer?.postal_code || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="info-section">
          <div className="section-header">
            <span className="section-icon">📊</span>
            <h3>Account Details</h3>
          </div>
          <div className="section-content">
            <div className="info-item">
              <label>Customer ID</label>
              <span className="info-value">#{customer?.id || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Joined Date</label>
              <span className="info-value">{formatDate(customer?.created_at)}</span>
            </div>
            <div className="info-item">
              <label>Last Updated</label>
              <span className="info-value">{formatDate(customer?.updated_at)}</span>
            </div>
            {customer?.email_verified_at && (
              <div className="info-item">
                <label>Email Verified</label>
                <span className="info-value verified">{formatDate(customer?.email_verified_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Addresses */}
      {customer?.shipping_addresses && customer.shipping_addresses.length > 0 && (
        <div className="info-section">
          <div className="section-header">
            <span className="section-icon">🚚</span>
            <h2>Shipping Addresses ({customer.shipping_addresses.length})</h2>
          </div>
          <div className="shipping-addresses-grid">
            {customer.shipping_addresses.map((address, index) => (
              <div key={index} className={`shipping-address-card ${address.is_default ? 'default' : ''}`}>
                {address.is_default && <span className="default-badge">Default</span>}
                <div className="address-detail">
                  <label>Address</label>
                  <span>{address.address}</span>
                </div>
                <div className="address-detail">
                  <label>City</label>
                  <span>{address.city}</span>
                </div>
                <div className="address-detail">
                  <label>State</label>
                  <span>{address.state}</span>
                </div>
                <div className="address-detail">
                  <label>Postal Code</label>
                  <span>{address.postal_code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {customer?.orders && customer.orders.length > 0 && (
        <div className="orders-section">
          <div className="section-header">
            <span className="section-icon">📦</span>
            <h2>Recent Orders ({customer.orders.length})</h2>
          </div>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Date</th>
                  <th>Subtotal</th>
                  <th>Tax</th>
                  <th>Delivery Fee</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Delivery Address</th>
                  <th>Delivery Phone</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order, index) => (
                  <tr key={index}>
                    <td className="order-id">#{order.order_number || order.id}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td className="order-total">{order.subtotal}</td>
                    <td className="order-total">{order.tax_amount}</td>
                    <td className="order-total">{order.delivery_fee}</td>
                    <td className="order-total">{order.total_amount}</td>
                    <td>
                      <span className={`order-status status-${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`payment-status ${order.payment_status?.toLowerCase()}`}>
                        {order.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td className="delivery-address">{order.delivery_address || 'N/A'}</td>
                    <td>{order.delivery_phone || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {(!customer?.orders || customer.orders.length === 0) && (
        <div className="empty-orders-section">
          <div className="empty-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>This customer hasn't placed any orders yet.</p>
        </div>
      )}
    </div>
  );
};
export default CustomerView;
