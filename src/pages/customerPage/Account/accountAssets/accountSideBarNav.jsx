import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../../store/authSlice';
import LogoutModal from '../../../../components/LogoutModal';
import './AccountSidebar.css';
const AccountSidebar = ({ user }) => {
    const { user: authUser } = useSelector(state => state.auth);
    const currentUser = authUser || user;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        {
            path: '/account',
            label: 'Account Details',
            icon: '📊',
            active: location.pathname === '/account'
        },
        {
            path: '/account/orders',
            label: 'Orders',
            icon: '✅',
            active: location.pathname === '/account/orders'
        },
        {
            path: '/account/address',
            label: 'Address',
            icon: '📍',
            active: location.pathname === '/account/address'
        },
  
        {
            path: '/account/invoices',
            label: 'Invoices',
            icon: '🧾',
            active: location.pathname === '/account/invoices'
        },
          {
            path: '/wishlist',
            label: 'Wishlist',
            icon: '🧾',
            active: location.pathname === '/wishlist'
        }

    ];

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);
        try {
            // Simulate logout delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch(logout());
            setShowLogoutModal(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            {/* Mobile Navigation Bar */}
            <div className='col-lg-2'>
                <div className="dashboard-mobile-nav ">
                    <div className="mobile-nav-dropdown">
                        <button className="mobile-nav-btn" onClick={toggleMobileMenu}>
                            <span className="menu-icon">☰</span>
                            Dashboard Navigation
                        </button>

                        <div className={`mobile-nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                            {menuItems.map((item) => (
                                <div
                                    key={item.path}
                                    className={`mobile-nav-item ${item.active ? 'active' : ''}`}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {item.label}
                                </div>
                            ))}
                            <div className="mobile-nav-item logout" onClick={handleLogoutClick}>
                                <span className="nav-icon">🚪</span>
                                Logout
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Sidebar */}
                <div className="account-sidebar">
                    <div className="sidebar-user-info">
                        {/* <div className="user-avatar">
                            <img
                                src={currentUser?.avatar || '/images/team/ad-thumb.png'}
                                alt={currentUser?.name || 'User'}
                                onError={(e) => {
                                    // e.target.src = 'https://via.placeholder.com/60x60?text=USER';
                                }}
                            />
                        </div> */}
                        <div className="user-details">
                            Navigations
                            {/* <h5 className="user-name" title={currentUser?.name || 'Guest User'}>
                                {currentUser?.name ? (currentUser.name.length > 15 ? currentUser.name.substring(0, 15) + '...' : currentUser.name) : 'Guest User'}
                            </h5>
                            <a className="user-email" href={`mailto:${currentUser?.email}`} title={currentUser?.email || 'user@example.com'}>
                                {currentUser?.email ? (currentUser.email.length > 15 ? currentUser.email.substring(0, 15) + '...' : currentUser.email) : 'user@example.com'}
                            </a> */}
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <ul className="nav-menu">
                            {menuItems.map((item) => (
                                <li key={item.path} className="nav-ite mb-2">
                                    <div
                                        className={`nav-link ${item.active ? 'active' : ''}`}
                                        onClick={() => handleNavigation(item.path)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-text">{item.label}</span>
                                    </div>
                                </li>
                            ))}
                            <li className="nav-ite">
                                <div className="nav-link logout" onClick={handleLogoutClick}>
                                    <span className="nav-icon">🚪</span>
                                    <span className="nav-text">Logout</span>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
                userName={currentUser?.name || 'User'}
                userRole="Customer"
                isLoading={isLoggingOut}
            />
        </>
    );
};

export default AccountSidebar;