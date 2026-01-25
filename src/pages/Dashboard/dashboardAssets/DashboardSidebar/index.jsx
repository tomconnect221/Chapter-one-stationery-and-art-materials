// components/DashboardSidebar.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../../store/authSlice';
import LogoutModal from '../../../../components/LogoutModal';
import './DashboardSidebar.css';

const DashboardSidebar = ({ userType, isOpen, isMobileOpen, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Get user data from Redux auth state
  const { user } = useSelector((state) => state.auth);

  const menuItems = {
    admin: [
      { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/admin/products', icon: '📦', label: 'Products' },
      { path: '/admin/categories', icon: '📁', label: 'Product categories' },
     // { path: '/admin/brands', icon: '🏷️', label: 'Brands' },
      { path: '/admin/orders', icon: '✅', label: 'Orders' },
      { path: '/admin/customers', icon: '👥', label: 'Customers' },
   
      { path: '/admin/branches', icon: '🏢', label: 'Branches' },
      { path: '/admin/riders', icon: '🏍️', label: 'Dispatch Riders' },
      { path: '/admin/subadmins', icon: '👨‍💼', label: 'Sub Admins' },
      { path: '/admin/profile', icon: '👤', label: 'Profile' },
      { path: '/admin/settings', icon: '⚙️', label: 'Settings' }
    ],
    subadmin: [
      { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
      { path: '/admin/products', icon: '📦', label: 'Products' },
      { path: '/admin/categories', icon: '📁', label: 'Categories' },
      { path: '/admin/orders', icon: '✅', label: 'Orders' },
         { path: '/admin/inventory', icon: '📊', label: 'Inventory' },
      // { path: '/admin/riders', icon: '🏍️', label: 'Dispatch Riders' },
      // { path: '/admin/customers', icon: '👥', label: 'Customers' },
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

  const handleNavigation = (path) => {
    navigate(path);
    onCloseMobile();
  };

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      // Dispatch logout action to clear Redux state
      dispatch(logout());

      // Small delay for smooth UX
      setTimeout(() => {
        // Redirect to login page based on user type
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  const currentMenuItems = menuItems[userType] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-mobile-overlay"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isOpen ? 'open' : 'collapsed'} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3 className="sidebar-title">
              {userType === 'admin' ? 'Admin Panel' : userType === 'subadmin' ? 'Sub Admin Panel' : 'Rider Panel'}
            </h3>
          </div>

          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              {currentMenuItems.map((item) => (
                <li key={item.path} className="sidebar-item">
                  <button
                    className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                  </button>
                </li>
              ))}
              
              {/* Logout Button */}
              <li className="sidebar-item logout-item">
                <button className="sidebar-link logout" onClick={handleLogout}>
                  <span className="sidebar-icon">🚪</span>
                  <span className="sidebar-label">Logout</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* User Info at Bottom */}
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar-small">
                <img
                  src="/images/resource/user.png"
                  alt="User"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiByeD0iNiIgZmlsbD0iI0Y1RjVGNSIvPgo8cGF0aCBkPSJNMTUgMTVDMTYuNjU2OSAxNSAxOCAxMy42NTY5IDE4IDEyQzE4IDEwLjM0MzEgMTYuNjU2OSA5IDE1IDlDMTMuMzQzMSA5IDEyIDEwLjM0MzEgMTIgMTJDMTIgMTMuNjU2OSAxMy4zNDMxIDE1IDE1IDE1WiIgZmlsbD0iIzk5OTk5OSIvPgo8cGF0aCBkPSJNMTUgMTdDMTcuNDg1MyAxNyAxOS41OTU0IDE4LjUyNjIgMTkuOTIxOSAyMEgxMC4wNzgxQzEwLjQwNDYgMTguNTI2MiAxMi41MTQ3IDE3IDE1IDE3WiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4=';
                  }}
                />
              </div>
              <div className="user-details">
                <div className="user-name">
                  {user?.name || (userType === 'admin' ? 'Super Admin' : userType === 'subadmin' ? 'Branch Manager' : userType === 'rider' ? 'Rider' : 'Dispatch Rider')}
                </div>
                <div className="user-role">
                  {user?.role || userType}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        userName={user?.name || 'User'}
        userRole={user?.role || userType}
        isLoading={logoutLoading}
      />
    </>
  );
};

export default DashboardSidebar;