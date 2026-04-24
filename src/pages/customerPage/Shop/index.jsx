import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist as toggleWishlistAction } from '../../../store/wishlistSlice';
import { addToCart as addToCartAction } from '../../../store/cartSlice';
import useProductSearch from '../../../hooks/useProductSearch';
import useCategories from '../../../hooks/useCategories';
import './style.css';
import 'animate.css';
import ProductItem from '../../../component/productItem/template';
import { toast } from 'react-toastify';

function useQuery() {
    const location = useLocation();
    return new URLSearchParams(location.search);
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 100000;

const Shop = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const wishlist = useSelector(state => (state.wishlist && state.wishlist.ids) || []);

    const initialCategory = query.get('category') || '';
    const initialSearch = query.get('search') || '';
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [page, setPage] = useState(1);
    const [minPrice, setMinPrice] = useState(Number(query.get('minPrice') || DEFAULT_MIN_PRICE));
    const [maxPrice, setMaxPrice] = useState(Number(query.get('maxPrice') || DEFAULT_MAX_PRICE));
    const [sortBy, setSortBy] = useState('recommended');

    const {
        categories = [],
        loading: loadingCategories
    } = useCategories();

    const {
        products = [],
        loading: loadingProducts,
        error: productsError,
        pagination = {},
        formatPrice
    } = useProductSearch({
        page,
        limit: 12,
        searchQuery: searchQuery,
        categoryId: selectedCategory,
        minPrice,
        maxPrice,
        sortBy,
        brands: selectedBrands
    });

    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        else params.delete('category');
        if (searchQuery) params.set('search', searchQuery);
        else params.delete('search');
        if (minPrice !== DEFAULT_MIN_PRICE) params.set('minPrice', String(minPrice));
        else params.delete('minPrice');
        if (maxPrice !== DEFAULT_MAX_PRICE) params.set('maxPrice', String(maxPrice));
        else params.delete('maxPrice');
        navigate({ search: params.toString() }, { replace: true });
    }, [selectedCategory, searchQuery, minPrice, maxPrice, navigate]);

    useEffect(() => {
        setPage(1);
    }, [selectedCategory, searchQuery, minPrice, maxPrice, sortBy, selectedBrands]);

    useEffect(() => {
        if (pagination && page > pagination.lastPage) {
            setPage(1);
        }
    }, [pagination, page]);

    const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);

    const toggleBrand = (b) => setSelectedBrands(prev =>
        prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );

    const resetFilters = () => {
        setSelectedCategory('');
        setSelectedBrands([]);
        setMinPrice(DEFAULT_MIN_PRICE);
        setMaxPrice(DEFAULT_MAX_PRICE);
        setSearchQuery('');
        setSortBy('recommended');
        setPage(1);
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        setPage(1);
    };

    const handleSearchSubmit = () => {
        setPage(1);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const isWishlisted = (id) => wishlist.includes(id);
    const toggleWishlist = (id) => dispatch(toggleWishlistAction(id));
    const cartItems = useSelector(state => (state.cart && state.cart.items) || []);
    const addToCart = (product) => {
        const exists = cartItems.find(i => i.id === product.id);
        if (exists) {
            toast.info('Product already in cart');
            return;
        }
        dispatch(addToCartAction(product));
        toast.success('Product added to cart');
    };

    return (
        <div className="shop-container">
            <div className="shop-controls p-0">
                <div className="container-flui verticalLimit">
                    <div className="row align-items-center pt-4">
                        <div className="col-lg-3">
                            <nav aria-label="breadcrumb">
                                <ol className="shop-breadcrumb pt-3">
                                    <li className="breadcrumb-item">
                                        <Link to="/" className="breadcrumb-link text-dark">Home</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">Shop</li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col-lg-5">
                            <div className="hero-search d-flex justify-content-center">
                                <div className="search-wrapper">
                                    <input
                                        type="text"
                                        className="hero-search-input"
                                        placeholder="Search for products, brands, or categories..."
                                        value={searchQuery}
                                        onChange={e => handleSearch(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                    <button
                                        className="hero-search-btn"
                                        onClick={handleSearchSubmit}
                                    >
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="controls-right">
                                <div className="sort-filter-controls">
                                    <select
                                        className="sort-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="recommended">Recommended</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                        <option value="newest">Newest First</option>
                                        <option value="rating">Highest Rated</option>
                                    </select>
                                    <button className="filter-toggle d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#shopFiltersOffcanvas">
                                        <i className="fas fa-filter"></i>
                                        <span>Filters</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="shop-main verticalLimit">
                <div className="container-flui">
                    <div className="row">
                        <aside className="col-xl-3 col-lg-4 d-none d-lg-block">
                            <div className="filters-sidebar">
                                <div className="filters-header">
                                    <h4 className="filters-title">
                                        <i className="fas fa-filter"></i>
                                        Filters
                                    </h4>
                                    <button className="clear-filters" onClick={resetFilters}>
                                        <i className="fas fa-times"></i>
                                        Clear All
                                    </button>
                                </div>

                                <div className="filter-group">
                                    <h5 className="filter-group-title">
                                        <i className="fas fa-th-large"></i>
                                        Categories
                                    </h5>
                                    <div className="category-list">
                                        <div
                                            className={`category-item ${!selectedCategory ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory('')}
                                        >
                                            <span className="category-name">All Categories</span>
                                            <span className="category-count">{categories?.length || 0}</span>
                                        </div>
                                        {categories
                                            .filter(category => category.is_active)
                                            .map(category => (
                                                <div
                                                    key={category.id}
                                                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                                                    onClick={() => setSelectedCategory(category.id)}
                                                >
                                                    <span className="category-name">{category.name}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <h5 className="filter-group-title">
                                        <i className="fas fa-dollar-sign"></i>
                                        Price Range
                                    </h5>
                                    <div className="price-filter">
                                        <div className="price-inputs">
                                            <div className="price-input-group">
                                                <label>Min Price</label>
                                                <input
                                                    type="number"
                                                    className="price-input"
                                                    value={minPrice}
                                                    onChange={e => setMinPrice(Number(e.target.value) || DEFAULT_MIN_PRICE)}
                                                    min={DEFAULT_MIN_PRICE}
                                                    max={DEFAULT_MAX_PRICE}
                                                />
                                            </div>
                                            <div className="price-input-group">
                                                <label>Max Price</label>
                                                <input
                                                    type="number"
                                                    className="price-input"
                                                    value={maxPrice}
                                                    onChange={e => setMaxPrice(Number(e.target.value) || DEFAULT_MAX_PRICE)}
                                                    min={DEFAULT_MIN_PRICE}
                                                    max={DEFAULT_MAX_PRICE}
                                                />
                                            </div>
                                        </div>
                                        <div className="price-range">
                                            <div
                                                className="price-slider-track"
                                                style={{
                                                    background: `linear-gradient(to right, #e0e0e0 0%, #667eea ${(minPrice / DEFAULT_MAX_PRICE) * 100}%, #667eea ${(maxPrice / DEFAULT_MAX_PRICE) * 100}%, #e0e0e0 100%)`
                                                }}
                                            ></div>
                                            <input
                                                type="range"
                                                min={DEFAULT_MIN_PRICE}
                                                max={DEFAULT_MAX_PRICE}
                                                value={minPrice}
                                                onChange={e => {
                                                    const v = Number(e.target.value);
                                                    if (v <= maxPrice) setMinPrice(v);
                                                }}
                                                className="price-slider min-slider"
                                            />
                                            <input
                                                type="range"
                                                min={DEFAULT_MIN_PRICE}
                                                max={DEFAULT_MAX_PRICE}
                                                value={maxPrice}
                                                onChange={e => {
                                                    const v = Number(e.target.value);
                                                    if (v >= minPrice) setMaxPrice(v);
                                                }}
                                                className="price-slider max-slider"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <h5 className="filter-group-title">
                                        <i className="fas fa-tag"></i>
                                        Brands
                                    </h5>
                                    <div className="brand-list">
                                        {brands.map(brand => (
                                            <label key={brand} className="brand-item">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(brand)}
                                                    onChange={() => toggleBrand(brand)}
                                                />
                                                <span className="brand-name">{brand}</span>
                                                <span className="brand-count">
                                                    ({products.filter(p => p.brand === brand).length})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <main className="col-xl-9 col-lg-8">
                            <div className="products-section">
                                {(selectedBrands.length > 0 || selectedCategory || minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE || searchQuery) && (
                                    <div className="active-filters">
                                        <div className="active-filters-header">
                                            <span className="filters-label">Active Filters:</span>
                                            <button className="clear-all-filters" onClick={resetFilters}>
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="active-filters-list">
                                            {searchQuery && (
                                                <span className="filter-tag">
                                                    Search: "{searchQuery}"
                                                    <button onClick={() => setSearchQuery('')}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </span>
                                            )}
                                            {selectedCategory && categories.length > 0 && (
                                                <span className="filter-tag">
                                                    Category: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                                                    <button onClick={() => setSelectedCategory('')}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </span>
                                            )}
                                            {selectedBrands.map(brand => (
                                                <span key={brand} className="filter-tag">
                                                    {brand}
                                                    <button onClick={() => toggleBrand(brand)}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </span>
                                            ))}
                                            {(minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE) && (
                                                <span className="filter-tag">
                                                    Price: ₦{minPrice.toLocaleString()} - ₦{maxPrice.toLocaleString()}
                                                    <button onClick={() => {
                                                        setMinPrice(DEFAULT_MIN_PRICE);
                                                        setMaxPrice(DEFAULT_MAX_PRICE);
                                                    }}>
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="shop-products-grid">
                                    {loadingProducts ? (
                                        <div className="loading-container">
                                            <div className="loading-spinner"></div>
                                            <p>Loading products...</p>
                                        </div>
                                    ) : products.length > 0 ? (
                                        <>
                                            <div className="row">
                                                {products.map(product => {
                                                    const hasDiscount = product.price_after_ad_discount && parseFloat(product.price_after_ad_discount) < parseFloat(product.price);
                                                    const discountAmount = hasDiscount ? parseFloat(product.price) - parseFloat(product.price_after_ad_discount) : 0;
                                                    const discountPercentage = hasDiscount ? Math.round((discountAmount / parseFloat(product.price)) * 100) : 0;
                                                    const isPromo = product.ads && product.ads.length > 0;

                                                    return (
                                                        <ProductItem
                                                            view={'shop'}
                                                            key={product.id}
                                                            product={{
                                                                ...product,
                                                                originalPrice: parseFloat(product.price),
                                                                displayPrice: formatPrice(product.price),
                                                                discountedPrice: hasDiscount ? parseFloat(product.price_after_ad_discount) : parseFloat(product.price),
                                                                displayDiscountedPrice: hasDiscount ? formatPrice(product.price_after_ad_discount) : formatPrice(product.price),
                                                                hasDiscount: hasDiscount,
                                                                discountPercentage: discountPercentage,
                                                                discountAmount: discountAmount,
                                                                isPromo: isPromo,
                                                            }}
                                                            onAddToCart={addToCart}
                                                            onToggleWishlist={toggleWishlist}
                                                            isWishlisted={isWishlisted(product.id)}
                                                        />
                                                    );
                                                })}
                                            </div>

                                            {pagination && pagination.lastPage > 1 && (
                                                <div className="products-pagination">
                                                    <nav aria-label="Products pagination">
                                                        <ul className="pagination">
                                                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                                <button
                                                                    className="page-link"
                                                                    onClick={() => setPage(page - 1)}
                                                                    disabled={page === 1}
                                                                >
                                                                    <i className="fas fa-chevron-left"></i>
                                                                </button>
                                                            </li>
                                                            {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                                                                let pageNum;
                                                                if (pagination.lastPage <= 5) {
                                                                    pageNum = i + 1;
                                                                } else if (page <= 3) {
                                                                    pageNum = i + 1;
                                                                } else if (page >= pagination.lastPage - 2) {
                                                                    pageNum = pagination.lastPage - 4 + i;
                                                                } else {
                                                                    pageNum = page - 2 + i;
                                                                }
                                                                return (
                                                                    <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                                                                        <button className="page-link" onClick={() => setPage(pageNum)}>
                                                                            {pageNum}
                                                                        </button>
                                                                    </li>
                                                                );
                                                            })}
                                                            <li className={`page-item ${page === pagination.lastPage ? 'disabled' : ''}`}>
                                                                <button
                                                                    className="page-link"
                                                                    onClick={() => setPage(page + 1)}
                                                                    disabled={page === pagination.lastPage}
                                                                >
                                                                    <i className="fas fa-chevron-right"></i>
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </nav>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="no-products">
                                            <div className="no-products-icon">
                                                <i className="fas fa-search"></i>
                                            </div>
                                            <h3 className="no-products-title">
                                                {searchQuery ? 'No products found for your search' : 'No products found'}
                                            </h3>
                                            <p className="no-products-text">
                                                {searchQuery
                                                    ? `No products found for "${searchQuery}". Try adjusting your search terms.`
                                                    : 'Try adjusting your filters to find what you\'re looking for.'
                                                }
                                            </p>
                                            <button className="btn btn-primary" onClick={resetFilters}>
                                                <i className="fas fa-refresh"></i>
                                                {searchQuery ? 'Clear Search' : 'Reset Filters'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            <div className="offcanvas  offcanvas-start" style={{ zIndex: '99999999999999' }} id="shopFiltersOffcanvas" aria-labelledby="shopFiltersOffcanvasLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="shopFiltersOffcanvasLabel">
                        <i className="fas fa-filter"></i>
                        Filters
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <div className="mobile-filters">
                        <div className="mobile-filter-group">
                            <h6>Search</h6>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="mobile-filter-group">
                            <h6>Categories</h6>
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="form-control"
                                disabled={loadingCategories}
                            >
                                <option value="">All Categories</option>
                                {loadingCategories ? (
                                    <option value="" disabled>Loading categories...</option>
                                ) : (
                                    categories
                                        .filter(category => category.is_active)
                                        .map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))
                                )}
                            </select>
                        </div>

                        <div className="mobile-filter-group">
                            <h6>Price Range</h6>
                            <div className="price-inputs-mobile row">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={e => setMinPrice(Number(e.target.value) || DEFAULT_MIN_PRICE)}
                                    className="form-control col"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(Number(e.target.value) || DEFAULT_MAX_PRICE)}
                                    className="form-control col"
                                />
                            </div>
                            <div className="price-range">
                                <div
                                    className="price-slider-track"
                                    style={{
                                        background: `linear-gradient(to right, #e0e0e0 0%, #667eea ${(minPrice / DEFAULT_MAX_PRICE) * 100}%, #667eea ${(maxPrice / DEFAULT_MAX_PRICE) * 100}%, #e0e0e0 100%)`
                                    }}
                                ></div>
                                <input
                                    type="range"
                                    min={DEFAULT_MIN_PRICE}
                                    max={DEFAULT_MAX_PRICE}
                                    value={minPrice}
                                    onChange={e => {
                                        const v = Number(e.target.value);
                                        if (v <= maxPrice) setMinPrice(v);
                                    }}
                                    className="price-slider min-slider"
                                />
                                <input
                                    type="range"
                                    min={DEFAULT_MIN_PRICE}
                                    max={DEFAULT_MAX_PRICE}
                                    value={maxPrice}
                                    onChange={e => {
                                        const v = Number(e.target.value);
                                        if (v >= minPrice) setMaxPrice(v);
                                    }}
                                    className="price-slider max-slider"
                                />
                            </div>
                            <div className="price-display-mobile">
                                ₦{minPrice.toLocaleString()} - ₦{maxPrice.toLocaleString()}
                            </div>
                        </div>

                        <div className="mobile-filter-group">
                            <h6>Brands</h6>
                            {brands.slice(0, 6).map(b => (
                                <label key={b} className="brand-checkbox-mobile">
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.includes(b)}
                                        onChange={() => toggleBrand(b)}
                                    />
                                    {b}
                                </label>
                            ))}
                        </div>

                        <div className="mobile-filter-actions">
                            <button className="btn btn-outline-secondary w-100 mb-2" onClick={resetFilters}>
                                Reset Filters
                            </button>
                            <button className="btn btn-primary w-100" data-bs-dismiss="offcanvas">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;

