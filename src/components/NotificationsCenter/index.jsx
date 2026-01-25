import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useNotifications from '../../hooks/useNotifications';
import './NotificationsCenter.css';

const NotificationsCenter = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const userType = user?.role || 'admin';

  const {
    notifications,
    stats,
    criticalNotifications,
    loading,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchByCategory
  } = useNotifications(userType);

  const [activeTab, setActiveTab] = useState('all');
  const [categoryNotifications, setCategoryNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Handle category click
  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    const items = await fetchByCategory(category);
    setCategoryNotifications(items);
    setActiveTab('category');
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      order: '📦',
      payment: '💰',
      alert: '⚠️',
      critical: '🚨',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[type] || '📬';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const notificationList =
    activeTab === 'all'
      ? notifications
      : activeTab === 'critical'
      ? criticalNotifications
      : categoryNotifications;

  return (
    <div className="notifications-center">
      {/* Header */}
      <div className="nc-header">
        <h2>Notifications</h2>
        <button className="nc-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Stats */}
      <div className="nc-stats">
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-item highlight">
          <div className="stat-value">{stats.unread}</div>
          <div className="stat-label">Unread</div>
        </div>
        <div className="stat-item critical">
          <div className="stat-value">{stats.critical}</div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat-item warning">
          <div className="stat-value">{stats.high}</div>
          <div className="stat-label">High</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="nc-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory(null);
          }}
        >
          All
        </button>
        <button
          className={`tab ${activeTab === 'critical' ? 'active' : ''}`}
          onClick={() => setActiveTab('critical')}
        >
          🚨 Critical ({criticalNotifications.length})
        </button>
        {stats.by_category && stats.by_category.length > 0 && (
          <div className="category-tabs">
            {stats.by_category.map((cat) => (
              <button
                key={cat.category}
                className={`tab category ${selectedCategory === cat.category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.category)}
              >
                {cat.category} ({cat.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="nc-actions">
        <button
          className="btn btn-sm btn-outline"
          onClick={markAllAsRead}
          disabled={stats.unread === 0 || loading}
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="nc-list">
        {loading ? (
          <div className="nc-loading">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notificationList.length === 0 ? (
          <div className="nc-empty">
            <div className="empty-icon">📭</div>
            <p>No notifications</p>
          </div>
        ) : (
          <>
            {notificationList.map((notification) => (
              <div
                key={notification.id}
                className={`nc-item ${notification.unread ? 'unread' : ''} priority-${notification.priority}`}
              >
                <div className="nc-item-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="nc-item-content">
                  <div className="nc-item-title">
                    {notification.title}
                    {notification.unread && <span className="unread-badge">New</span>}
                  </div>
                  <div className="nc-item-message">{notification.message}</div>
                  <div className="nc-item-meta">
                    <span className="nc-time">{formatDate(notification.created_at)}</span>
                    <span className="nc-category">{notification.category}</span>
                  </div>
                </div>
                <div className="nc-item-actions">
                  {notification.unread && (
                    <button
                      className="btn-action read"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn-action delete"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {activeTab === 'all' && pagination.last_page > 1 && (
        <div className="nc-pagination">
          <button
            className="btn btn-sm"
            onClick={() => fetchNotifications(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
          >
            ← Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.last_page}
          </span>
          <button
            className="btn btn-sm"
            onClick={() => fetchNotifications(pagination.page + 1)}
            disabled={pagination.page === pagination.last_page || loading}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
