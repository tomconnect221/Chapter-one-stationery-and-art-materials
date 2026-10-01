import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { addToWishlist } from '../../store/wishlistSlice';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (product.variants?.length > 0) {
      navigate(`/product/${product.id}`);
      return;
    }
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    }));
  };

  const handleAddToWishlist = () => {
    dispatch(addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    }));
  };

  const formatPrice = (price) => {
    return `₦${Number(price).toLocaleString()}`;
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <div className="product-actions">
          <button onClick={handleAddToWishlist} className="wishlist-btn" title="Add to Wishlist">
            ❤️
          </button>
          <button onClick={handleAddToCart} className="cart-btn" title={product.variants?.length ? 'Choose product options' : 'Add to Cart'}>
            {product.variants?.length ? 'Options' : '🛒'}
          </button>
        </div>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.short_description}</p>
        
        <div className="product-price-container">
          <span className="product-price">{product.variants?.length > 0 ? 'From ' : ''}{formatPrice(product.price)}</span>
          {product.sale_price && (
            <span className="product-sale-price">{formatPrice(product.sale_price)}</span>
          )}
        </div>

        {product.stock_quantity <= product.min_stock_level && (
          <span className="low-stock-warning">Low Stock!</span>
        )}
        
        {product.stock_quantity === 0 && (
          <span className="out-of-stock">Out of Stock</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;