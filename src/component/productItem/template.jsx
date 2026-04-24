import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart as addToCartAction, removeFromCart, setQty } from '../../store/cartSlice';
import { useWishlist } from '../../hooks/useWishlist';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaEye, FaTruck, FaShoppingCart, FaStar, FaFire, FaTimesCircle } from 'react-icons/fa';
import './style.css';

// Helper function to check if ad is still valid (not expired)
// Checks both array format (ads) and flat field format (isPromo, ad_discount_type, etc.)
const isAdNotExpired = (product) => {
    if (!product) {
        return false;
    }
    
    // Check for flat ad fields from PromoProducts (isPromo, ad_discount_type, ad_discount_value)
    const hasFlatAdFields = product.isPromo || product.ad_discount_type || product.ad_discount_value;
    if (hasFlatAdFields) {
        // For PromoProducts, check if there's an ad_end_date field
        if (product.ad_end_date) {
            const now = new Date();
            const endDate = new Date(product.ad_end_date);
            return now <= endDate;
        }
        // If no end date provided but has flat ad fields, consider it valid
        return true;
    }
    
    // Original check for ads array format (Shop, Homepage)
    if (!product.ads || product.ads.length === 0) {
        return false;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check each ad - if any is valid, return true
    for (const ad of product.ads) {
        if (!ad.ends_at) {
            continue;
        }
        
        const endDate = new Date(ad.ends_at);
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        // Ad is valid if today is before or equal to end date
        if (today <= endDateOnly) {
            return true;
        }
    }
    
    return false;
};

export default function ProductItem({ view, product, onAddToCart, isWishlisted, wishlistId, isOnWishlistPage, onRemoveFromWishlist }) {
    const dispatch = useDispatch();
    const cartItems = useSelector(s => (s.cart && s.cart.items) || []);
    const { addToWishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();
    const [loading, setLoading] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Check if ad is still valid (not expired)
    const adIsValid = isAdNotExpired(product);
    
    // If ad is expired, override the discount-related fields
    const isPromo = product.isPromo && adIsValid;
    const hasDiscount = product.hasDiscount && adIsValid;
    const discountedPrice = adIsValid ? product.discountedPrice : null;
    const discountPercentage = adIsValid ? product.discountPercentage : 0;
    const discountAmount = adIsValid ? product.discountAmount : 0;
    const displayDiscountedPrice = adIsValid ? product.displayDiscountedPrice : null;
    
    console.log('alalalalalalalalal', product);
    // Get cart item if exists
    const cartItem = cartItems.find(item => item.id === product.id);
    const isInCart = Boolean(cartItem);
    const currentQuantity = cartItem?.qty || 0;

    // Truncate product name to 25 characters
    const truncatedName = product.name.length > 18 
        ? `${product.name.substring(0, 18)}...` 
        : product.name;

    const doAdd = (p) => {
        const exists = cartItems.find(i => i.id === p.id);
        if (exists) {
            return 'exists';
        }
        dispatch(addToCartAction(p));
        return 'added';
    };

    const handleAddClick = (p) => {
        if (!p.stock_quantity) return;
        
        setLoading(true);
        setTimeout(() => {
            try {
                let result;
                // Use discounted price if available AND ad is valid, otherwise use original price
                const priceToUse = (hasDiscount && discountedPrice) ? discountedPrice : parseFloat(p.price);
                const productToAdd = { ...p, price: priceToUse, quantity: 1 };
                
                if (onAddToCart) {
                    try {
                        result = onAddToCart(productToAdd);
                    } catch (err) {
                        console.error('onAddToCart threw', err);
                    }
                } else {
                    result = doAdd(productToAdd);
                }

                if (result === 'added') {
                    toast.success('Product added to cart');
                }
            } finally {
                setLoading(false);
            }
        }, 650);
    };

    const handleUpdateQuantity = (increment) => {
        if (!product) return;
        
        // Get the current quantity from cartItem
        const currentQty = cartItem?.qty || 0;
        const newQuantity = currentQty + (increment ? 1 : -1);
        
        if (newQuantity <= 0) {
            // Remove from cart
            dispatch(removeFromCart(product.id));
            toast.info('Product removed from cart');
            return;
        }

        if (newQuantity > product.stock_quantity) {
            toast.error('Cannot exceed available stock');
            return;
        }

        // Use setQty action for updating quantity
        dispatch(setQty({ 
            id: product.id, 
            qty: newQuantity 
        }));
    };

    const overlay = (
        <div className="item-loading-overlay ">
            <div className="item-loading-content ">
                <div className="spinner-border text-light" role="status" style={{ width: 56, height: 56 }}></div>
                <div className="mt-2 ">Adding to cart...</div>
            </div>
        </div>
    );

    // Calculate discount percentage - using the new price structure and computed hasDiscount
    const discount = hasDiscount ? discountPercentage : 0;

    // Format price
    const formatPrice = (price) => {
        // Debug logging
        // console.log('Price input:', price);
        // console.log('Price type:', typeof price);
        
        // Handle undefined, null, or invalid price
        if (!price && price !== 0) {
            console.log('Price is falsy:', price);
            return 'N/A';
        }
        
        // Handle string price with currency symbol or commas
        let cleanPrice = price;
        if (typeof price === 'string') {
            cleanPrice = price.replace(/[₦,]/g, '').trim();
            console.log('Cleaned price string:', cleanPrice);
        }
        
        // Ensure price is a number
        const numericPrice = Number(cleanPrice);
        // console.log('Numeric price:', numericPrice);
        
        if (isNaN(numericPrice)) {
            console.warn('Invalid price value:', price);
            return 'N/A';
        }

        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(numericPrice);
    };

    // Determine stock status
    const getStockStatus = () => {
        if (!product.stock_quantity) return { text: 'Out of Stock', class: 'item-out-of-stock' };
        if (product.stock_quantity <= product.min_stock_level) return { text: 'Limited stock available', class: 'item-low-stock' };
        return { text: 'In Stock', class: 'item-in-stock' };
    };

    // Generate random rating (for demo - replace with actual ratings from your data)
    const rating = Math.random() * (5 - 3.5) + 3.5;
    const reviewCount = Math.floor(Math.random() * 1000) + 50;

    const stockStatus = getStockStatus();

    // Get image URL - fixed implementation
    const getImageUrl = () => {
        if (!product.image) return '/images/placeholder-product.jpg';
        
        // If image is already a full URL, use it directly
        if (product.image.startsWith('http')) {
            return product.image;
        }
        
        // If image is a relative path, construct the full URL
        const baseUrl = import.meta.env.VITE_API_URL || '';
        return `${baseUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`;
    };

    return (
        <div className={` ${view === 'home' ? 'col-lg-3 col-xl-2 col-6' : 'col-lg-2 col-xl-3 col-6'}  col-sm-6 col-md-3   g-1 `}>
            <div className="item-card ">
                {/* Badges Container */}
                <div className="item-badges-container ">
                    {isPromo && (
                        <div className="item-promo-badge " style={{ backgroundColor: 'red', color: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaFire className="item-fire-icon" style={{ fontSize: '12px' }} />
                            SALE
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="item-discount-badge ">
                            <FaFire className="item-fire-icon" />
                            -{discount}%
                        </div>
                    )}
                    
                    {product.is_featured && (
                        <div className="item-official-badge ">
                            <img src="/images/icons/official-store.svg" alt="Official Store" className="item-official-icon" />
                            Official Store
                        </div>
                    )}

                    {product.requires_shipping && (
                        <div className="item-express-badge ">
                            <FaTruck className="item-express-icon" /> Express
                        </div>
                    )}
                </div>

                {/* Product Image */}
                <Link to={`/product/${product.id}`} className="product_item-image-link ">
                    <div className="product_item-image-wrapper ">
                        {!imageLoaded && !imageError && (
                            <div className="product_item-image-skeleton "></div>
                        )}
                        <img 
                            src={getImageUrl()} 
                            alt={product.name}
                            className={`product_item-image ${imageLoaded ? 'product_item-image-loaded' : ''}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                        />
                        {imageError && (
                            <div className="product_item-image-fallback ">
                                <FaShoppingCart size={32} />
                                <span>Image not available</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Quick Actions */}
                <div className="item-quick-actions ">
                    <button 
                        className={`item-action-btn item-wishlist-btn ${isWishlisted ? 'item-wishlist-active' : ''} ${isOnWishlistPage ? 'item-remove-wishlist' : ''}`}
                        onClick={async () => {
                            // Prevent multiple clicks
                            if (wishlistLoading) return;
                            
                            console.log('Wishlist button clicked:', { isOnWishlistPage, wishlistId, productId: product.id });
                            
                            if (isOnWishlistPage && onRemoveFromWishlist && wishlistId) {
                                // Use the passed callback for instant removal on wishlist page
                                await onRemoveFromWishlist(wishlistId, product.id);
                            } else if (isWishlisted && wishlistId) {
                                await removeFromWishlist(wishlistId, product.id);
                            } else {
                                await addToWishlist(product.id);
                            }
                        }}
                        disabled={wishlistLoading}
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {wishlistLoading ? (
                            <div className="spinner-border spinner-border-sm" role="status"></div>
                        ) : isOnWishlistPage ? (
                            <FaTimesCircle />
                        ) : (
                            isWishlisted ? <FaHeart /> : <FaRegHeart />
                        )}
                    </button>
                    <button 
                        className="item-action-btn item-view-btn"
                        onClick={() => window.location.href = `/product/${product.id}`}
                        aria-label="Quick view"
                    >
                        <FaEye />
                    </button>
                </div>

                {/* Product Info */}
                <div className="item-info " style={{paddingTop:'5px'}}>
                    <div className="item-meta d-block p-0 m-0 ">
                        {/* {product.brand && (
                            <div className="item-brand ">{product.brand}</div>
                        )} */}
                        
                        {/* Rating */}
                        {/* <div className="item-rating  p-0 m-0 ">
                            <div className="item-stars ">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar 
                                        key={i} 
                                        className={`item-star ${i < Math.floor(rating) ? 'item-star-filled' : ''} ${i === Math.floor(rating) && rating % 1 >= 0.5 ? 'item-star-half' : ''}`}
                                    />
                                ))}
                            </div>
                            <span className="item-rating-text ">({reviewCount})</span>
                        </div> */}
                    </div>

                    <Link to={`/product/${product.id}`} className="item-name-link m-0 p-0 ">
                        <h3 className="item-name  " title={product.name}>{truncatedName}</h3>
                    </Link>

                    {/* Pricing */}
                    <div className="item-pricing p-0 m-0 ">
                        {hasDiscount ? (
                            <>
                                <div className="item-current-price p-0 m-0 " style={{ color: '#28a745', fontWeight: '700' }}>
                                    {displayDiscountedPrice}
                                </div>
                                <div className="item-price-comparison ">
                                    <span className="item-original-price " style={{ textDecoration: 'line-through', color: '#999' }}>
                                        {product.displayPrice}
                                    </span>
                                    <span className="item-savings " style={{ color: '#28a745', fontSize: '12px', fontWeight: '600' }}>
                                        Save {formatPrice(discountAmount)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="item-current-price p-0 m-0 ">{product.displayPrice}</div>
                        )}
                    </div>

                    {/* Stock & Delivery */}
                    <div className="item-footer p-0 m-0">
                        <div className={`item-stock-status ${stockStatus.class}`}>
                            {stockStatus.text}
                        </div>
                    </div>

                    {/* Cart Actions */}
                    {isInCart ? (
                        <div className="item-quantity-controls m-0 p-0 w-100">
                            <button 
                                className="item-quantity-btn"
                                onClick={() => handleUpdateQuantity(false)}
                                aria-label="Decrease quantity"
                            >
                                -
                            </button>
                            <span className="item-quantity">{currentQuantity}</span>
                            <button 
                                className="item-quantity-btn"
                                onClick={() => handleUpdateQuantity(true)}
                                disabled={currentQuantity >= product.stock_quantity}
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button 
                            className={`item-cart-btn w-100 ${!product.stock_quantity ? 'item-cart-disabled' : ''}`}
                            onClick={() => handleAddClick(product)}
                            disabled={!product.stock_quantity}
                        >
                            <FaShoppingCart className="item-cart-icon" />
                            <span>{product.stock_quantity ? 'ADD TO CART' : 'OUT OF STOCK'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && typeof document !== 'undefined' && createPortal(overlay, document.body)}
        </div>
    );
}