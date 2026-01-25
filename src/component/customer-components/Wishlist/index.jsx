import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Wishlist = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(null);
    const { token } = useSelector(state => state.auth);
    const baseUrl = import.meta.env.VITE_API_URL || '';

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
            console.log(response);
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (wishlistId) => {
        try {
            setRemoving(wishlistId);
            const response = await axios.delete(`${baseUrl}/api/customer/wishlist/${wishlistId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setItems(prev => prev.filter(item => item.id !== wishlistId));
                toast.success(response.data.message || 'Product removed from wishlist');
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove item from wishlist');
        } finally {
            setRemoving(null);
        }
    };

    const handleAddToCart = (product) => {
        // Add to cart logic here
        toast.success(`${product.name} added to cart`);
    };

    const formatPrice = (price) => {
        return `₦${parseFloat(price).toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            return baseUrl + product.images[0];
        }
        if (product.image) {
            return baseUrl + product.image;
        }
        return '/api/placeholder/300/300';
    };

    return (
        <section className="wishlist-section mt-4" style={{
            padding: '0px 0',
            backgroundColor: '#f8f9fa',
            // height: '100vh',
        }}>
            <div className="verticalLimit">
                <div className="wishlist-header" style={{
                    backgroundColor: 'white',
                    padding: '20px 24px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}>
                    <div className="d-flex justify-content-between align-items-center w-100">
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
                        <Link
                            to="/products"
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
                        </Link>
                    </div>
                </div>

                <div style={{
                    // height: '100vh',
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
                                {items.map((item) => (
                                    <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <div className="wishlist-card" style={{
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            height: '100%',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                disabled={removing === item.id}
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    background: removing === item.id ? '#ccc' : 'rgba(255,255,255,0.9)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: removing === item.id ? 'not-allowed' : 'pointer',
                                                    zIndex: 2,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {removing === item.id ? (
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        border: '2px solid #666',
                                                        borderTop: '2px solid transparent',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite'
                                                    }}></div>
                                                ) : (
                                                    <span style={{ color: '#ff6b6b', fontSize: '16px' }}>×</span>
                                                )}
                                            </button>

                                            {/* Product Image */}
                                            <div style={{
                                                height: '200px',
                                                overflow: 'hidden',
                                                backgroundColor: '#f8f9fa'
                                            }}>
                                                <img
                                                    src={getProductImage(item.product)}
                                                    alt={item.product.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = '/api/placeholder/300/300';
                                                    }}
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div style={{ padding: '16px' }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#94969f',
                                                    marginBottom: '4px',
                                                    textTransform: 'uppercase',
                                                    fontWeight: '500'
                                                }}>
                                                    {item.product.brand || 'Brand'}
                                                </div>
                                                <h4 style={{
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: '#282c3f',
                                                    marginBottom: '8px',
                                                    lineHeight: '1.4',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {item.product.name}
                                                </h4>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        color: '#282c3f'
                                                    }}>
                                                        {formatPrice(item.product.sale_price || item.product.price)}
                                                    </span>
                                                    {item.product.sale_price && item.product.price !== item.product.sale_price && (
                                                        <span style={{
                                                            fontSize: '14px',
                                                            color: '#94969f',
                                                            textDecoration: 'line-through',
                                                            marginLeft: '8px'
                                                        }}>
                                                            {formatPrice(item.product.price)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '12px'
                                                }}>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: item.product.stock_quantity > 0 ? '#10b981' : '#ef4444',
                                                        fontWeight: '500'
                                                    }}>
                                                        {item.product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(item.product)}
                                                    disabled={item.product.stock_quantity === 0}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px',
                                                        backgroundColor: item.product.stock_quantity > 0 ? '#ff6b6b' : '#e0e0e0',
                                                        color: item.product.stock_quantity > 0 ? 'white' : '#94969f',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        cursor: item.product.stock_quantity > 0 ? 'pointer' : 'not-allowed',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    {item.product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Wishlist;