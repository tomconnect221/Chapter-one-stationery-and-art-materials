import React from 'react';
import { Link } from 'react-router-dom';

const MobileMenu = ({ isOpen, onClose, categories }) => {
    if (!isOpen) return null;

    return (
        <div className="mobile-overlay" onClick={onClose}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                <div className="mobile-header">
                    <h3>Menu</h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="mobile-content">
                    <MobileNavList onClose={onClose} />
                    <MobileCategories categories={categories} onClose={onClose} />
                </div>
            </div>
        </div>
    );
};

const MobileNavList = ({ onClose }) => (
    <ul className="mobile-nav-list">
        <li><Link to="/" onClick={onClose}>Home</Link></li>
        <li><Link to="/shop" onClick={onClose}>Shop</Link></li>
        <li><Link to="/deals" onClick={onClose}>Today's Deals</Link></li>
        <li><Link to="/brands" onClick={onClose}>Brands</Link></li>
        <li><Link to="/contact" onClick={onClose}>Contact</Link></li>
        <li><Link to="/sell" onClick={onClose}>Sell on Store</Link></li>
        <li><Link to="/track-order" onClick={onClose}>Track Order</Link></li>
        <li><Link to="/help" onClick={onClose}>Help</Link></li>
    </ul>
);

const MobileCategories = ({ categories, onClose }) => (
    <div className="mobile-categories">
        <h4>Categories</h4>
        {categories
            .filter(cat => cat.is_active)
            .map(category => (
                <Link 
                    key={category.id} 
                    to={`/category/${category.id}`} 
                    className="mobile-category-item"
                    onClick={onClose}
                >
                    {category.name}
                </Link>
            ))
        }
    </div>
);

export default MobileMenu;