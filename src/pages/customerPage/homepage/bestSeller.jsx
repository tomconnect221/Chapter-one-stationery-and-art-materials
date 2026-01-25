import React from 'react';
import './HomePagestyling.css';
import ProductItem from '../../../component/productItem/template';
import useProducts from '../../../hooks/useProducts';
import { useWishlistData } from '../../../hooks/useWishlistData';

const HomeBestSeller = () => {
    const {
        products,
        loading,
        error,
        pagination,
        handlePageChange,
        formatPrice
    } = useProducts({
        limit: 200,
        isFeatured: true,
        page: 1
    });
    
    const { isWishlisted, getWishlistId, updateWishlist } = useWishlistData();

    if (loading) {
        return (
            <div className="featured-product pt0 pb90">
                <div className="verticalLimit">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading best selling products...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="featured-product pt0 pb90">
                <div className="verticalLimit">
                    <div className="alert alert-danger">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    // Pagination component
    const Pagination = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.lastPage, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="row">
                <div className="col-lg-12">
                    <div className="mt50">
                        <ul className="page_navigation text-center">
                            <li className="page-item">
                                <button 
                                    className="page-link" 
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                >
                                    <span className="flaticon-left-arrow">‹</span>
                                </button>
                            </li>
                            
                            {pageNumbers.map(number => (
                                <li 
                                    key={number} 
                                    className={`page-item ${pagination.currentPage === number ? 'active' : ''}`}
                                >
                                    <button 
                                        className="page-link" 
                                        onClick={() => handlePageChange(number)}
                                    >
                                        {number}
                                    </button>
                                </li>
                            ))}
                            
                            <li className="page-item">
                                <button 
                                    className="page-link" 
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.lastPage}
                                >
                                    <span className="flaticon-right-arrow">›</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <section className="featured-product pt0 pb90">
                <div className="verticalLimit">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="main-title text-left mb40">
                                <h2>Best Selling Products</h2>
                            </div>
                        </div>
                    </div>
                    
                    {/* Products Grid */}
                    <div className="row">
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductItem
                                    key={product.id}
                                    view={'home'}
                                    product={{
                                        ...product,
                                        price: formatPrice(product.price),
                                        oldPrice: product.sale_price ? formatPrice(product.price) : null,
                                        currentPrice: product.sale_price ? formatPrice(product.sale_price) : formatPrice(product.price),
                                    }}
                                    isWishlisted={isWishlisted(product.id)}
                                    wishlistId={getWishlistId(product.id)}
                                />
                            ))
                        ) : (
                            <div className="col-12 text-center">
                                <h3>No products available</h3>
                                <p className="text-muted">Check back later for new products</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {pagination.lastPage > 1 && <Pagination />}
                </div>
            </section>

            {/* Styles */}
            <style jsx>{`

            .main-title{
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 10px;
                    // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    // -webkit-background-clip: text;
                    // -webkit-text-fill-color: transparent;
                    }
                .loading-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 200px;
                    flex-direction: column;
                }
                .spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .page_navigation {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 5px;
                    list-style: none;
                    padding: 0;
                }
                .page-item .page-link {
                    border: 1px solid #dee2e6;
                    padding: 8px 16px;
                    color: #007bff;
                    background: white;
                    cursor: pointer;
                }
                .page-item.active .page-link {
                    background-color: #007bff;
                    border-color: #007bff;
                    color: white;
                }
                .page-item:not(.active) .page-link:hover {
                    background-color: #e9ecef;
                }
                .page-item:first-child .page-link,
                .page-item:last-child .page-link {
                    border-radius: 4px;
                }
                .page-link:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
        </>
    );
};

export default HomeBestSeller;