// components/DashboardNavbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateUserStatus } from '../../../../store/authSlice';
import LogoutModal from '../../../../components/LogoutModal';
import NotificationsCenter from '../../../../components/NotificationsCenter';
import axios from 'axios';
import { toast } from 'react-toastify';
import './DashboardNavbar.css'
const DashboardNavbar = ({ userType, sidebarOpen, onToggleSidebar, onToggleMobileSidebar }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [messagesDropdownOpen, setMessagesDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [notificationsCenterOpen, setNotificationsCenterOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Refs for dropdowns to handle outside clicks
  const userDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  const messagesDropdownRef = useRef(null);

  // Get cart count from Redux store
  const cartItems = useSelector((state) => state.cart?.items || []);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get user data from Redux auth state
  const { user, token } = useSelector((state) => state.auth);
  console.log(token);
  // Notifications state (fetched from API for admin/subadmin)
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      // Only fetch for admin or subadmin
      let endpoint = null;
      if (userType === 'admin') endpoint = '/api/admin/notifications';
      else if (userType === 'subadmin') endpoint = '/api/subadmin/notifications';
      if (!endpoint) return;

      setNotifLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // The API returns { success, data: { current_page, data: [...], ... } }
        const list = res.data?.data?.data || [];

        const items = list.map((item) => ({
          id: item.id || item.notification_id || Math.random(),
          title: item.title || item.subject || item.message || 'Notification',
          message: item.message || item.body || '',
          time: item.created_at ? new Date(item.created_at).toLocaleString() : '',
          type: item.type || 'info',
          unread: item.read_at ? false : true,
          raw: item
        }));

        setNotifications(items);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
        toast.error('Failed to load notifications');
      } finally {
        setNotifLoading(false);
      }
    };

    fetchNotifications();
  }, [token, userType]);

  const messages = [
    {
      id: 1,
      sender: 'John Customer',
      message: 'When will my order be delivered?',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      sender: 'Sarah Admin',
      message: 'Inventory report is ready',
      time: '30 minutes ago',
      unread: true
    },
    {
      id: 3,
      sender: 'Mike Rider',
      message: 'Delivery completed successfully',
      time: '2 hours ago',
      unread: false
    }
  ];

  // Use actual user data or fallback to defaults
  const userInfo = {
    name: user?.name || (userType === 'admin' ? 'Super Admin' : userType === 'subadmin' ? 'Sub Admin' : userType === 'rider' ? 'Rider' : 'Dispatch Rider'),
    branch: user?.branch || null,
    role: user?.role || userType,
    email: user?.email || ''
  };

  const userMenuItems = {
    admin: [
      { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/admin/products', icon: '📦', label: 'Products' },
      { path: '/admin/orders', icon: '✅', label: 'Orders' },
      { path: '/admin/customers', icon: '👥', label: 'Customers' },
      { path: '/admin/categories', icon: '📁', label: 'Categories' },
      { path: '/admin/brands', icon: '🏷️', label: 'Brands' },
      { path: '/admin/inventory', icon: '📊', label: 'Inventory' },
      { path: '/admin/branches', icon: '🏢', label: 'Branches' },
      { path: '/admin/riders', icon: '🏍️', label: 'Dispatch Riders' },
      { path: '/admin/subadmins', icon: '👨‍💼', label: 'Sub Admins' },
      { path: '/admin/profile', icon: '👤', label: 'Profile' },
      { path: '/admin/settings', icon: '⚙️', label: 'Settings' }
    ],
    subadmin: [
      { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/admin/products', icon: '📦', label: 'Products' },
      { path: '/admin/orders', icon: '✅', label: 'Orders' },
      { path: '/admin/inventory', icon: '📊', label: 'Inventory' },
      { path: '/admin/riders', icon: '🏍️', label: 'Dispatch Riders' },
      { path: '/admin/customers', icon: '👥', label: 'Customers' },
      { path: '/admin/branches', icon: '🏢', label: 'My Branch' },
      { path: '/admin/profile', icon: '👤', label: 'Profile' },
      { path: '/admin/settings', icon: '⚙️', label: 'Settings' }
    ],
    rider: [
      { path: '/dispatch/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/dispatch/deliveries', icon: '🚚', label: 'My Deliveries' },
      { path: '/dispatch/profile', icon: '👤', label: 'Profile' }
    ],
    dispatch: [
      { path: '/dispatch/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/dispatch/deliveries', icon: '🚚', label: 'My Deliveries' },
      { path: '/dispatch/schedule', icon: '📅', label: 'Schedule' },
      { path: '/dispatch/profile', icon: '👤', label: 'Profile' },
      { path: '/dispatch/settings', icon: '⚙️', label: 'Settings' }
    ]
  };

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
        setNotificationsDropdownOpen(false);
      }
      if (messagesDropdownRef.current && !messagesDropdownRef.current.contains(event.target)) {
        setMessagesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      dispatch(logout());
      setTimeout(() => {
        const loginPath = userType === 'rider' || userType === 'dispatch' ? '/dispatch/login' : '/admin/login';
        navigate(loginPath);
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutLoading(false);
      setLogoutModalOpen(false);
    }
  };

  const cancelLogout = () => {
    setLogoutModalOpen(false);
  };

  // Rider status toggle function
  const handleStatusToggle = async () => {
    if (userType !== 'rider' && userType !== 'dispatch') return;

    setStatusLoading(true);
    try {
      const newStatus = user?.status === 'available' ? 'offline' : 'available';
      const formData = new URLSearchParams();
      formData.append('status', newStatus);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/rider/status`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Status updated successfully');
        dispatch(updateUserStatus({ status: response.data.data.status }));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setStatusLoading(false);
    }
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setNotificationsDropdownOpen(false);
    setMessagesDropdownOpen(false);
  };

  const toggleNotificationsDropdown = () => {
    setNotificationsDropdownOpen(!notificationsDropdownOpen);
    setUserDropdownOpen(false);
    setMessagesDropdownOpen(false);
  };

  const toggleMessagesDropdown = () => {
    setMessagesDropdownOpen(!messagesDropdownOpen);
    setUserDropdownOpen(false);
    setNotificationsDropdownOpen(false);
  };

  const unreadNotificationsCount = notifications.filter(n => n.unread).length;
  const unreadMessagesCount = messages.filter(m => m.unread).length;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm border-bottom sticky-top">
      <div className="container-fluid">
        {/* Left Section - Logo and Toggle */}
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary border-0 d-none d-lg-block"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>

          <Link to="/" className="navbar-brand ms-2 ms-lg-3 fw-bold text-dark">
            Chapter 0ne<span className="text-primary">.</span>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="btn btn-outline-secondary border-0 d-lg-none"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle mobile menu"
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Right Section - Actions */}
        <div className="d-flex align-items-center ms-auto">
          {/* Rider Status Toggle */}
          {(userType === 'rider' || userType === 'dispatch') && (
            <div className="me-3">
              <button
                className={`btn btn-sm ${user?.status === 'available' ? 'btn-success' : 'btn-secondary'} ${statusLoading ? 'disabled' : ''}`}
                onClick={handleStatusToggle}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className={`fas fa-circle me-1 ${user?.status === 'available' ? 'text-white' : 'text-light'}`} style={{ fontSize: '8px' }}></i>
                    {user?.status === 'available' ? 'Available' : 'Offline'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* User Info - Desktop */}
          <div className="d-none d-md-block me-3 text-end">
            <div className="fw-semibold text-dark">{userInfo.name}</div>
            {userInfo.branch && (
              <small className="text-muted">📍 {userInfo.branch}</small>
            )}
          </div>

          {/* Cart Counter */}
          {cartCount > 0 && (
            <div className="dropdown me-2">
              <button className="btn btn-outline-secondary position-relative border-0">
                <i className="fas fa-shopping-cart"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              </button>
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="dropdown me-2" ref={notificationsDropdownRef}>
            <button
              style={{width:'100px'}}
              className="btn btn-outline-secondary position-relative border-0"
              onClick={() => setNotificationsCenterOpen(true)}
              aria-label="Notifications"
            >
              <i className="fas fa-bell"></i>
              {unreadNotificationsCount > 0 && (
                <span style={{padding:'5px', borderRadius:'30px'}}  className="position-absolute  badge bg-danger">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <div className={`dropdown-menu dropdown-menu-end p-0 ${notificationsDropdownOpen ? 'show' : ''}`} style={{ minWidth: '320px' }}>
              <div className="dropdown-header bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-semibold">Notifications</h6>
                  {unreadNotificationsCount > 0 && (
                    <span className="badge bg-danger">{unreadNotificationsCount} new</span>
                  )}
                </div>
              </div>

              <div className="dropdown-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`dropdown-item d-flex align-items-start p-3 border-bottom ${notification.unread ? 'bg-light' : ''}`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center ${notification.unread ? 'text-primary' : 'text-muted'}`}>
                        {notification.type === 'order' && '📦'}
                        {notification.type === 'alert' && '⚠️'}
                        {notification.type === 'payment' && '💰'}
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="fw-semibold">{notification.title}</div>
                      <div className="text-muted small">{notification.message}</div>
                      <div className="text-muted smaller">{notification.time}</div>
                    </div>
                    {notification.unread && (
                      <div className="flex-shrink-0">
                        <span className="badge bg-primary rounded-pill p-1"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="dropdown-footer bg-light p-2">
                <button className="btn btn-primary btn-sm w-100">View All Notifications</button>
              </div>
            </div>
          </div>


          {/* User Dropdown */}
          <div className="dropdown" ref={userDropdownRef}>
            <button
              className="btn btn-outline-secondary border-0 d-flex align-items-center"
              onClick={toggleUserDropdown}
              aria-label="User menu"
            >
              <img
                src="/images/resource/user.png"
                alt="User"
                className="rounded-circle me-2"
                width="32"
                height="32"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0Y1RjVGNSIvPgo8cGF0aCBkPSJNMTYgMTZDMTcuNjU2OSAxNiAxOSAxNC42NTY5IDE5IDEzQzE5IDExLjM0MzEgMTcuNjU2OSAxMCAxNiAxMEMxNC4zNDMxIDEwIDEzIDExLjM0MzEgMTMgMTNDMTMgMTQuNjU2OSAxNC4zNDMxIDE2IDE2IDE2WiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTYgMTcuNUMxOC40ODUzIDE3LjUgMjAuNSAxOS4zNjA5IDIwLjUgMjEuNVYyM0gxMS41VjIxLjVDMTEuNSAxOS4zNjA5IDEzLjUxNDcgMTcuNSAxNiAxNy41WiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4=';
                }}
              />
              <i className="fas fa-chevron-down small"></i>
            </button>

            <div className={`dropdown-menu dropdown-menu-end ${userDropdownOpen ? 'show' : ''}`} style={{ minWidth: '250px' }}>
              <div className="dropdown-header">
                <div className="d-flex align-items-center">
                  <img
                    src="/images/resource/user.png"
                    alt={userInfo.name}
                    className="rounded-circle me-3"
                    width="48"
                    height="48"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y1RjVGNSIvPgo8cGF0aCBkPSJNMjQgMjRDMjYuMjA5MSAyNCAyOCAyMi4yMDkxIDI4IDIwQzI4IDE3Ljc5MDkgMjYuMjA5MSAxNiAyNCAxNkMyMS43OTA5IDE2IDIwIDE3Ljc5MDkgMjAgMjBDMjAgMjIuMjA5MSAyMS43OTA5IDI0IDI0IDI0WiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMjQgMjZDMjcuMzEzNyAyNiAzMCAyNy43OTAyIDMwIDMwVjMySDE4VjMwQzE4IDI3Ljc5MDIgMjAuNjg2MyAyNiAyNCAyNloiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';
                    }}
                  />
                  <div>
                    <div className="fw-semibold">{userInfo.name}</div>
                    <div className="text-muted small text-capitalize">{userInfo.role}</div>
                    {userInfo.branch && (
                      <div className="text-primary small">📍 {userInfo.branch}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <div>
                {userMenuItems[userType]?.map((item) => (
                  <Link
                    key={item.path}
                    className="dropdown-item d-flex align-items-center"
                    to={item.path}
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <span className="me-2">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="dropdown-divider"></div>

              <button
                className="dropdown-item d-flex align-items-center text-danger"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        userName={userInfo.name}
        userRole={userInfo.role}
        isLoading={logoutLoading}
      />

      {/* Notifications Center Modal */}
      {notificationsCenterOpen && (
        <NotificationsCenter onClose={() => setNotificationsCenterOpen(false)} />
      )}
    </nav>
  );
};

export default DashboardNavbar;