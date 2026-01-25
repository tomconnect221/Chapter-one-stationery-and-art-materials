import React from 'react';
import useProducts from '../../hooks/useProducts';
import ProductCard from './ProductCard';
import './styles.css';

const BestSellers = () => {
  const { products, loading, error } = useProducts({
    type: 'bestSeller',
    limit: 8
  });

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading best sellers...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>Error: {error}</p>
    </div>
  );

  return (
    <section className="best-sellers-section">
      <div className="section-header">
        <h2>Best Sellers</h2>
        <p>Our most popular products that customers love</p>
      </div>
      
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default BestSellers;