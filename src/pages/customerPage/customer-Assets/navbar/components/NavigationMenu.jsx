import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useCategories from '../../../../../hooks/useCategories';

const NavigationMenu = () => {
    const [showCategories, setShowCategories] = useState(false);
    const { categories } = useCategories();

    return (
        <div className="jumia-nav-menu">
            <div className="navbar-container">
                <div className="nav-row">
                    <CategoriesDropdown 
                        categories={categories}
                        showCategories={showCategories}
                        onToggle={() => setShowCategories(!showCategories)}
                    />
                    <NavLinks />
                    <QuickLinks />
                </div>
            </div>
        </div>
    );
};

const CategoriesDropdown = ({ categories, showCategories, onToggle }) => (
    <div className="categories-dropdown">
        <button className="categories-btn" onClick={onToggle}>
            <i className="fas fa-bars"></i>
            <span>All Categories</span>
            <i className={`fas fa-chevron-${showCategories ? 'up' : 'down'}`}></i>
        </button>
        {showCategories && (
            <div className="categories-dropdown-menu">
                {categories
                    .filter(cat => cat.is_active)
                    .map(category => (
                        <Link 
                            key={category.id} 
                            to={`/category/${category.id}`} 
                            className="category-item"
                        >
                            {category.name}
                        </Link>
                    ))
                }
            </div>
        )}
    </div>
);

const NavLinks = () => (
    <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/shop">Shop</Link></li>
        <li><Link to="/deals" className="deals-link">Today's Deals</Link></li>
        <li><Link to="/brands">Brands</Link></li>
        <li><Link to="/contact">Contact</Link></li>
    </ul>
);

const QuickLinks = () => (
    <div className="quick-links">
        <Link to="/sell">Sell on Store</Link>
        <Link to="/track-order">Track Order</Link>
    </div>
);

export default NavigationMenu;