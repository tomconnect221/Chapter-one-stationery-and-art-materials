import React, { useState } from 'react';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import ProductCard from './ProductCard';
import './styles.css';

const Shop = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Get categories using our hook
  const { categories, loading: loadingCategories, error: categoriesError } = useCategories();
  
  // Get products using our hook
  const { 
    products, 
    loading: loadingProducts, 
    error: productsError, 
    pagination,
    formatPrice 
  } = useProducts({
    page: currentPage,
    searchQuery,
    categoryId: selectedCategory,
    limit: 12 // Products per page
  });

  if (loadingProducts || loadingCategories) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading {loadingCategories ? 'categories' : 'products'}...</p>
    </div>
  );

  if (productsError || categoriesError) return (
    <div className="error-container">
      <p>Error: {productsError || categoriesError}</p>
    </div>
  );

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>Our Products</h1>
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
            disabled={loadingCategories}
          >
            <option value="">All Categories</option>
            {loadingCategories ? (
              <option value="" disabled>Loading categories...</option>
            ) : (
              categories
                .filter(category => category.is_active)
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
            )}
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>No products found</p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  price: formatPrice(product.price),
                  oldPrice: product.sale_price ? formatPrice(product.price) : null,
                  currentPrice: product.sale_price ? formatPrice(product.sale_price) : formatPrice(product.price)
                }}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="page-info">
                Page {currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shop;