import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductSelector = ({ token, selectedProducts, onProductsChange, apiUrl }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (showDropdown && products.length === 0) {
      fetchProducts();
    }
  }, [showDropdown]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProducts(response.data.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    !selectedProducts.some(p => p.id === product.id) &&
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProduct = (product) => {
    // Check if product already exists
    if (selectedProducts.some(p => p.id === product.id)) {
      toast.warning(`${product.name} is already added`);
      return;
    }

    onProductsChange([...selectedProducts, {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image: product.image
    }]);

    setSearchTerm('');
    setShowDropdown(false);
    toast.success(`${product.name} added to ad`);
  };

  const handleRemoveProduct = (productId) => {
    onProductsChange(selectedProducts.filter(p => p.id !== productId));
    toast.info('Product removed from ad');
  };

  return (
    <div style={{ padding: '16px', border: '2px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#212529', marginBottom: '12px', marginTop: 0 }}>
        Add Products to Ad
      </h4>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        {/* Dropdown */}
        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              border: '2px solid #e5e7eb',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000
            }}
          >
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                Loading products...
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  {product.image && (
                    <img
                      src={`${apiUrl}/storage${product.image}`}
                      alt={product.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#212529' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      SKU: {product.sku} | Price: ₦{parseFloat(product.price).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                {searchTerm ? 'No products found' : 'No more products to add'}
              </div>
            )}
          </div>
        )}

        {/* Click outside to close */}
        {showDropdown && (
          <div
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999
            }}
          />
        )}
      </div>

      {/* Selected Products */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#6c757d', marginBottom: '12px' }}>
          Selected Products ({selectedProducts.length})
        </div>

        {selectedProducts.length > 0 ? (
          <div style={{ display: 'grid', gap: '8px' }}>
            {selectedProducts.map(product => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#e7f3ff',
                  border: '1px solid #b3d9ff',
                  borderRadius: '6px'
                }}
              >
                {product.image && (
                  <img
                    src={`${apiUrl}/storage${product.image}`}
                    alt={product.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#212529', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>
                    ₦{parseFloat(product.price).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveProduct(product.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '6px',
              color: '#856404',
              fontSize: '13px',
              textAlign: 'center'
            }}
          >
            No products added yet. Search and select products for this ad.
          </div>
        )}
      </div>

      {/* Info Message */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6c757d', padding: '8px 12px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        ℹ️ Duplicate products cannot be added. Each product appears only once per ad.
      </div>
    </div>
  );
};

export default ProductSelector;
