import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, setQty } from '../../../store/cartSlice';
import { toggleWishlist } from '../../../store/wishlistSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../component/Auth/AuthContext';
import './style.css';

export default function Cart() {
   const dispatch = useDispatch();
   const cart = useSelector(s => (s.cart && s.cart.items) || []);
   const navigate = useNavigate();
   const {  isAuthenticated, user, openAuth } = useAuth();

  const [loading, setLoading] = useState(false);

  const parsePrice = (p) => {
    if (typeof p === 'number') return p;
    if (!p) return 0;
    const s = String(p).replace(/[^0-9.]/g, '');
    const n = parseFloat(s);
    return Number.isNaN(n) ? 0 : n;
  };

  const getProductImage = (product) => {
    const image = product?.image || product?.images?.[0] || '/images/placeholder-product.png';
    if (!image) return '/images/placeholder-product.png';
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/storage/')) return `${import.meta.env.VITE_API_URL}${image}`;
    if (image.startsWith('/')) return `${import.meta.env.VITE_API_URL}${image}`;
    return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, '')}`;
  };

  const subtotal = useMemo(() => cart.reduce((s, i) => s + parsePrice(i.product.price) * (i.qty || 0), 0), [cart]);

  const formatNGN = (v) => {
    try {
      return '₦' + new Intl.NumberFormat('en-NG', { maximumFractionDigits: 2 }).format(v);
    } catch (e) {
      return '₦' + v;
    }
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.info('Removed from cart');
  };

  const handleMoveToWishlist = (id) => {
    dispatch(toggleWishlist(id));
    toast.info('Moved to wishlist');
  };

  const handleQtyChange = (id, qty) => {
    if (qty < 1) return;
    const item = cart.find(cartItem => cartItem.id === id);
    const stock = Number(item?.product.stock_quantity);
    const hasSelectedVariant = Boolean(item?.product.variant_id);
    if ((hasSelectedVariant && qty > stock) || (!hasSelectedVariant && stock > 0 && qty > stock)) {
      toast.error(`Only ${stock} of this option are available.`);
      return;
    }
    dispatch(setQty({ id, qty }));
  };

  const handleIncrement = (id) => {
    const item = cart.find(i => i.id === id);
    if (item) handleQtyChange(id, item.qty + 1);
  };

  const handleDecrement = (id) => {
    const item = cart.find(i => i.id === id);
    if (item && item.qty > 1) dispatch(setQty({ id, qty: item.qty - 1 }));
  };

  // const deliveryFee = 0;
  // const deliveryFee = subtotal > 0 ? (subtotal >= 5000 ? 0 : 500) : 0;
  const total = subtotal;

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Cart refreshed');
    }, 650);
  };

  const handleProceed = () => {
    if (!cart || cart.length === 0) {
      toast.info('Your cart is empty');
      return;
    }
    if (!isAuthenticated ) {
      sessionStorage.setItem('intendedPath', '/checkout');
      openAuth('signin');
      return;
    }
    navigate('/checkout');
  };

  return (
    <section className="cart-page section-padding">
      <div className="container">
        <div className="cart-header mb-4">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="row gx-4">
          <div className="col-lg-8">
            <div className="cart-items-container">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <h3>Your cart is empty</h3>
                  <p>Looks like you haven't added anything to your cart yet.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/shop')}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item-card">
                      <div className="cart-item-image">
                        <img src={getProductImage(item.product)} alt={item.product.title || item.product.name} />
                      </div>

                      <div className="cart-item-details">
                        <div className="cart-item-info">
                          <h4 className="cart-item-title" style={{fontSize:'13px'}}>{item.product.title || item.product.name}</h4>
                          <p className="cart-item-brand">{item.product.brand || ''}</p>
                          <p className="cart-item-specs">
                            {item.product.variant_options
                              ? Object.entries(item.product.variant_options).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join(' • ')
                              : item.product.specs ? Object.keys(item.product.specs).map(k => `${k}: ${item.product.specs[k]}`).join(' • ') : ''}
                          </p>
                        </div>

                        <div className="cart-item-price">
                          <span className="price">{formatNGN(parsePrice(item.product.price))}</span>
                          <span className="quantity">Qty: {item.qty}</span>
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button
                            type="button"
                            className="qty-btn qty-minus"
                            onClick={() => handleDecrement(item.id)}
                            aria-label="Decrease quantity"
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <span className="qty-value">{item.qty}</span>
                          <button
                            type="button"
                            className="qty-btn qty-plus"
                            onClick={() => handleIncrement(item.id)}
                            aria-label="Increase quantity"
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>

                        <div className="item-actions">
                          <button
                            className="action-btn remove-btn btn-warning btn "
                            onClick={() => handleRemove(item.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                            Remove
                          </button>
                          {/* {isAuthenticated && (
                            <button
                              className="action-btn btn wishlist-bt text-light" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
                              onClick={() => handleMoveToWishlist(item.id)}
                            >
                              <i className="fas fa-heart"></i>
                              Save for later
                            </button>
                          )} */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="order-summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal ({cart.length} items)</span>
                <span className="summary-value">{formatNGN(subtotal)}</span>
              </div>

              {/* <div className="summary-row">
                <span>Delivery</span>
                <span className="summary-value delivery-fee">
                  {deliveryFee === 0 ? 'FREE' : formatNGN(deliveryFee)}
                </span>
              </div> */}

           {/*   {subtotal < 5000 && subtotal > 0 && (
                <div className="free-delivery-notice">
                  Add ₦{formatNGN(5000 - subtotal)} more for FREE delivery
                </div>
              )}
                */}

              <hr className="summary-divider" />

              <div className="summary-row total-row">
                <span>Total</span>
                <span className="total-amount">{formatNGN(total)}</span>
              </div>

              <button className="checkout-btn" onClick={handleProceed}>
                Proceed to Checkout
                <i className="fas fa-arrow-right"></i>
              </button>

              <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt"></i>
                    Refresh Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Full-screen overlay (covers the entire viewport) while loading */}
        {loading && typeof document !== 'undefined' && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="loading-text">Refreshing cart...</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* Inline styles for quantity control (scoped to this file) */
/* Using a small style tag so developers can tweak easily */
const style = document.createElement('style');
style.innerHTML = `
.qty-control { gap: 6px; }
.qty-btn { width: 36px; height: 36px; display:flex; align-items:center; justify-content:center; border-radius:4px; }
.qty-display { min-width:48px; line-height:36px; }
@media (max-width: 768px) {
  .qty-control { margin-bottom: 8px; }
}
/* Make action buttons smaller on medium+ screens while keeping them full-width on small screens */
@media (min-width: 768px) {
  .cart-item .btn-outline-secondary.w-md-auto {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.2;
  }
}
`;
if (typeof document !== 'undefined' && !document.getElementById('cart-qty-styles')) {
  style.id = 'cart-qty-styles';
  document.head.appendChild(style);
}
