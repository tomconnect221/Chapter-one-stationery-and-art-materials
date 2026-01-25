import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart as addToCartAction, removeFromCart, setQty } from '../../store/cartSlice';
import { useWishlist } from '../../hooks/useWishlist';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart, FaEye, FaTruck, FaShoppingCart, FaStar, FaFire } from 'react-icons/fa';
import './style.css';

export default function ProductItem({ view, product, onAddToCart, isWishlisted, wishlistId }) {
    const dispatch = useDispatch();
    const cartItems = useSelector(s => (s.cart && s.cart.items) || []);
    const { addToWishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();
    const [loading, setLoading] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

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
                if (onAddToCart) {
                    try {
                        result = onAddToCart({ ...p, quantity: 1 });
                    } catch (err) {
                        console.error('onAddToCart threw', err);
                    }
                } else {
                    result = doAdd({ ...p, quantity: 1 });
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

    // Calculate discount percentage
    const discount = product.sale_price && product.price ? 
        Math.round(((product.sale_price - product.price) / product.sale_price) * 100) : 0;

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
        if (product.stock_quantity <= product.min_stock_level) return { text: 'Low Stock', class: 'item-low-stock' };
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
        <div className={` ${view === 'home' ? 'col-lg-3 col-xl-2 col-6' : 'col-lg-2 col-xl-3'}  col-sm-6 col-md-3   g-1 `}>
            <div className="item-card ">
                {/* Badges Container */}
                <div className="item-badges-container ">
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
                        className={`item-action-btn item-wishlist-btn ${isWishlisted ? 'item-wishlist-active' : ''}`}
                        onClick={async () => {
                            if (isWishlisted && wishlistId) {
                                await removeFromWishlist(wishlistId);
                            } else {
                                await addToWishlist(product.id);
                            }
                        }}
                        disabled={wishlistLoading}
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {wishlistLoading ? (
                            <div className="spinner-border spinner-border-sm" role="status"></div>
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
                        <div className="item-rating  p-0 m-0 ">
                            <div className="item-stars ">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar 
                                        key={i} 
                                        className={`item-star ${i < Math.floor(rating) ? 'item-star-filled' : ''} ${i === Math.floor(rating) && rating % 1 >= 0.5 ? 'item-star-half' : ''}`}
                                    />
                                ))}
                            </div>
                            {/* <span className="item-rating-text ">({reviewCount})</span> */}
                        </div>
                    </div>

                    <Link to={`/product/${product.id}`} className="item-name-link m-0 p-0 ">
                        <h3 className="item-name  " title={product.name}>{truncatedName}</h3>
                    </Link>

                    {/* Pricing */}
                    <div className="item-pricing p-0 m-0 ">
                        <div className="item-current-price p-0 m-0 ">{formatPrice(product.price)}</div>
                        {product.sale_price && product.sale_price > product.price && (
                            <div className="item-price-comparison ">
                                <span className="item-original-price ">{formatPrice(product.sale_price)}</span>
                                <span className="item-savings ">You save {formatPrice(product.sale_price - product.price)}</span>
                            </div>
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