import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../../../component/Auth/AuthContext';
import './MobileBottomNav.css';

const MobileBottomNav = ({ onOpenAuth }) => {
    const location = useLocation();
    const cartItems = useSelector(state => state.cart.items);
    const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const { isAuthenticated, user } = useAuth();
    const isCustomer = isAuthenticated && user?.role === 'customer';

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            icon: 'fas fa-home',
            path: '/',
            active: location.pathname === '/'
        },
        {
            id: 'categories',
            label: 'Shop',
            icon: 'fas fa-th-large',
            path: '/shop',
            active: location.pathname === '/shop' || location.pathname.startsWith('/category')
        },
        {
            id: 'branches',
            label: 'Branches',
            icon: 'fas fa-tags',
            path: '/branches',
            active: location.pathname === '/branches'
        },
        {
            id: 'cart',
            label: 'Cart',
            icon: 'fas fa-shopping-cart',
            path: '/cart',
            active: location.pathname === '/cart',
            badge: totalQty
        },
        {
            id: 'account',
            label: isAuthenticated ? 'Account' : 'Sign In',
            icon: 'fas fa-user',
            path: isAuthenticated ? '/account' : '#',
            active: location.pathname === '/account' || location.pathname.startsWith('/profile'),
            onClick: !isAuthenticated ? () => onOpenAuth('signin') : null
        }
    ];

    return (
        <div className="mobile-bottom-nav">
            <div className="nav-container">
                {navItems.map(item => {
                    const NavComponent = item.onClick ? 'button' : Link;
                    const navProps = item.onClick 
                        ? { onClick: item.onClick }
                        : { to: item.path };

                    return (
                        <NavComponent
                            key={item.id}
                            className={`nav-item ${item.active ? 'active' : ''}`}
                            {...navProps}
                        >
                            <div className="nav-icon">
                                <i className={item.icon}></i>
                                {item.badge > 0 && (
                                    <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                                )}
                            </div>
                            <span className="nav-label">{item.label}</span>
                        </NavComponent>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileBottomNav;