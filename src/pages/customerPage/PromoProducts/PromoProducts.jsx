import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { addToCart as addToCartAction } from '../../../store/cartSlice';
import { toggleWishlist as toggleWishlistAction } from '../../../store/wishlistSlice';
import ProductItem from '../../../component/productItem/template';
import 'react-toastify/dist/ReactToastify.css';
import './PromoProducts.css';

// Countdown Timer Component
const CountdownTimer = ({ targetDate, label }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const timerComponents = [];

    if (timeLeft.days > 0) {
        timerComponents.push(
            <div className="countdown-unit" key="days">
                <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="countdown-label">Days</span>
            </div>
        );
    }

    timerComponents.push(
        <div className="countdown-unit" key="hours">
            <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="countdown-label">Hrs</span>
        </div>
    );

    timerComponents.push(
        <div className="countdown-unit" key="minutes">
            <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="countdown-label">Mins</span>
        </div>
    );

    timerComponents.push(
        <div className="countdown-unit" key="seconds">
            <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="countdown-label">Secs</span>
        </div>
    );

    return (
        <div className="countdown-timer">
            {label && <div className="countdown-label-text">{label}</div>}
            <div className="countdown-display">
                {timerComponents}
            </div>
        </div>
    );
};

const calculateTimeLeft = (targetDate) => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
};

const PromoProducts = () => {
    const { id } = useParams(); // Get ad ID from URL parameter
    const dispatch = useDispatch();
    const cartItems = useSelector(state => (state.cart && state.cart.items) || []);
    const wishlist = useSelector(state => (state.wishlist && state.wishlist.ids) || []);
    const [adDetails, setAdDetails] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDiscount, setSelectedDiscount] = useState('all');
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000000);
    const [sortBy, setSortBy] = useState('recommended');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;
    
    useEffect(() => {
        if (id) {
            fetchPromoProducts();
        }
    }, [id]);

    const fetchPromoProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch ad details from endpoint: GET /api/ads/{id}
            const adDetailResponse = await axios.get(`${apiUrl}/api/ads/${id}`);

            if (adDetailResponse.data.success) {
                const adData = adDetailResponse.data.data;
                console.log('0202002002002020',adData);
                setAdDetails(adData);

                // Debug: Log ad data to see what we're getting
                console.log('Ad Data:', adData);

                // Get discount type and value from ad - handle both string and number types
                const discountType = adData.discount_type || adData.discountType || null;
                const discountValue = adData.discount_value || adData.discountValue || 0;

                console.log('Discount Type:', discountType, 'Discount Value:', discountValue);

                // Get products from the ad
                if (adData.products && adData.products.length > 0) {
                    // Map products with discount info from the ad
                    const productsWithDiscount = adData.products.map(product => {
                        const originalPrice = parseFloat(product.price) || 0;
                        
                        // Check if product already has a discount applied (from product level or ad level)
                        // Priority: price_after_ad_discount (from ad pivot) > discounted_price > discountedPrice > sale_price
                        const productHasOwnDiscount = product.price_after_ad_discount || 
                                                      product.discounted_price || 
                                                      product.discountedPrice || 
                                                      product.sale_price;
                        
                        let discountedPrice = null;
                        let discountPercentage = 0;
                        let discountAmount = 0;
                        
                        if (productHasOwnDiscount) {
                            // Use product's own discount (price_after_ad_discount comes from ad pivot)
                            discountedPrice = parseFloat(product.price_after_ad_discount || 
                                                        product.discounted_price || 
                                                        product.discountedPrice || 
                                                        product.sale_price);
                            discountAmount = originalPrice - discountedPrice;
                            discountPercentage = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;
                        } else if (discountType && discountValue) {
                            // Calculate discounted price from ad discount settings
                            discountedPrice = calculateDiscountedPrice(
                                product.price,
                                discountType,
                                discountValue
                            );
                            discountPercentage = getDiscountPercentage(
                                product.price,
                                discountType,
                                discountValue
                            );
                            discountAmount = originalPrice - (discountedPrice ? parseFloat(discountedPrice) : originalPrice);
                        }

                        // Format prices for display
                        const formatPrice = (price) => {
                            return new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN',
                                maximumFractionDigits: 0
                            }).format(price);
                        };

                        // Debug: Log product pricing
                        console.log('Product:', product.name, 'Price:', originalPrice, 'Discounted:', discountedPrice, 'Has Discount:', !!discountedPrice);

                        // Determine if there's a valid discount
                        const hasValidDiscount = discountedPrice !== null && 
                                                 discountedPrice !== undefined && 
                                                 discountedPrice !== 'null' && 
                                                 discountedPrice < originalPrice;

                        return {
                            ...product,
                            // Ensure name field exists (use title if name is not available)
                            name: product.name || product.title || 'Unnamed Product',
                            // Price fields
                            originalPrice: originalPrice,
                            price: originalPrice,
                            discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
                            discountAmount: discountAmount,
                            discountPercentage: discountPercentage,
                            hasDiscount: hasValidDiscount,
                            // Display formatted prices
                            displayPrice: formatPrice(originalPrice),
                            displayDiscountedPrice: discountedPrice ? formatPrice(parseFloat(discountedPrice)) : null,
                            // Promo info
                            isPromo: true,
                            ad_discount_type: discountType,
                            ad_discount_value: discountValue,
                            ad_end_date: adData.ends_at, // Pass ad end date for expiration check
                            adTitle: adData.title
                        };
                    });
                    
                    console.log('Products with discount:', productsWithDiscount);
                    setProducts(productsWithDiscount);
                } else {
                    setProducts([]);
                }
            } else {
                setError('No promotion found.');
            }
        } catch (err) {
            console.error('Failed to fetch promo products:', err);
            setError('Failed to load promotional products. Please try again later.');
            toast.error('Failed to load promotional products');
        } finally {
            setLoading(false);
        }
    };

    const calculateDiscountedPrice = (originalPrice, discountType, discountValue) => {
        if (!discountType || !discountValue) return null;

        const original = parseFloat(originalPrice);
        const discount = parseFloat(discountValue);

        if (discountType === 'percent') {
            return (original * (1 - discount / 100)).toFixed(2);
        } else if (discountType === 'fixed') {
            return Math.max(0, original - discount).toFixed(2);
        }
        return null;
    };

    const getDiscountPercentage = (originalPrice, discountType, discountValue) => {
        if (!discountType || !discountValue) return 0;

        const original = parseFloat(originalPrice);
        const discount = parseFloat(discountValue);

        if (discountType === 'percent') {
            return Math.round(discount);
        } else if (discountType === 'fixed') {
            return Math.round((discount / original) * 100);
        }
        return 0;
    };

    const getSavingsAmount = (originalPrice, discountType, discountValue) => {
        if (!discountType || !discountValue) return 0;

        const original = parseFloat(originalPrice);
        const discount = parseFloat(discountValue);

        if (discountType === 'percent') {
            return (original * discount / 100).toFixed(2);
        } else if (discountType === 'fixed') {
            return parseFloat(discountValue).toFixed(2);
        }
        return 0;
    };

    const handleAddToCart = (product) => {
        const exists = cartItems.find(i => i.id === product.id);
        if (exists) {
            toast.info('Product already in cart');
            return;
        }
        dispatch(addToCartAction(product));
        toast.success('Product added to cart!');
    };

    const isWishlisted = (id) => wishlist.includes(id);

    // Get unique values for filters from products
    const allBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    const allColors = Array.from(new Set(products.flatMap(product =>
        product.variants?.length ? product.variants.map(variant => variant.color) : [product.color]
    ).filter(Boolean)));
    const allSizes = Array.from(new Set(products.flatMap(product =>
        product.variants?.length ? product.variants.map(variant => variant.size) : [product.size]
    ).filter(Boolean)));
    
    // Price range from products
    const prices = products.map(p => parseFloat(p.price));
    const productMinPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const productMaxPrice = prices.length > 0 ? Math.max(...prices) : 1000000;
    
    // Filter toggle functions
    const toggleBrand = (brand) => {
        setSelectedBrands(prev => 
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };
    
    const toggleColor = (color) => {
        setSelectedColors(prev => 
            prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
        );
    };
    
    const toggleSize = (size) => {
        setSelectedSizes(prev => 
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };
    
    const resetFilters = () => {
        setSearchQuery('');
        setSelectedBrands([]);
        setSelectedColors([]);
        setSelectedSizes([]);
        setMinPrice(productMinPrice);
        setMaxPrice(productMaxPrice);
        setSortBy('recommended');
    };

    // Apply all filters
    const applyFilters = (productsToFilter) => {
        let filtered = [...productsToFilter];
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name?.toLowerCase().includes(query) || 
                p.brand?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
        }
        
        // Brand filter
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(p => selectedBrands.includes(p.brand));
        }
        
        // Color filter
        if (selectedColors.length > 0) {
            filtered = filtered.filter(product => product.variants?.length
                ? product.variants.some(variant => selectedColors.includes(variant.color))
                : product.color && selectedColors.includes(product.color));
        }
        
        // Size filter
        if (selectedSizes.length > 0) {
            filtered = filtered.filter(product => product.variants?.length
                ? product.variants.some(variant => selectedSizes.includes(variant.size))
                : product.size && selectedSizes.includes(product.size));
        }
        
        // Price filter
        filtered = filtered.filter(p => {
            const price = parseFloat(p.price);
            return price >= minPrice && price <= maxPrice;
        });
        
        // Sort
        if (sortBy === 'price_asc') {
            filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === 'price_desc') {
            filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }
        
        return filtered;
    };

    const filteredProducts = applyFilters(selectedDiscount === 'all' ? products : products.filter(p => p.ad_discount_type === selectedDiscount));

    // Get banner image URL
    const getBannerImage = () => {
        if (!adDetails) return null;
        if (adDetails.media_url_full) return adDetails.media_url_full;
        if (adDetails.mockUrl) return adDetails.mockUrl;
        if (adDetails.media_url) return `${apiUrl}/storage/${adDetails.media_url}`;
        return null;
    };

    const bannerImage = getBannerImage();

    return (
        <div className="promo-products-page">
            {/* Loading State */}
            {loading && (
                <section className="promo-hero">
                    <div className="hero-content text-center d-flex justify-content-center align-items-center w-100" style={{ flexDirection: 'column' }}>
                        <div className="spinner " ></div>
                        <p>Loading amazing deals...</p>
                    </div>
                </section>
            )}

            {/* Error State */}
            {error && !loading && (
                <section className="promo-hero">
                    <div className="hero-content">
                        <div className="error-icon">⚠️</div>
                        <p>{error}</p>
                        <button className="retry-btn" onClick={fetchPromoProducts}>
                            Try Again
                        </button>
                    </div>
                </section>
            )}

            {/* Ad Banner & Details Section */}
            {!loading && !error && adDetails && (
                <section
                    className="promo-ad-banner"
                    style={{
                        backgroundImage: bannerImage ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${bannerImage})` : 'linear-gradient(135deg, #ff7b00 0%, #ffa500 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="container">
                        <div className="promo-ad-content">
                            {/* Discount Badge */}
                            {adDetails.discount_value && (
                                <div className="promo-discount-badge">
                                    <span className="promo-discount-value">
                                        {adDetails.discount_type === 'percent'
                                            ? `${adDetails.discount_value}% OFF`
                                            : `₦${adDetails.discount_value} OFF`}
                                    </span>
                                </div>
                            )}

                            {/* Ad Title */}
                            <h1 className="promo-ad-title">{adDetails.title}</h1>

                            {/* Countdown Timer */}
                            {adDetails.ends_at && (
                                <CountdownTimer 
                                    targetDate={adDetails.ends_at} 
                                    label="Ends in"
                                />
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Products Section with Sidebar */}
            <section className="promo-products ">
                <div className="container">
                    <div className="row">
                        {/* Filter Sidebar - Desktop */}
                        {!loading && !error && products.length > 0 && (
                            <div className="col-lg-3 d-none d-lg-block">
                                <div className="promo-filters-sidebar" style={{ background: '#fff', padding: '20px', borderRadius: '8px', position: 'sticky', top: '100px' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 style={{ margin: 0, fontWeight: '600' }}>Filters</h5>
                                        <button 
                                            onClick={resetFilters}
                                            style={{ background: 'none', border: 'none', color: '#ff7b00', cursor: 'pointer', fontSize: '14px' }}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    
                                    {/* Search */}
                                    <div className="mb-4">
                                        <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Product Name</label>
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                                        />
                                    </div>
                                    
                                    {/* Price Range Slider */}
                                    <div className="mb-4">
                                        <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Price Range</label>
                                        <div className="d-flex gap-2 mb-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(Number(e.target.value))}
                                                style={{ width: '50%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                                style={{ width: '50%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            min={productMinPrice}
                                            max={productMaxPrice}
                                            value={minPrice}
                                            onChange={(e) => {
                                                const v = Number(e.target.value);
                                                if (v <= maxPrice) setMinPrice(v);
                                            }}
                                            style={{ width: '100%', marginBottom: '8px' }}
                                        />
                                        <input
                                            type="range"
                                            min={productMinPrice}
                                            max={productMaxPrice}
                                            value={maxPrice}
                                            onChange={(e) => {
                                                const v = Number(e.target.value);
                                                if (v >= minPrice) setMaxPrice(v);
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '4px' }}>
                                            ₦{minPrice.toLocaleString()} - ₦{maxPrice.toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {/* Sort */}
                                    <div className="mb-4">
                                        <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                                        >
                                            <option value="recommended">Recommended</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                        </select>
                                    </div>
                                    
                                    {/* Brands */}
                                    {allBrands.length > 0 && (
                                        <div className="mb-4">
                                            <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Brand</label>
                                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                {allBrands.map(brand => (
                                                    <label key={brand} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedBrands.includes(brand)}
                                                            onChange={() => toggleBrand(brand)}
                                                            style={{ marginRight: '8px' }}
                                                        />
                                                        <span style={{ fontSize: '14px' }}>{brand}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Colors */}
                                    {allColors.length > 0 && (
                                        <div className="mb-4">
                                            <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Color</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {allColors.map(color => (
                                                    <button
                                                        type="button"
                                                        key={color}
                                                        onClick={() => toggleColor(color)}
                                                        aria-pressed={selectedColors.includes(color)}
                                                        style={{
                                                            padding: '6px 10px',
                                                            borderRadius: '4px',
                                                            backgroundColor: selectedColors.includes(color) ? '#fef3e7' : '#fff',
                                                            border: selectedColors.includes(color) ? '3px solid #ff7b00' : '2px solid #ddd',
                                                            cursor: 'pointer',
                                                            color: '#333',
                                                            fontSize: '13px'
                                                        }}
                                                    >{color}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Sizes */}
                                    {allSizes.length > 0 && (
                                        <div className="mb-4">
                                            <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Size</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {allSizes.map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => toggleSize(size)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            border: selectedSizes.includes(size) ? '2px solid #ff7b00' : '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            backgroundColor: selectedSizes.includes(size) ? '#ff7b00' : '#fff',
                                                            color: selectedSizes.includes(size) ? '#fff' : '#333',
                                                            cursor: 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Products Grid */}
                        <div className={products.length > 0 ? 'col-lg-9' : 'col-12'}>
                            {/* Mobile Filter Toggle & Sort */}
                            {!loading && !error && products.length > 0 && (
                                <div>
                                    <button 
                                        className="btn btn-outline-secondary d-lg-none"
                                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <span>🔍</span> Filters {showMobileFilters ? '▲' : '▼'}
                                    </button>
                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                    <span style={{ fontSize: '14px', color: '#666' }}>{filteredProducts.length} products</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="form-select"
                                        style={{ width: 'auto', fontSize: '14px' }}
                                    >
                                        <option value="recommended">Recommended</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>
                                </div>
                            )}
                            
                            {/* Mobile Filters Panel */}
                            {!loading && !error && products.length > 0 && (
                                <div id="mobileFilters" className="d-lg-none" style={{ display: showMobileFilters ? 'block' : 'none', background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 style={{ margin: 0, fontWeight: '600' }}>Filters</h6>
                                        <button 
                                            onClick={resetFilters}
                                            style={{ background: 'none', border: 'none', color: '#ff7b00', cursor: 'pointer', fontSize: '13px' }}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    
                                    {/* Search */}
                                    <div className="mb-3">
                                        <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Product Name</label>
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                        />
                                    </div>
                                    
                                    {/* Price Range */}
                                    <div className="mb-3">
                                        <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Price Range</label>
                                        <div className="d-flex gap-2 mb-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(Number(e.target.value))}
                                                style={{ width: '50%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                                style={{ width: '50%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            min={productMinPrice}
                                            max={productMaxPrice}
                                            value={minPrice}
                                            onChange={(e) => {
                                                const v = Number(e.target.value);
                                                if (v <= maxPrice) setMinPrice(v);
                                            }}
                                            style={{ width: '100%', marginBottom: '6px' }}
                                        />
                                        <input
                                            type="range"
                                            min={productMinPrice}
                                            max={productMaxPrice}
                                            value={maxPrice}
                                            onChange={(e) => {
                                                const v = Number(e.target.value);
                                                if (v >= minPrice) setMaxPrice(v);
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                        <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
                                            ₦{minPrice.toLocaleString()} - ₦{maxPrice.toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {/* Brands */}
                                    {allBrands.length > 0 && (
                                        <div className="mb-3">
                                            <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Brand</label>
                                            <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                                {allBrands.map(brand => (
                                                    <label key={brand} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedBrands.includes(brand)}
                                                            onChange={() => toggleBrand(brand)}
                                                            style={{ marginRight: '6px' }}
                                                        />
                                                        <span style={{ fontSize: '13px' }}>{brand}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Colors */}
                                    {allColors.length > 0 && (
                                        <div className="mb-3">
                                            <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Color</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {allColors.map(color => (
                                                    <button
                                                        type="button"
                                                        key={color}
                                                        onClick={() => toggleColor(color)}
                                                        aria-pressed={selectedColors.includes(color)}
                                                        style={{
                                                            padding: '5px 9px',
                                                            borderRadius: '4px',
                                                            backgroundColor: selectedColors.includes(color) ? '#fef3e7' : '#fff',
                                                            border: selectedColors.includes(color) ? '2px solid #ff7b00' : '1px solid #ddd',
                                                            cursor: 'pointer',
                                                            color: '#333',
                                                            fontSize: '12px'
                                                        }}
                                                    >{color}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Sizes */}
                                    {allSizes.length > 0 && (
                                        <div className="mb-3">
                                            <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Size</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {allSizes.map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => toggleSize(size)}
                                                        style={{
                                                            padding: '4px 10px',
                                                            border: selectedSizes.includes(size) ? '1px solid #ff7b00' : '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            backgroundColor: selectedSizes.includes(size) ? '#ff7b00' : '#fff',
                                                            color: selectedSizes.includes(size) ? '#fff' : '#333',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {products.length === 0 && !loading && !error && (
                                <div className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <h3>No products available in this promotion</h3>
                                    <p>Check back soon for exclusive deals!</p>
                                    <Link to="/shop" className="continue-shopping-btn">
                                        Continue Shopping
                                    </Link>
                                </div>
                            )}
                            {filteredProducts.length > 0 && (
                                <div className="row">
                                    {filteredProducts.map(product => {
                                        // Use the pre-calculated discount values from the product object
                                        const hasDiscount = product.hasDiscount;
                                        const discountAmount = product.discountAmount || 0;
                                        const discountPercentage = product.discountPercentage || 0;
                                        
                                        // Format price helper
                                        const formatPrice = (price) => {
                                            return new Intl.NumberFormat('en-NG', {
                                                style: 'currency',
                                                currency: 'NGN',
                                                maximumFractionDigits: 0
                                            }).format(price);
                                        };

                                        return (
                                            <ProductItem
                                                view={'shop'}
                                                key={product.id}
                                                product={{
                                                    ...product,
                                                    originalPrice: product.originalPrice || parseFloat(product.price),
                                                    displayPrice: product.displayPrice || formatPrice(product.price),
                                                    discountedPrice: hasDiscount ? (product.discountedPrice || parseFloat(product.price)) : null,
                                                    displayDiscountedPrice: hasDiscount ? (product.displayDiscountedPrice || formatPrice(product.discountedPrice)) : null,
                                                    hasDiscount: hasDiscount,
                                                    discountPercentage: discountPercentage,
                                                    discountAmount: discountAmount,
                                                    isPromo: product.isPromo || true,
                                                }}
                                                onAddToCart={handleAddToCart}
                                                isWishlisted={isWishlisted(product.id)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                            {products.length > 0 && filteredProducts.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-icon">🔍</div>
                                    <h3>No products match your filters</h3>
                                    <p>Try adjusting your filter criteria</p>
                                    <button onClick={resetFilters} className="continue-shopping-btn">
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default PromoProducts;

