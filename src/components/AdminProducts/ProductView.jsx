import React from 'react';
import './ProductView.css';

const ProductView = ({ product, onBack, onEdit, canEdit }) => {
  if (!product) return null;

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = () => {
    if (product.stock_quantity <= 0) return { class: 'out', label: 'Out of Stock' };
    if (product.stock_quantity < 10) return { class: 'low', label: 'Low Stock' };
    return { class: 'in', label: 'In Stock' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="pv-container">
      {/* Header */}
      <div className="pv-header">
        <div className="pv-header-left">
          <button className="pv-back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Products
          </button>
          <div className="pv-title-section">
            <h1 className="pv-title">{product.name}</h1>
            <div className="pv-badges">
              <span className={`pv-badge pv-badge-${stockStatus.class}`}>{stockStatus.label}</span>
              {product.is_featured && <span className="pv-badge pv-badge-featured">Featured</span>}
              {product.is_digital && <span className="pv-badge pv-badge-digital">Digital</span>}
            </div>
          </div>
        </div>
        <div className="pv-header-right">
          {canEdit && (
            <button className="pv-edit-btn" onClick={() => onEdit && onEdit(product)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Product
            </button>
          )}
        </div>
      </div>

      <div className="pv-content">
        {/* Left Column - Images */}
        <div className="pv-left-column">
          <div className="pv-card">
            <div className="pv-card-header">
              <h3>Product Images</h3>
            </div>
            <div className="pv-card-body">
              <div className="pv-main-image-container">
                {product.image ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}${product.image}`} 
                    alt={product.name} 
                    className="pv-main-image"
                  />
                ) : (
                  <div className="pv-no-image">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>No Image</span>
                  </div>
                )}
              </div>
              {product.images && product.images.length > 0 && (
                <div className="pv-image-thumbnails">
                  {product.images.map((img, index) => (
                    <div key={index} className="pv-thumbnail">
                      <img 
                        src={`${import.meta.env.VITE_API_URL}${img}`} 
                        alt={`${product.name} - ${index + 1}`} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="pv-card">
            <div className="pv-card-header">
              <h3>Quick Info</h3>
            </div>
            <div className="pv-card-body">
              <div className="pv-quick-info-grid">
                <div className="pv-quick-info-item">
                  <span className="pv-quick-label">SKU</span>
                  <span className="pv-quick-value">{product.sku || 'N/A'}</span>
                </div>
                <div className="pv-quick-info-item">
                  <span className="pv-quick-label">Barcode</span>
                  <span className="pv-quick-value">{product.barcode || 'N/A'}</span>
                </div>
                <div className="pv-quick-info-item">
                  <span className="pv-quick-label">Category</span>
                  <span className="pv-quick-value">{product.category?.name || 'N/A'}</span>
                </div>
                <div className="pv-quick-info-item">
                  <span className="pv-quick-label">Branch</span>
                  <span className="pv-quick-value">{product.branch?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="pv-right-column">
          {/* Price & Stock Card */}
          <div className="pv-card pv-price-card">
            <div className="pv-price-section">
              <div className="pv-current-price">
                <span className="pv-price-label">Selling Price</span>
                <span className="pv-price-value">{formatCurrency(product.price)}</span>
              </div>
              <div className="pv-price-others">
                <div className="pv-price-item">
                  <span className="pv-price-label">Cost Price</span>
                  <span className="pv-price-secondary">{formatCurrency(product.cost_price)}</span>
                </div>
                <div className="pv-price-item">
                  <span className="pv-price-label">Sale Price</span>
                  <span className="pv-price-secondary">{formatCurrency(product.sale_price)}</span>
                </div>
              </div>
            </div>
            <div className="pv-stock-section">
              <div className="pv-stock-display">
                <span className="pv-stock-number">{product.stock_quantity}</span>
                <span className="pv-stock-label">units in stock</span>
              </div>
              <div className="pv-stock-min">
                Min. stock level: {product.min_stock_level || 0}
              </div>
            </div>
          </div>

          {/* Specifications Card */}
          <div className="pv-card">
            <div className="pv-card-header">
              <h3>Specifications</h3>
            </div>
            <div className="pv-card-body">
              <div className="pv-specs-grid">
                {product.brand && (
                  <div className="pv-spec-item">
                    <span className="pv-spec-label">Brand</span>
                    <span className="pv-spec-value">{product.brand}</span>
                  </div>
                )}
                {product.model && (
                  <div className="pv-spec-item">
                    <span className="pv-spec-label">Model</span>
                    <span className="pv-spec-value">{product.model}</span>
                  </div>
                )}
{(product.colors && product.colors.length > 0) && (
                  <div className="pv-spec-item">
                    <span className="pv-spec-label">Colors</span>
                    <span className="pv-spec-value">
                      <div className="pv-colors-list">
                        {product.colors.slice(0, 5).map((color, index) => (
                          <span key={index} className="pv-color-dot" style={{ backgroundColor: color }} title={color}></span>
                        ))}
                        {product.colors.length > 5 && <span>+{product.colors.length - 5} more</span>}
                      </div>
                      {product.colors.join(', ')}
                    </span>
                  </div>
                )}
                {product.size && (
                  <div className="pv-spec-item">
                    <span className="pv-spec-label">Size</span>
                    <span className="pv-spec-value">{product.size}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="pv-spec-item">
                    <span className="pv-spec-label">Weight</span>
                    <span className="pv-spec-value">{product.weight} kg</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="pv-spec-item">
                    <span className="pv-spec-label">Dimensions</span>
                    <span className="pv-spec-value">{product.dimensions}</span>
                  </div>
                )}
                {product.warranty_period && (
                  <div className="pv-spec-item">
                    <span className="pv-spec-label">Warranty</span>
                    <span className="pv-spec-value">{product.warranty_period} years</span>
                  </div>
                )}
                {product.tax_rate && (
                  <div className="pv-spec-item">
                    <span className="pv-spec-label">Tax Rate</span>
                    <span className="pv-spec-value">{product.tax_rate}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Card */}
          {(product.short_description || product.description) && (
            <div className="pv-card">
              <div className="pv-card-header">
                <h3>Description</h3>
              </div>
              <div className="pv-card-body">
                {product.short_description && (
                  <div className="pv-description-section">
                    <h4>Short Description</h4>
                    <p>{product.short_description}</p>
                  </div>
                )}
                {product.description && (
                  <div className="pv-description-section">
                    <h4>Full Description</h4>
                    <div className="pv-full-description" dangerouslySetInnerHTML={{ __html: product.description }}></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags Card */}
          {product.tags && product.tags.length > 0 && (
            <div className="pv-card">
              <div className="pv-card-header">
                <h3>Tags</h3>
              </div>
              <div className="pv-card-body">
                <div className="pv-tags-container">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="pv-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEO Card */}
          {(product.meta_title || product.meta_description || product.meta_keywords) && (
            <div className="pv-card">
              <div className="pv-card-header">
                <h3>SEO</h3>
              </div>
              <div className="pv-card-body">
                {product.meta_title && (
                  <div className="pv-seo-item">
                    <span className="pv-seo-label">Meta Title</span>
                    <span className="pv-seo-value">{product.meta_title}</span>
                  </div>
                )}
                {product.meta_description && (
                  <div className="pv-seo-item">
                    <span className="pv-seo-label">Meta Description</span>
                    <span className="pv-seo-value">{product.meta_description}</span>
                  </div>
                )}
                {product.meta_keywords && (
                  <div className="pv-seo-item">
                    <span className="pv-seo-label">Meta Keywords</span>
                    <span className="pv-seo-value">{product.meta_keywords}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pv-card">
            <div className="pv-card-header">
              <h3>History</h3>
            </div>
            <div className="pv-card-body">
              <div className="pv-timestamps">
                <div className="pv-timestamp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Created: {formatDate(product.created_at)}</span>
                </div>
                <div className="pv-timestamp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Updated: {formatDate(product.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
