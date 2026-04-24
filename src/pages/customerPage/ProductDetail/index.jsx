import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { addToCart as addToCartAction } from '../../../store/cartSlice';
import { toggleWishlist as toggleWishlistAction } from '../../../store/wishlistSlice';
import './style.css';
import './additional.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaShippingFast, FaShieldAlt, FaBox, FaStore, FaTags, FaStar, FaFacebookF, FaTwitter, FaWhatsapp, FaLink, FaHeart, FaRegHeart, FaQrcode } from 'react-icons/fa';
import { useWishlist } from '../../../hooks/useWishlist';
import { BiSolidOffer } from 'react-icons/bi';
import { QRCodeCanvas } from 'qrcode.react';
import Modal from 'react-modal';

// Helper function to check if ad is still valid (not expired)
const isAdNotExpired = (product) => {
    if (!product || !product.ads || product.ads.length === 0) {
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

function formatNGN(num) {
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(num);
  } catch (e) {
    return `₦${num}`;
  }
}

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const wishlist = useSelector(s => (s.wishlist && s.wishlist.ids) || []);
  const cartItems = useSelector(s => (s.cart && s.cart.items) || []);
  const user = useSelector(s => s.auth?.user);
  const token = useSelector(s => s.auth?.token);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToWishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.data);
          console.log('bbbbbbbbbbbbb', response.data.data);

          // Track product view for logged-in users
          if (user && token) {
            try {
              await axios.post(
                `${import.meta.env.VITE_API_URL}/api/products/${id}/view`,
                {},
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
            } catch (viewError) {
              // Silently handle view tracking errors
              console.error('Failed to track product view:', viewError);
            }
          }
        } else {
          setError('Failed to fetch product details');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch product details');
        toast.error('Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, user, token]);

  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qrModalIsOpen, setQrModalIsOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setMainImage(product.image || (product.images && product.images[0]) || '');
      setSelectedColor(product.color || '');
      setSelectedSize(product.size || '');
    }
  }, [product]);

  const isWishlisted = product && wishlist.includes(product.id);

  function getDiscount() {
    const discount = Math.round(((product.sale_price - product.price) / product.sale_price) * 100);
    if (discount > 0) {
      return discount + '% OFF';
    } else {
      return 0;
    }
  }

  // Calculate if product has a valid ad with discount - now checks expiration
  const adIsValid = product && isAdNotExpired(product);
  const hasAdDiscount = adIsValid && product.price_after_ad_discount && parseFloat(product.price_after_ad_discount) < parseFloat(product.price);
  const adDiscountAmount = hasAdDiscount ? parseFloat(product.price) - parseFloat(product.price_after_ad_discount) : 0;
  const adDiscountPercent = hasAdDiscount ? Math.round((adDiscountAmount / parseFloat(product.price)) * 100) : 0;

  if (loading) {
    return (
      <section className="product-detail">
        <div className="container">
          {/* <div className="row">
            <div className="col-lg-6">
              <div className="skeleton" style={{ height: '400px', marginBottom: '1rem' }} />
              <div className="d-flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton" style={{ width: '80px', height: '80px' }} />
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="skeleton" style={{ height: '40px', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: '30px', width: '60%', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: '100px', marginBottom: '1rem' }} />
            </div>
          </div> */}
            <div className="featured-product pt0 pb90">
                <div className="verticalLimit">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading products details...</p>
                    </div>
                </div>
            </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-detail">
        <div className="container">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Error</h4>
            <p>{error || 'Product not found'}</p>
            <hr />
            <p className="mb-0">
              <Link to="/shop" className="btn btn-outline-danger">Back to Shop</Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  const handleAddToCart = () => {
    const exists = cartItems.find(i => i.id === product.id);
    if (exists) {
      toast.info('Product already in cart');
      return;
    }
    // Use discounted price only if ad is valid, otherwise use original price
    const priceToUse = (hasAdDiscount && adIsValid) ? parseFloat(product.price_after_ad_discount) : parseFloat(product.price);
    dispatch(addToCartAction({ ...product, price: priceToUse, qty }));
    toast.success('Product added to cart');
  };

  const handleBuyNow = () => {
    const exists = cartItems.find(i => i.id === product.id);
    if (!exists) {
      // Use discounted price only if ad is valid
      const priceToUse = (hasAdDiscount && adIsValid) ? parseFloat(product.price_after_ad_discount) : parseFloat(product.price);
      dispatch(addToCartAction({ ...product, price: priceToUse, qty }));
      toast.success('Product added to cart');
    } else {
      toast.info('Product already in cart');
    }
    // user would be redirected to checkout in a full app; here we keep behavior simple
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleWishlist = async () => {
    if (!token) {
      toast.error('Please login to manage wishlist');
      return;
    }
    
    if (isWishlisted) {
      // Need to find the wishlist ID first - for now, let's remove by product ID
      // The API requires wishlist ID, but we only have product ID here
      // We'll use the local toggle and let the API sync happen
      dispatch(toggleWishlistAction(product.id));
      toast.info('Product removed from wishlist');
    } else {
      const success = await addToWishlist(product.id);
      if (success) {
        dispatch(toggleWishlistAction(product.id));
      }
    }
  };

  // Calculate discount if sale price exists and is higher than regular price
  const discountPercent = product.sale_price && product.sale_price > product.price ?
    Math.round(((product.sale_price - product.price) / product.sale_price) * 100) : 0;

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{product.meta_title || product.name || 'Product Details'} - Chapter One</title>
        <meta name="description" content={product.meta_description || product.short_description || product.description || 'View product details and purchase from Chapter One'} />
        {product.meta_keywords && <meta name="keywords" content={product.meta_keywords} />}

        {/* Open Graph tags for social media */}
        <meta property="og:title" content={product.meta_title || product.name} />
        <meta property="og:description" content={product.meta_description || product.short_description || product.description} />
        <meta property="og:image" content={`${import.meta.env.VITE_API_URL}${product.image}`} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={window.location.href} />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.meta_title || product.name} />
        <meta name="twitter:description" content={product.meta_description || product.short_description || product.description} />
        <meta name="twitter:image" content={`${import.meta.env.VITE_API_URL}${product.image}`} />

        {/* Product-specific meta tags */}
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="NGN" />
        {product.brand && <meta property="product:brand" content={product.brand} />}
        {product.category && <meta property="product:category" content={product.category.name} />}
      </Helmet>

      <section className="product-detail section-padding">
        <div className="container">
          {/* Breadcrumb */}
          <div className="top-band mb-2">
            <div className="small text-muted"><Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/shop">Shop</Link> &nbsp;/&nbsp; <span>{product.title}</span></div>
          </div>

          <div className="row gx-4">
            <div className="col-lg-6">
              <div className="product-gallery">
                <div className="main-image mb-3">
                  <img src={`${import.meta.env.VITE_API_URL}` + mainImage} alt={product.title} className="img-fluid" />
                </div>
                <div className="thumbs d-flex gap-2 flex-wrap">
                  {[product.image, ...(product.images && product.images.length ? product.images : [])].map((src, i) => (
                    <div key={i} className={`thumb ${mainImage === src ? 'active' : ''}`} onClick={() => setMainImage(src)}>
                      <img src={`${import.meta.env.VITE_API_URL}` + src} alt={`${product.title} ${i}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-12 mt-3">
                <div className="card p-3 mb-3">
                  <h5>Product details</h5>
                  <div className="mt-2">
                    <h6 className="mb-2">Full description</h6>
                    <p className="text-muted small">{product.description}</p>
                    {product.short_description && (
                      <div className="mt-2">
                        <h6 className="mb-2">Short description</h6>
                        <p className="text-muted small">{product.short_description}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h6>Specifications</h6>
                    <table className="table table-sm">
                      <tbody>
                        {product.brand && <tr><th>Brand</th><td>{product.brand}</td></tr>}
                        {product.model && <tr><th>Model</th><td>{product.model}</td></tr>}
                        {product.dimensions && <tr><th>Dimensions</th><td>{product.dimensions}</td></tr>}
                        {product.weight && <tr><th>Weight</th><td>{product.weight}</td></tr>}
                        {product.size && <tr><th>Size</th><td>{product.size}</td></tr>}
                      </tbody>
                    </table>
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-3">
                      <h6>Tags</h6>
                      <div className="d-flex gap-2 flex-wrap">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="badge bg-light text-dark">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(product.meta_title || product.meta_description || product.meta_keywords) && (
                    <div className="mt-3">
                      <h6>Additional Information</h6>
                      {product.meta_title && (
                        <div className="mb-2">
                          <strong className="small">Title:</strong>
                          <div className="text-muted small">{product.meta_title}</div>
                        </div>
                      )}
                      {product.meta_description && (
                        <div className="mb-2">
                          <strong className="small">Description:</strong>
                          <div className="text-muted small">{product.meta_description}</div>
                        </div>
                      )}
                      {product.meta_keywords && (
                        <div className="mb-2">
                          <strong className="small">Keywords:</strong>
                          <div className="text-muted small">{product.meta_keywords}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="col-lg-12 mt-3">
                  <div className="card p-3 mb-3">
                    <h6>Stock Information</h6>
                    <div className="small text-muted">
                      {/* <div>Current Stock: {product.stock_quantity}</div> */}
                      <div>Product Type: {product.is_digital ? 'Digital Product' : 'Physical Product'}</div>
                    </div>
                  </div>

                  {/* <div className="card p-3">
              <h6>Pricing Details</h6>
              <div className="small text-muted">
                <div>Regular Price: {formatNGN(product.price)}</div>
                {product.sale_price && <div>Sale Price: {formatNGN(product.sale_price)}</div>}
                {product.cost_price && <div>Cost Price: {formatNGN(product.cost_price)}</div>}
                {product.tax_rate && <div>Tax Rate: {product.tax_rate}%</div>}
              </div>
            </div> */}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="product-info">
                <h1 className="product-title">{product.name}</h1>
                
                {adIsValid && product.ads && product.ads.length > 0 && (
                  <div className="mb-3" style={{ display: 'inline-block', backgroundColor: 'red', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
                    🔥 SALE:  {product.ads[0].title}
                  </div>
                )}
                
                <div className="pricing-section mb-3">

                  <div className="d-flex align-items-center gap-3 mb-2">
                    {hasAdDiscount ? (
                      <>
                        <div className="h2 mb-0" style={{ color: 'var(--brand)', fontWeight: '700' }}>
                          {formatNGN(product.price_after_ad_discount)}
                        </div>
                        <div className="h5 mb-0 text-muted" style={{ textDecoration: 'line-through', color: '#999' }}>
                          {formatNGN(product.price)}
                        </div>
                        <div className="badge bg-danger" style={{ fontSize: '12px', padding: '6px 10px' }}>
                          -{adDiscountPercent}%
                        </div>
                      </>
                    ) : (
                      <div className="h2 mb-0" style={{ color: 'var(--brand)' }}>
                        {formatNGN(product.price)}
                      </div>
                    )}
                  </div>
                  
                  {hasAdDiscount && (
                    <div className="savings-info mb-2 mt-5" style={{ color: '#2e7d32', fontSize: '14px', fontWeight: '600' }}>
                      Save {formatNGN(adDiscountAmount)}
                    </div>
                  )}

                  <div className="mb-2 mt-5 d-flex gap-2">
                    <div className="stock-info ">
                      <FaBox /> {
                        product.stock_quantity === 0
                          ? 'Out of stock'
                          : product.stock_quantity <= product.min_stock_level
                            ? 'Limited stock available'
                            : ` in stock`
                      }
                    </div>

                  </div>
                </div>



                <div className="product-meta mb-3">
                  <div className="d-flex flex-wrap gap-3 text-muted small">
                    {product.brand && <span><strong>Brand:</strong> {product.brand}</span>}
                    {product.model && <span><strong>Model:</strong> {product.model}</span>}
                  </div>
                </div>

                <p className="lead">{product.description || 'No description available.'}</p>
                {product.short_description && <p className="small text-muted">{product.short_description}</p>}

                {/* Variant selectors */}
                <div className="variants-section mb-4">
                  <div className="variant-selector">
                    {product.color && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Color</label>
                        <div className="d-flex gap-3 align-items-center">
                          {/* Color Swatch */}
                          <div 
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '8px',
                              border: '2px solid #e0e0e0',
                              backgroundColor: product.color.startsWith('#') ? product.color : '#cccccc',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            title={product.color}
                          />
                          {/* <div>
                            <select className="form-select w-auto" value={selectedColor} onChange={e => setSelectedColor(e.target.value)}>
                              <option value={product.color}>{product.color}</option>
                            </select>
                          </div> */}
                        </div>
                      </div>
                    )}

                    {product.size && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Size</label>
                        <div className="d-flex gap-2">
                          <select className="form-select w-auto" value={selectedSize} onChange={e => setSelectedSize(e.target.value)}>
                            <option value={product.size}>{product.size}</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {(product.dimensions || product.weight) && (
                      <div className="specifications mt-3 pt-3 border-top">
                        {product.dimensions && (
                          <div className="small mb-2">
                            <span className="text-muted">Dimensions:</span> {product.dimensions}
                          </div>
                        )}
                        {product.weight && (
                          <div className="small">
                            <span className="text-muted">Weight:</span> {product.weight}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="purchase-section mb-4">
                  {/* <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="quantity-selector">
                    <label className="form-label fw-bold small mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={product.stock_quantity}
                      className="form-control quantity-input"
                      value={qty}
                      disabled
                      onChange={e => setQty(Math.max(1, Math.min(product.stock_quantity, Number(e.target.value || 1))))}
                    />
                  </div>
                  <div className="small text-muted mt-3">
                    {product.stock_quantity > 10 ? 'Many in stock' : product.stock_quantity > 0 ? 'Limited stock' : 'Out of stock'}
                  </div>
                </div> */}

                  <div className="action-butto gap-5 d-fle  ">
                    <button
                      className="btn btn-primar item-cart-btn mb-2"
                      style={{ background: 'var(--brand)', borderColor: 'var(--brand)' }}
                      onClick={handleAddToCart}
                      disabled={product.stock_quantity === 0}
                    >
                      <FaBox /> Add to cart
                    </button>
                    {/* <button
                      className={`btn  ${isWishlisted ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={handleToggleWishlist}
                      disabled={wishlistLoading}
                    >
                      {wishlistLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          {isWishlisted ? <FaHeart /> : <FaRegHeart />} {isWishlisted ? 'Wishlisted' : 'Add to wishlist'}
                        </>
                      )}
                    </button> */}
                  </div>
                </div>

                <div className="seller-shipping mb-3 gap-3">
                  {product.category && (
                    <div className="seller card p-2">
                      <div className="small text-muted">Category</div>
                      <div className="fw-bold" style={{ color: 'var(--brand)' }}>{product.category.name}</div>
                      <div className="small text-muted">{product.category.description}</div>
                    </div>
                  )}

                  <div className="shipping card p-2">
                    <div className="small text-muted">Shipping</div>
                    <div className="fw-bold">{product.requires_shipping ? 'Requires Shipping' : 'Digital Product'}</div>
                    {product.requires_shipping && <div className="small text-muted">Shipping charges may apply</div>}
                  </div>
                </div>

                <div className="policy small text-muted">
                  {product.warranty_period && <div><strong>Warranty:</strong> {product.warranty_period} {product.warranty_period === 1 ? 'year' : 'years'}</div>}
                  {/* {product.tax_rate && <div><strong>Tax Rate:</strong> {product.tax_rate}%</div>} */}
                  {product.model && <div><strong>Model:</strong> {product.model}</div>}
                </div>

                <div className="features-grid">
                  <div className="feature-card">
                    <FaShippingFast className="feature-icon" />
                    <div className="small fw-bold">Fast Delivery</div>
                    <div className="small text-muted">Quick shipping nationwide</div>
                  </div>
                  <div className="feature-card">
                    <FaShieldAlt className="feature-icon" />
                    <div className="small fw-bold">Secure Payment</div>
                    <div className="small text-muted">100% secure checkout</div>
                  </div>
                  <div className="feature-card">
                    <FaStore className="feature-icon" />
                    <div className="small fw-bold">Authentic Product</div>
                    <div className="small text-muted">Quality guaranteed</div>
                  </div>
                </div>

                {/* Share Section - Jumia Style */}
                <div className="share-section mt-4 pt-4 border-top">
                  <h6 className="mb-3 text-muted">SHARE THIS PRODUCT</h6>
                  <div className="d-flex gap-2">
                    <button
                      className="share-btn facebook"
                      title="Share on Facebook"
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    >
                      <FaFacebookF />
                    </button>
                    <button
                      className="share-btn twitter"
                      title="Share on Twitter"
                      onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`, '_blank')}
                    >
                      <FaTwitter />
                    </button>
                    <button
                      className="share-btn whatsapp"
                      title="Share on WhatsApp"
                      onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`, '_blank')}
                    >
                      <FaWhatsapp />
                    </button>
                    <button
                      className="share-btn copy-link"
                      title="Copy Link"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard!');
                      }}
                    >
                      <FaLink />
                    </button>
                    <button
                      className="share-btn qr-code"
                      title="Show QR Code"
                      onClick={() => setQrModalIsOpen(true)}
                    >
                      <FaQrcode />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">


            {/* <div className="col-lg-4">
            <div className="card p-3 mb-3">
              <h6>Stock Information</h6>
              <div className="small text-muted">
                <div>Current Stock: {product.stock_quantity}</div>
                <div>Minimum Stock Level: {product.min_stock_level}</div>
                <div>Product Type: {product.is_digital ? 'Digital Product' : 'Physical Product'}</div>
              </div>
            </div>

            <div className="card p-3">
              <h6>Pricing Details</h6>
              <div className="small text-muted">
                <div>Regular Price: {formatNGN(product.price)}</div>
                {product.sale_price && <div>Sale Price: {formatNGN(product.sale_price)}</div>}
                {product.cost_price && <div>Cost Price: {formatNGN(product.cost_price)}</div>}
                {product.tax_rate && <div>Tax Rate: {product.tax_rate}%</div>}
              </div>
            </div>
          </div> */}
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      <Modal
        isOpen={qrModalIsOpen}
        onRequestClose={() => setQrModalIsOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          },
          content: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto'
          }
        }}
      >
        <div className="qr-modal-content">
          <h5 className="mb-3">Scan QR Code</h5>
          <p className="text-muted small mb-3">Scan this code to view this product on your phone</p>
          
          <div className="qr-code-container p-3 bg-light rounded mb-3 d-inline-block">
            <QRCodeCanvas
              value={window.location.href}
              size={200}
              level={"H"}
              includeMargin={true}
              imageSettings={{
                src: product?.image ? `${import.meta.env.VITE_API_URL}${product.image}` : '',
                height: 40,
                width: 40,
                excavate: true
              }}
            />
          </div>
          
          <div className="product-name mb-3">
            <strong>{product?.name}</strong>
          </div>
          
          <div className="product-url mb-3">
            <small className="text-muted text-break">{window.location.href}</small>
          </div>
          
          <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied to clipboard!');
            }}
          >
            Copy Link
          </button>
          
          <button
            className="btn btn-outline-secondary btn-sm mb-2 ms-2"
            onClick={() => setQrModalIsOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
