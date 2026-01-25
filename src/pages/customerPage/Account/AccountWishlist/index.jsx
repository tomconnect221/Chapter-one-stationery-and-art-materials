import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountWishlist.css';

const AccountWishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      productId: 'P001',
      name: 'Samsung Galaxy S23 Ultra 5G',
      image: '/images/products/phone1.jpg',
      price: 849999,
      originalPrice: 899999,
      discount: 6,
      rating: 4.5,
      reviews: 1247,
      inStock: true,
      stockCount: 15,
      brand: 'Samsung',
      seller: 'Samsung Official Store',
      deliveryDate: 'Tomorrow',
      freeShipping: true,
      isGift: false,
      addedDate: '2024-01-15'
    },
    {
      id: 2,
      productId: 'P002',
      name: 'Apple iPhone 15 Pro Max 256GB',
      image: '/images/products/phone2.jpg',
      price: 949999,
      originalPrice: 999999,
      discount: 5,
      rating: 4.8,
      reviews: 892,
      inStock: true,
      stockCount: 8,
      brand: 'Apple',
      seller: 'Apple Authorized Reseller',
      deliveryDate: '2-3 days',
      freeShipping: true,
      isGift: true,
      addedDate: '2024-01-14'
    },
    {
      id: 3,
      productId: 'P003',
      name: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
      image: '/images/products/headphones.jpg',
      price: 89999,
      originalPrice: 119999,
      discount: 25,
      rating: 4.6,
      reviews: 2341,
      inStock: false,
      stockCount: 0,
      brand: 'Sony',
      seller: 'Electronics Hub',
      deliveryDate: 'Restocking',
      freeShipping: true,
      isGift: false,
      addedDate: '2024-01-10'
    },
    {
      id: 4,
      productId: 'P004',
      name: 'MacBook Pro 14-inch M2 Pro Chip',
      image: '/images/products/laptop1.jpg',
      price: 1299999,
      originalPrice: 1399999,
      discount: 7,
      rating: 4.9,
      reviews: 567,
      inStock: true,
      stockCount: 5,
      brand: 'Apple',
      seller: 'Apple Authorized Reseller',
      deliveryDate: 'Tomorrow',
      freeShipping: true,
      isGift: false,
      addedDate: '2024-01-12'
    },
    {
      id: 5,
      productId: 'P005',
      name: 'Nike Air Max 270 React',
      image: '/images/products/shoes1.jpg',
      price: 45999,
      originalPrice: 59999,
      discount: 23,
      rating: 4.3,
      reviews: 1789,
      inStock: true,
      stockCount: 25,
      brand: 'Nike',
      seller: 'Nike Official Store',
      deliveryDate: 'Tomorrow',
      freeShipping: true,
      isGift: true,
      addedDate: '2024-01-08'
    }
  ]);

  const [selectedItems, setSelectedItems] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState({});

  const formatPrice = (price) => {
    return `₦${(price / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.id));
    }
  };

  const handleRemoveItem = async (itemId) => {
    setLoading(prev => ({ ...prev, [itemId]: true }));

    await new Promise(resolve => setTimeout(resolve, 500));

    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => prev.filter(id => id !== itemId));
    setLoading(prev => ({ ...prev, [itemId]: false }));
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;

    setLoading(prev => ({ ...prev, bulk: true }));

    await new Promise(resolve => setTimeout(resolve, 800));

    setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setLoading(prev => ({ ...prev, bulk: false }));
  };

  const handleMoveToCart = async (item) => {
    setLoading(prev => ({ ...prev, [item.id]: true }));

    await new Promise(resolve => setTimeout(resolve, 600));

    // In real app, this would add to cart via API
    alert(`Added ${item.name} to cart!`);
    setLoading(prev => ({ ...prev, [item.id]: false }));
  };

  const handleMoveSelectedToCart = async () => {
    if (selectedItems.length === 0) return;

    setLoading(prev => ({ ...prev, bulkCart: true }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedNames = wishlistItems
      .filter(item => selectedItems.includes(item.id))
      .map(item => item.name)
      .join(', ');

    alert(`Added ${selectedItems.length} items to cart: ${selectedNames}`);
    setLoading(prev => ({ ...prev, bulkCart: false }));
  };

  const handleShareWishlist = () => {
    // In real app, this would generate a shareable link
    alert('Wishlist sharing feature coming soon!');
  };

  const getSortedItems = () => {
    const items = [...wishlistItems];

    switch (sortBy) {
      case 'price-low':
        return items.sort((a, b) => a.price - b.price);
      case 'price-high':
        return items.sort((a, b) => b.price - a.price);
      case 'discount':
        return items.sort((a, b) => b.discount - a.discount);
      case 'rating':
        return items.sort((a, b) => b.rating - a.rating);
      case 'recent':
      default:
        return items.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    }
  };

  const getTotalSavings = () => {
    return wishlistItems.reduce((total, item) => {
      return total + (item.originalPrice - item.price);
    }, 0);
  };

  const sortedItems = getSortedItems();

  return (
    <div className="col-lg-10">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div className="header-content">
            <h1 className="wishlist-title">My Wishlist</h1>
            <p className="wishlist-subtitle">
              {wishlistItems.length} items • Save {formatPrice(getTotalSavings())}
            </p>
          </div>

          <div className="header-actions">
            <button
              className="btn btn-outline share-btn"
              onClick={handleShareWishlist}
            >
              <span className="btn-icon">📤</span>
              Share Wishlist
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {wishlistItems.length > 0 && (
          <div className="wishlist-actions">
            <div className="bulk-select">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedItems.length === wishlistItems.length && wishlistItems.length > 0}
                  onChange={handleSelectAll}
                />
                <span className="checkmark"></span>
                Select All ({selectedItems.length})
              </label>
            </div>

            <div className="bulk-buttons">
              {selectedItems.length > 0 && (
                <>
                  <button
                    className="btn btn-primary move-to-cart-btn"
                    onClick={handleMoveSelectedToCart}
                    disabled={actionLoading.bulkCart}
                  >
                    {actionLoading.bulkCart ? (
                      <>
                        <div className="spinner"></div>
                        Adding...
                      </>
                    ) : (
                      `Add ${selectedItems.length} to Cart`
                    )}
                  </button>
                  <button
                    className="btn btn-danger remove-btn"
                    onClick={handleRemoveSelected}
                    disabled={actionLoading.bulk}
                  >
                    {actionLoading.bulk ? (
                      <>
                        <div className="spinner"></div>
                        Removing...
                      </>
                    ) : (
                      `Remove ${selectedItems.length}`
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Sort Options */}
        {wishlistItems.length > 0 && (
          <div className="sort-options">
            <label className="sort-label">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        )}

        {/* Wishlist Items */}
        <div className="wishlist-content">
          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist">
              <div className="empty-icon">❤️</div>
              <h2>Your wishlist is empty</h2>
              <p>Save your favorite items here for easy access</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="wishlist-grid">
              {sortedItems.map(item => (
                <div key={item.id} className="wishlist-item">
                  {/* Selection Checkbox */}
                  <div className="item-select">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>

                  {/* Product Image */}
                  <div className="item-image">
                    <img
                      src={item.image}
                      alt={item.name}
                      onClick={() => navigate(`/product/${item.productId}`)}
                      // onError={(e) => {
                      //   e.target.src = 'https://via.placeholder.com/200x200?text=Product';
                      // }}
                    />
                    {item.discount > 0 && (
                      <div className="discount-badge">-{item.discount}%</div>
                    )}
                    {item.isGift && (
                      <div className="gift-badge">🎁 Gift</div>
                    )}
                    {!item.inStock && (
                      <div className="out-of-stock-overlay">
                        <span>Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="item-details">
                    <div className="product-brand">{item.brand}</div>
                    <h3
                      className="product-name"
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      {item.name}
                    </h3>

                    <div className="product-rating">
                      <div className="stars">
                        {'★'.repeat(Math.floor(item.rating))}
                        {'☆'.repeat(5 - Math.floor(item.rating))}
                      </div>
                      <span className="rating-text">({item.reviews.toLocaleString()})</span>
                    </div>

                    <div className="product-seller">
                      Sold by: <span className="seller-name">{item.seller}</span>
                    </div>

                    <div className="delivery-info">
                      <span className="delivery-icon">🚚</span>
                      {item.inStock ? (
                        <span className="delivery-text">
                          Delivery {item.deliveryDate}
                          {item.freeShipping && <span className="free-shipping"> • FREE</span>}
                        </span>
                      ) : (
                        <span className="delivery-text out-of-stock">Out of Stock</span>
                      )}
                    </div>

                    {item.inStock && item.stockCount < 10 && (
                      <div className="stock-warning">
                        Only {item.stockCount} left in stock
                      </div>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="item-actions">
                    <div className="price-section">
                      <div className="current-price">{formatPrice(item.price)}</div>
                      {item.originalPrice > item.price && (
                        <div className="original-price">{formatPrice(item.originalPrice)}</div>
                      )}
                      {item.discount > 0 && (
                        <div className="savings">Save {formatPrice(item.originalPrice - item.price)}</div>
                      )}
                    </div>

                    <div className="action-buttons">
                      <button
                        className="btn btn-primary add-to-cart-btn"
                        onClick={() => handleMoveToCart(item)}
                        disabled={!item.inStock || actionLoading[item.id]}
                      >
                        {actionLoading[item.id] ? (
                          <div className="spinner"></div>
                        ) : (
                          'Add to Cart'
                        )}
                      </button>

                      <button
                        className="btn btn-remove"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={actionLoading[item.id]}
                        title="Remove from wishlist"
                      >
                        {actionLoading[item.id] ? (
                          <div className="spinner"></div>
                        ) : (
                          'Remove'
                        )}
                      </button>
                    </div>

                    <div className="added-date">
                      Added {formatDate(item.addedDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {wishlistItems.length > 0 && (
          <div className="recommendations-section">
            <h3 className="recommendations-title">You might also like</h3>
            <div className="recommendations-grid">
              {/* In real app, these would be actual recommendations */}
              <div className="recommendation-card">
                <div className="rec-image">
                  <img src="/images/products/phone3.jpg" alt="Recommended product" />
                </div>
                <div className="rec-details">
                  <h4>Google Pixel 7 Pro</h4>
                  <div className="rec-price">{formatPrice(649999)}</div>
                </div>
              </div>
              <div className="recommendation-card">
                <div className="rec-image">
                  <img src="/images/products/tablet1.jpg" alt="Recommended product" />
                </div>
                <div className="rec-details">
                  <h4>Samsung Galaxy Tab S9</h4>
                  <div className="rec-price">{formatPrice(459999)}</div>
                </div>
              </div>
              <div className="recommendation-card">
                <div className="rec-image">
                  <img src="/images/products/watch1.jpg" alt="Recommended product" />
                </div>
                <div className="rec-details">
                  <h4>Apple Watch Series 9</h4>
                  <div className="rec-price">{formatPrice(299999)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountWishlist;