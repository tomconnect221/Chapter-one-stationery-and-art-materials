import React from 'react';
import './ProductView.css';

const ProductForm = ({
  mode,
  product,
  color = '',
  onChange,
  onColorChange,
  onImageChange,
  onImagesChange,
  onRemoveImage,
  onRemoveAdditionalImage,
  onTagChange,
  imagePreview,
  imagesPreviews,
  errors,
  loading,
  categories,
  branches,
  onSave,
  onCancel
}) => {
  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toLocaleString()}`;
  };

  return (
    <div className="pf-container">
      {/* Header */}
      <div className={`pf-header ${mode === 'add' ? 'pf-header-add' : 'pf-header-edit'}`}>
        <div className="pf-header-left">
          <button className="pf-back-btn" onClick={onCancel}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Cancel
          </button>
          <div className="pf-title-section">
            <h1 className="pf-title">{mode === 'add' ? 'Add New Product' : 'Edit Product'}</h1>
            <p className="pf-subtitle">{mode === 'add' ? 'Fill in the details to create a new product' : 'Update product information below'}</p>
          </div>
        </div>
        <div className="pf-header-right">
          <button 
            className="pf-save-btn" 
            onClick={onSave} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="pf-spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {mode === 'add' ? 'Create Product' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="pf-content">
        {/* Left Column - Basic Info & Media */}
        <div className="pf-left-column">
          {/* Basic Information Card */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3>Basic Information</h3>
            </div>
            <div className="pf-card-body">
              <div className="pf-form-group">
                <label>Product Name <span className="pf-required">*</span></label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => onChange({ ...product, name: e.target.value })}
                  placeholder="Enter product name"
                  className={errors.name ? 'pf-input-error' : ''}
                  disabled={loading}
                />
                {errors.name && <span className="pf-error-text">{errors.name[0]}</span>}
              </div>

              <div className="pf-form-row">
                <div className="pf-form-group">
                  <label>SKU <span className="pf-required">*</span></label>
                  <input
                    type="text"
                    value={product.sku}
                    onChange={(e) => onChange({ ...product, sku: e.target.value })}
                    placeholder="SKU-001"
                    className={errors.sku ? 'pf-input-error' : ''}
                    disabled={loading}
                  />
                  {errors.sku && <span className="pf-error-text">{errors.sku[0]}</span>}
                </div>

                <div className="pf-form-group">
                  <label>Barcode</label>
                  <input
                    type="text"
                    value={product.barcode}
                    onChange={(e) => onChange({ ...product, barcode: e.target.value })}
                    placeholder="Barcode number"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="pf-form-row">
                <div className="pf-form-group">
                  <label>Category <span className="pf-required">*</span></label>
                  <select
                    value={product.category_id}
                    onChange={(e) => onChange({ ...product, category_id: e.target.value })}
                    className={errors.category_id ? 'pf-input-error' : ''}
                    disabled={loading}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <span className="pf-error-text">{errors.category_id[0]}</span>}
                </div>

                <div className="pf-form-group">
                  <label>Branch <span className="pf-required">*</span></label>
                  <select
                    value={product.branch_id}
                    onChange={(e) => onChange({ ...product, branch_id: e.target.value })}
                    className={errors.branch_id ? 'pf-input-error' : ''}
                    disabled={loading}
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                  {errors.branch_id && <span className="pf-error-text">{errors.branch_id[0]}</span>}
                </div>
              </div>

              <div className="pf-form-group">
                <label>Status</label>
                <div className="pf-toggle-group">
                  <button
                    type="button"
                    className={`pf-toggle-btn ${product.is_active ? 'pf-toggle-active' : ''}`}
                    onClick={() => onChange({ ...product, is_active: true })}
                    disabled={loading}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className={`pf-toggle-btn ${!product.is_active ? 'pf-toggle-inactive' : ''}`}
                    onClick={() => onChange({ ...product, is_active: false })}
                    disabled={loading}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>Pricing</h3>
            </div>
            <div className="pf-card-body">
              <div className="pf-price">
                <div className="pf-price-label">Selling Price</div>
                <div className="pf-price-input-wrapper">
                  <span className="pf-currency">₦</span>
                  <input
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => onChange({ ...product, price: e.target.value })}
                    placeholder="0.00"
                    className={`pf-price-input ${errors.price ? 'pf-input-error' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.price && <span className="pf-error-text">{errors.price[0]}</span>}
              </div>

              <div className="pf-form-row">
                <div className="pf-form-group">
                  <label>Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.cost_price}
                    onChange={(e) => onChange({ ...product, cost_price: e.target.value })}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>

                <div className="pf-form-group">
                  <label>Sale Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.sale_price}
                    onChange={(e) => onChange({ ...product, sale_price: e.target.value })}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="pf-form-row">
                <div className="pf-form-group">
                  <label>Stock Quantity <span className="pf-required">*</span></label>
                  <input
                    type="number"
                    value={product.stock_quantity}
                    onChange={(e) => onChange({ ...product, stock_quantity: e.target.value })}
                    placeholder="0"
                    className={errors.stock_quantity ? 'pf-input-error' : ''}
                    disabled={loading}
                  />
                  {errors.stock_quantity && <span className="pf-error-text">{errors.stock_quantity[0]}</span>}
                </div>

                <div className="pf-form-group">
                  <label>Min Stock Level</label>
                  <input
                    type="number"
                    value={product.min_stock_level}
                    onChange={(e) => onChange({ ...product, min_stock_level: e.target.value })}
                    placeholder="0"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images Card */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <h3>Product Images</h3>
            </div>
            <div className="pf-card-body">
              <div className="pf-image-upload-section">
                <label>Primary Image {mode === 'add' ? <span className="pf-required">*</span> : ''}</label>
                <div className="pf-image-upload">
                  {imagePreview ? (
                    <div className="pf-image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="pf-remove-image"
                        onClick={onRemoveImage}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="pf-image-placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Click to upload image</span>
                      <p>PNG, JPG up to 2MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className={errors.image ? 'pf-input-error' : ''}
                    required={mode === 'add'}
                  />
                </div>
                {errors.image && <span className="pf-error-text">{errors.image[0]}</span>}
              </div>

              <div className="pf-image-upload-section">
                <label>Additional Images</label>
                <div className="pf-image-upload pf-image-upload-small">
                  {imagesPreviews.length > 0 ? (
                    <div className="pf-additional-images">
                      {imagesPreviews.map((preview, index) => (
                        <div key={index} className="pf-additional-image">
                          <img src={preview} alt={`Additional ${index + 1}`} />
                          <button
                            type="button"
                            className="pf-remove-image"
                            onClick={() => onRemoveAdditionalImage(index)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                      <label className="pf-add-more-images">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={onImagesChange}
                          className="pf-hidden-input"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="pf-image-placeholder pf-image-placeholder-small">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Add more images</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onImagesChange}
                        className="pf-hidden-input"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details & Options */}
        <div className="pf-right-column">
          {/* Product Details Card */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <h3>Product Details</h3>
            </div>
            <div className="pf-card-body">
              <div className="pf-form-row">
                <div className="pf-form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={product.brand}
                    onChange={(e) => onChange({ ...product, brand: e.target.value })}
                    placeholder="Brand name"
                    disabled={loading}
                  />
                </div>

                <div className="pf-form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    value={product.model}
                    onChange={(e) => onChange({ ...product, model: e.target.value })}
                    placeholder="Model number"
                    disabled={loading}
                  />
                </div>
              </div>
                <div className="pf-form-row">
                <div className="pf-form-group">
                  <label>Color</label>
                  <div className="pf-colors-container">
                    {color ? (
                      <div className="pf-color-chip" title={`#${color.slice(1).toUpperCase()}`}>
                        <div 
                          className="pf-color-swatch" 
                          style={{ backgroundColor: color }}
                          onClick={() => navigator.clipboard.writeText(color)}
                        />
                        <button
                          type="button"
                          className="pf-color-remove"
                          onClick={() => onColorChange('')}
                          disabled={loading}
                          title="Clear color"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="pf-placeholder-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                        <span>No color selected</span>
                      </div>
                    )}
                    <label className="pf-color-picker">
                      <input
                        type="color"
                        value={color || "#ff5733"}
                        onChange={(e) => onColorChange(e.target.value)}
                        disabled={loading}
                        className="pf-color-input"
                        title="Pick product color"
                      />
                      <span className="pf-picker-label">{color ? 'Change Color' : 'Pick Color'}</span>
                    </label>
                  </div>
                  {errors.colors && <span className="pf-error-text">{errors.colors}</span>}
                </div>

                <div className="pf-form-group">
                  <label>Size</label>
                  <input
                    type="text"
                    value={product.size}
                    onChange={(e) => onChange({ ...product, size: e.target.value })}
                    placeholder="Size"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="pf-form-row">
                <div className="pf-form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.weight}
                    onChange={(e) => onChange({ ...product, weight: e.target.value })}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>

                <div className="pf-form-group">
                  <label>Dimensions</label>
                  <input
                    type="text"
                    value={product.dimensions}
                    onChange={(e) => onChange({ ...product, dimensions: e.target.value })}
                    placeholder="L x W x H"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="pf-form-row">
                <div className="pf-form-group">
                  <label>Warranty (years)</label>
                  <input
                    type="number"
                    value={product.warranty_period}
                    onChange={(e) => onChange({ ...product, warranty_period: e.target.value })}
                    placeholder="0"
                    disabled={loading}
                  />
                </div>

                <div className="pf-form-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.tax_rate}
                    onChange={(e) => onChange({ ...product, tax_rate: e.target.value })}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Descriptions Card */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3>Descriptions</h3>
            </div>
            <div className="pf-card-body">
              <div className="pf-form-group">
                <label>Short Description</label>
                <textarea
                  value={product.short_description}
                  onChange={(e) => onChange({ ...product, short_description: e.target.value })}
                  placeholder="Brief product description"
                  rows="2"
                  disabled={loading}
                />
              </div>

              <div className="pf-form-group">
                <label>Full Description</label>
                <textarea
                  value={product.description}
                  onChange={(e) => onChange({ ...product, description: e.target.value })}
                  placeholder="Detailed product description"
                  rows="4"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Flags Card */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3>Product Flags</h3>
            </div>
            <div className="pf-card-body">
              <div className="pf-flags-grid">
                <label className={`pf-flag-checkbox ${product.is_featured ? 'pf-flag-active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={product.is_featured}
                    onChange={(e) => onChange({ ...product, is_featured: e.target.checked })}
                    disabled={loading}
                  />
                  <span className="pf-flag-icon">⭐</span>
                  <span className="pf-flag-text">Featured</span>
                </label>

                <label className={`pf-flag-checkbox ${product.is_digital ? 'pf-flag-active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={product.is_digital}
                    onChange={(e) => onChange({ ...product, is_digital: e.target.checked })}
                    disabled={loading}
                  />
                  <span className="pf-flag-icon">📱</span>
                  <span className="pf-flag-text">Digital</span>
                </label>

                <label className={`pf-flag-checkbox ${product.requires_shipping ? 'pf-flag-active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={product.requires_shipping}
                    onChange={(e) => onChange({ ...product, requires_shipping: e.target.checked })}
                    disabled={loading}
                  />
                  <span className="pf-flag-icon">🚚</span>
                  <span className="pf-flag-text">Shipping</span>
                </label>
              </div>
            </div>
          </div>

          {/* SEO Card */}
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <h3>SEO</h3>
            </div>
            <div className="pf-card-body">
              <div className="pf-form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  value={product.meta_title}
                  onChange={(e) => onChange({ ...product, meta_title: e.target.value })}
                  placeholder="SEO title"
                  disabled={loading}
                />
              </div>

              <div className="pf-form-group">
                <label>Meta Description</label>
                <textarea
                  value={product.meta_description}
                  onChange={(e) => onChange({ ...product, meta_description: e.target.value })}
                  placeholder="SEO description"
                  rows="2"
                  disabled={loading}
                />
              </div>

              <div className="pf-form-group">
                <label>Meta Keywords</label>
                <input
                  type="text"
                  value={product.meta_keywords}
                  onChange={(e) => onChange({ ...product, meta_keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                  disabled={loading}
                />
              </div>

              <div className="pf-form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={product.tags ? product.tags.join(', ') : ''}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    onChange({ ...product, tags });
                  }}
                  placeholder="tag1, tag2, tag3"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
