import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { addToCart as addToCartAction } from '../../../store/cartSlice';
import ProductItem from '../../productItem/template';
import { useWishlist } from '../../../hooks/useWishlist';
import AccountSidebar from '../../../pages/customerPage/Account/accountAssets/accountSideBarNav';

const Wishlist = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector(state => state.auth);
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { removeFromWishlist, loading: wishlistLoading } = useWishlist();

    // Get wishlist IDs from Redux
    const wishlistIds = useSelector(state => (state.wishlist && state.wishlist.ids) || []);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/api/customer/wishlist`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('wishlist', response);
            if (response.data.success) {
                // Filter out items with null products
                const validItems = (response.data.data || []).filter(item => item.product !== null);
                setItems(validItems);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (wishlistId, productId) => {
        console.log('Removing wishlist item:', wishlistId, 'product:', productId);

        // Instant removal - update UI immediately before API call
        setItems(prev => prev.filter(item => item.id !== wishlistId));

        try {
            // Use the removeFromWishlist from useWishlist hook which has better error handling
            const success = await removeFromWishlist(wishlistId, productId);
            // if (success) {
            //     toast.success('Product removed from wishlist');
            // }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            // Revert the optimistic update on error
            fetchWishlist();
            toast.error('Failed to remove item from wishlist');
        }
    };

    const handleAddToCart = (product) => {
        dispatch(addToCartAction(product));
        toast.success(`${product.name} added to cart`);
    };

    const isWishlisted = (productId) => wishlistIds.includes(productId);

    const getWishlistId = (productId) => {
        const item = items.find(i => i.product && i.product.id === productId);
        return item ? item.id : null;
    };

    // Format product data for ProductItem component
    const formatProductForItem = (product) => {
        if (!product) return null;

        const price = parseFloat(product.price) || 0;
        const salePrice = parseFloat(product.sale_price) || price;
        const priceAfterAdDiscount = parseFloat(product.price_after_ad_discount) || price;

        const hasDiscount = priceAfterAdDiscount < price;
        const discountAmount = hasDiscount ? price - priceAfterAdDiscount : 0;
        const discountPercentage = hasDiscount ? Math.round((discountAmount / price) * 100) : 0;

        // Check if product has ads (promo)
        const isPromo = product.ads && product.ads.length > 0;

        // Format price helper
        const formatPrice = (priceValue) => {
            return new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                maximumFractionDigits: 0
            }).format(priceValue);
        };

        return {
            ...product,
            originalPrice: price,
            displayPrice: formatPrice(price),
            discountedPrice: priceAfterAdDiscount,
            displayDiscountedPrice: formatPrice(priceAfterAdDiscount),
            hasDiscount: hasDiscount,
            discountPercentage: discountPercentage,
            discountAmount: discountAmount,
            isPromo: isPromo,
        };
    };

    return (
        <section className="wishlist-section " style={{
            paddingTop: '44px',
            paddingBottom: '60px',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        }}>
            <div className="container-flui verticalLimit">
                <div className="row">
                    {/* Account Sidebar */}
                    {/* <div className="col-lg-2 bg-danger"> */}
                    <AccountSidebar />
                    {/* </div> */}

                    {/* Wishlist Content */}
                    <div className="col-lg-10" style={{paddingTop:'160px'}}>

                        <div className="wishlist-header" style={{
                            backgroundColor: 'white',
                            padding: '20px 24px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                        }}>
                            <div className="d-fle justify-content-between align-items-center w-100">
                                <div>
                                    <h2 style={{
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        color: '#282c3f',
                                        margin: 0,
                                        marginBottom: '4px'
                                    }}>
                                        My Wishlist
                                    </h2>
                                    <p style={{
                                        color: '#94969f',
                                        fontSize: '14px',
                                        margin: 0
                                    }}>
                                        {items.length} {items.length === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                {/* <Link
                                    to="/shop"
                                    style={{
                                        padding: '10px 24px',
                                        backgroundColor: '#f5f5f5',
                                        color: '#282c3f',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Continue Shopping
                                </Link> */}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <div style={{ width: '100%' }}>
                                {loading ? (
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '80px 20px',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            border: '4px solid #f3f3f3',
                                            borderTop: '4px solid #ff6b6b',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                            margin: '0 auto 20px'
                                        }}></div>
                                        <p style={{ color: '#94969f' }}>Loading wishlist...</p>
                                    </div>
                                ) : items.length === 0 ? (
                                    <div style={{
                                        backgroundColor: 'white',
                                        padding: '80px 20px',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                                    }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <span style={{
                                                fontSize: '64px',
                                                color: '#e0e0e0'
                                            }}>💝</span>
                                        </div>
                                        <h3 style={{
                                            fontSize: '20px',
                                            fontWeight: '500',
                                            color: '#282c3f',
                                            marginBottom: '12px'
                                        }}>
                                            Your wishlist is empty
                                        </h3>
                                        <p style={{
                                            color: '#94969f',
                                            marginBottom: '24px',
                                            fontSize: '14px'
                                        }}>
                                            Save your favorite items here
                                        </p>
                                        <Link
                                            to="/shop"
                                            style={{
                                                display: 'inline-block',
                                                padding: '12px 32px',
                                                backgroundColor: '#ff6b6b',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: '4px',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {items.map((item) => {
                                            const formattedProduct = formatProductForItem(item.product);
                                            return (
                                                formattedProduct && (
                                                    <ProductItem
                                                        key={item.id}
                                                        view={'shop'}
                                                        product={formattedProduct}
                                                        onAddToCart={handleAddToCart}
                                                        isWishlisted={isWishlisted(item.product.id)}
                                                        wishlistId={getWishlistId(item.product.id)}
                                                        isOnWishlistPage={true}
                                                        onRemoveFromWishlist={handleRemove}
                                                    />
                                                )
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default Wishlist;
