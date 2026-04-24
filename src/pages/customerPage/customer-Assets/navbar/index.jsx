import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../../../component/Auth/AuthContext';
import useCategories from '../../../../hooks/useCategories';
import useNavbarSearch from '../../../../hooks/useNavbarSearch';
import MobileBottomNav from './MobileBottomNav';
import siteDarkLogo from '/assets/image/dark_logo.png';
import siteLightLogo from '/assets/image/light_logo.png';
import './navbarstyling.css';
import useSettings from '../../../../hooks/useSettings';
import WhatsAppButton from '../../../../component/WhatsAppButton';
const Navbar = ({ onOpenAuth }) => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 992);
    const searchRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const { categories, loading: loadingCategories } = useCategories();
    const navigate = useNavigate();
    // Check if we're on the shop page
    const isShopPage = location.pathname === '/shop' || location.pathname.startsWith('/shop');

    // Check if we're on the homepage
    const isHomepage = location.pathname === '/';

    // On mobile: hide entire header when not on homepage
    // On desktop: header is always visible (search hidden below via isHomepage)
    const shouldHideHeader = isMobileView && !isHomepage;

    // Track window resize for mobile view detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 992);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const cartItems = useSelector(state => state.cart.items);
    const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => {
        const price = typeof item.product.price === 'number'
            ? item.product.price
            : parseFloat(String(item.product.price).replace(/[^0-9.]/g, '')) || 0;
        return sum + (price * item.qty);
    }, 0);
    const { isAuthenticated, user, logout } = useAuth();
    const { settings, isLoading: settingsLoading } = useSettings();
    // { console.log(user) }
    // Use the navbar search hook
    const { products, loading: searchLoading, error } = useNavbarSearch(debouncedSearch, 6);

    // Debug: Log search state
    useEffect(() => {
        console.log('🔄 Search State:', {
            searchText,
            debouncedSearch,
            productsCount: products?.length || 0,
            loading: searchLoading,
            error
        });
    }, [searchText, debouncedSearch, products, searchLoading, error]);

    // Debounce search input
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (searchText.trim().length > 0) {
            debounceTimerRef.current = setTimeout(() => {
                setDebouncedSearch(searchText.trim());
            }, 500);
        } else {
            setDebouncedSearch('');
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchText]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Format number to Nigerian currency
    const formatNumber = useCallback((number) => {
        const n = parseFloat(String(number).replace(/[^0-9.]/g, '')) || 0;
        return n.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }, []);

    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault();
        if (searchText.trim()) {
            setShowSearchDropdown(false);
            window.location.href = `/shop?search=${encodeURIComponent(searchText.trim())}`;
        }
    }, [searchText]);

    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchText(value);

        if (value.length > 0) {
            setShowSearchDropdown(true);
        } else {
            setShowSearchDropdown(false);
        }
    }, []);

    const handleProductSelect = useCallback((product) => {
        setSearchText(product.name);
        setShowSearchDropdown(false);
        window.location.href = `/product/${product.id}`;
    }, []);

    const handleViewAllResults = useCallback(() => {
        setShowSearchDropdown(false);
        window.location.href = `/shop?search=${encodeURIComponent(searchText.trim())}`;
    }, [searchText]);

    // Sticky Navbar Logic
    const [showNavbar, setShowNavbar] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                // Scrolling down & past header -> hide
                setShowNavbar(false);
            } else {
                // Scrolling up -> show
                setShowNavbar(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

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
        setIsMenuOpen(false);
    };

    return (
        <>
            <div className={`navbar-wrapper ${showNavbar ? 'visible' : 'hidden'}`}>
                {/* Top Bar - Jumia Style */}
{settings && <div className="jumia-top-bar bg-dark">
                    <div className="navbar-container">
                        <div className="top-bar-content bg-da">
                            <div className="top-left ">
                                <Link to="/" className="text-light  top-bar-link">
                                    <i className="text-light  fab fa-phone"></i>{settings.store_email}
                                </Link>
                                <Link to="/" className="text-light  top-bar-link">
                                    <i className="text-light  fas fa-envelope"></i>{settings.store_phone}
                                </Link>
                            </div>
                            <div className="top-right">
                                {settings.facebook && <Link to={settings.facebook} className="text-light  top-bar-link">
                                    <i className="text-light  fab fa-facebook"></i>
                                </Link>}
                                {settings.instagram && <Link to={settings.instagram} className="text-light  top-bar-link">
                                    <i className="text-light  fab fa-instagram"></i>
                                </Link>}
                                {settings.twitter && <Link to={settings.twitter} className="text-light  top-bar-link">
                                    <i className="text-light  fab fa-x"></i>
                                </Link>}
                                <Link to="/" className="text-light  top-bar-link">
                                    <i className="text-light  fab fa-linkedin"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>}

{/* Main Header - Hidden on mobile shop page */}
                {!shouldHideHeader && (
                    <header className="jumia-main-header">
                        <div className="navbar-container">
                            <div className="chaterone_header_row ">
                                {/* Logo */}
                                <div className="chapterone_logo_section">
                                    <Link to="/" className="chapter-logo">
                                        <img src={siteLightLogo} alt="chapter one Logo" />
                                    </Link>
                                </div>

                                {/* Search Bar with Dropdown - Homepage only */}
                                {isHomepage && (
                                    <div className="chapterone-search-section" ref={searchRef}>
                                        <form onSubmit={handleSearchSubmit} className="chapterone-search-form">
                                            <div className="search-input-wrapper">
                                                <input
                                                    type="text"
                                                    placeholder="Search products, brands and categories"
                                                    value={searchText}
                                                    onChange={handleSearchChange}
                                                    onFocus={() => searchText.length > 0 && setShowSearchDropdown(true)}
                                                    className="chapterone-search-input"
                                                    style={{ border: '0px', outline: '0px', margin: '0px', padding: '0px 10px 0px 50px ' }}
                                                />
                                                <i className="fas fa-search"></i>
                                            </div>
                                            {/* Search Dropdown */}
                                            {showSearchDropdown && (
                                                <div className="search-dropdown">
                                                    <div className="search-dropdown-content">
                                                        {searchLoading && debouncedSearch.length > 0 ? (
                                                            <div className="search-loading">
                                                                <div className="spinner-small"></div>
                                                                <span>Searching products...</span>
                                                            </div>
                                                        ) : error ? (
                                                            <div className="search-error">
                                                                <i className="fas fa-exclamation-circle"></i>
                                                                <span>Search unavailable</span>
                                                                <small>Try browsing categories instead</small>
                                                            </div>
                                                        ) : products && products.length > 0 ? (
                                                            <>
                                                                <div className="search-results-header">
                                                                    <span>Products</span>
                                                                    <small>{products.length} results</small>
                                                                </div>
                                                                <div className="search-results-list">
                                                                    {products.map(product => (
                                                                        <div
                                                                            key={product.id}
                                                                            className="search-result-item"
                                                                            onClick={() => handleProductSelect(product)}
                                                                        >
                                                                            <div className="product-image" style={{ width: '50px', height: '50px', overflow: 'hidden', flexShrink: 0, objectFit: 'cover', borderRadius: '4px' }}>
                                                                                <img
                                                                                    style={{ width: '100%' }}
                                                                                    src={`${import.meta.env.VITE_API_URL}/${product.image}`}
                                                                                    alt={product.name}
                                                                                    onError={(e) => {
                                                                                        e.target.src = '/assets/image/placeholder-product.jpg';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div className="product-inf w-100">
                                                                                <div className="product-name">{product.name}</div>
                                                                                <div className="product-price">
                                                                                    {formatNumber(product.price)}
                                                                                </div>
                                                                                {product.category && (
                                                                                    <div className="product-category">
                                                                                        {product.category.name}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="search-dropdown-footer">
                                                                    <button
                                                                        className="view-all-results"
                                                                        onClick={handleViewAllResults}
                                                                    >
                                                                        View all results for "{searchText}"
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : debouncedSearch.length > 0 && !searchLoading ? (
                                                            <div className="search-no-results">
                                                                <i className="fas fa-search"></i>
                                                                <div>
                                                                    <div>No products found</div>
                                                                    <small>Try different keywords or browse categories</small>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="search-placeholder">
                                                                <i className="fas fa-search"></i>
                                                                <div>
                                                                    <div>Start typing to search</div>
                                                                    <small>Enter product name, brand, or category</small>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                )}

                                {/* User Actions */}
                                <div className="chatpterone_user_actions user-actions-nav">
                                    {/* Account Dropdown */}
                                    <div className="action-item dropdown account-dropdown">
                                        <div
                                            className="action-link dropdown-toggle bg-none"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                            style={{ background: 'none' }}
                                        >
                                            <i className="far fa-user text-light"></i>
                                            <div className="action-text ">
                                                <span className="greeting text-light">
                                                    {isAuthenticated ? 'Hello,' : 'Hello, Sign in'}
                                                </span>
                                                <span className="label text-light">
                                                    {isAuthenticated ? user?.name?.split(' ')[0] : 'My Account'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="dropdown-menu account-menu" style={{ width: '300px' }}>
                                            {isAuthenticated ? (
                                                <>
                                                    <div className="user-welcome">
                                                        Hello, {user?.name}
                                                    </div>
                                                    <Link to="/account" className="dropdown-item">
                                                        <i className="fas fa-user-circle"></i> My Account
                                                    </Link>
                                                    <Link to="/account/orders" className="dropdown-item">
                                                        <i className="fas fa-shopping-bag"></i> Orders
                                                    </Link>
                                                    <Link to="/wishlist" className="dropdown-item">
                                                        <i className="far fa-heart"></i> Wishlist
                                                    </Link>
                                                    <div className="dropdown-divider"></div>
                                                    <button onClick={logout} className="dropdown-item logout-btn">
                                                        <i className="fas fa-sign-out-alt"></i> Sign Out
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="auth-options ">
                                                        <p>Welcome</p>
                                                        <button onClick={() => onOpenAuth('signin')} className="auth-btn primary">
                                                            Sign In
                                                        </button>
                                                        <div className="auth-divider">
                                                            <span>New customer?</span>
                                                        </div>
                                                        <button onClick={() => onOpenAuth('signup')} className="auth-btn secondary">
                                                            Start Here
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cart */}
                                    <div className="action-item cart-item text-light" >
                                        <Link to="/cart" className="action-link cart-link" style={{ background: 'none' }}>
                                            <div className="cart-icon-wrapper">
                                                <i className="fas fa-shopping-cart text-light"></i>
                                                {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
                                            </div>
                                            <div className="action-text">
                                                <span className="label text-light">Cart</span>
                                                <span className="price text-light">{formatNumber(totalAmount)}</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )}
                {/* Navigation Menu */}
                <nav className="jumia-nav-menu " >
                    <div className="navbar-container">
                        <div className="nav-row align-items-center d-flex  justify-content-between ">
                            {/* Categories Dropdown */}
                            <div className="categories-dropdown dropdown">
                                <button
                                    className="categories-btn dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <i className="fas fa-bars"></i>
                                    <span>All Categories</span>
                                </button>
                                <div className="dropdown-menu categories-dropdown-menu">
                                    <div className="categories-gri">
                                        {categories.filter(cat => cat.is_active).map(category => (
                                            <Link
                                                key={category.id}
                                                to={`/shop?category=${category.id}`}
                                                className="dropdown-item category-item d-flex justify-content-start"
                                            >
                                                <i className="fas fa-chevron-right mr-4"></i>
                                                {category.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Navigation Links */}
                            <ul className="nav-links pt-3 " style={{ maxWidth: 'fit-content' }}>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/shop" className="deals-link">
                                    <i className="fas fa-bolt"></i>Today's Deals
                                </Link></li>
                                <li><Link to="/branches">Branches</Link></li>
                                <li><Link to="/about-us">About us</Link></li>
                            </ul>
                            <div className="mobile_logo">
                                <Link to={'./'}>
                                    <img src={siteDarkLogo} alt="Chapter one Logo" />
                                </Link>
                            </div>
                            {/* Mobile Menu Toggle */}
                            <button
                                className="mobile-menu-toggle"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <i className="fas fa-bars"></i>
                            </button>

                        </div>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}>
                    <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-menu-header">
                            <div className="mobile-user">
                                {isAuthenticated ? (
                                    <div className="mobile-user-info">
                                        <i className="far fa-user"></i>
                                        <span>Hello, {user?.name?.split(' ')[0]}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            onOpenAuth('signin');
                                        }}
                                        className="mobile-signin-btn"
                                    >
                                        Sign In
                                    </button>
                                )}
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="mobile-menu-content">
                            <ul className="mobile-menu-list p-0">
                                <h5>Dashboard navigation</h5>
                                {isAuthenticated && (
                                    <div>
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
                                        <div 
                                            className="mobile-nav-item logout" 
                                            onClick={() => {
                                                logout();
                                                setIsMenuOpen(false);
                                            }}
                                        >
                                            <span className="nav-icon">🚪</span>
                                            <span className="nav-text">Logout</span>
                                        </div>
                                    </div>

                                )}
                              
                                <li><Link to="/branches" onClick={() => setIsMenuOpen(false)}>Branches</Link></li>
                                <li><Link to="/branches" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
                                <li><Link to="/about-us" onClick={() => setIsMenuOpen(false)}>About us</Link></li>
                            </ul>
                            <div className="mobile-menu-categories">
                                <h4>All product categories</h4>
                                {categories.filter(cat => cat.is_active).map(category => (
                                    <Link
                                        key={category.id}
                                        to={`/shop?category=${category.id}`}
                                        className="mobile-category-item"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav onOpenAuth={onOpenAuth} />
            <WhatsAppButton />
        </>
    );
};

export default Navbar;