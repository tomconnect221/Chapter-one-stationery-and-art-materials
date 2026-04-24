import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Import CSS
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import './HomePagestyling.css';
import ProductItem from '../../../component/productItem/template';
import { useWishlistData } from '../../../hooks/useWishlistData';
import { useAuth } from '../../../component/Auth/AuthContext';

const ViewedItemProduct = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef(null);
    const { isWishlisted, getWishlistId } = useWishlistData();
    const { token } = useAuth();

    // Fetch recently viewed products
    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                setLoading(true);
                const headers = {};
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/recently-viewed`, {
                    headers
                });

                if (response.data.success) {
                    // Transform API data to match component structure
                    const transformedProducts = response.data.data.map(item => {
                        const product = item.product;
                        
                        // Calculate if product has a discount from ads
                        const hasDiscount = product.price_after_ad_discount && parseFloat(product.price_after_ad_discount) < parseFloat(product.price);
                        const discountAmount = hasDiscount ? parseFloat(product.price) - parseFloat(product.price_after_ad_discount) : 0;
                        const discountPercentage = hasDiscount ? Math.round((discountAmount / parseFloat(product.price)) * 100) : 0;
                        
                        // Check if product is promotional/ad-based
                        const isPromo = product.ads && product.ads.length > 0;
                        
                        return {
                            id: product.id,
                            name: product.name,
                            price: product.price && !isNaN(product.price) ? parseFloat(product.price) : 0,
                            image: product.image,
                            description: product.description,
                            stock_quantity: product.stock_quantity,
                            is_active: product.is_active,
                            min_stock_level: product.min_stock_level || 0,
                            is_featured: product.is_featured || false,
                            requires_shipping: product.requires_shipping || false,
                            ads: product.ads || [],
                            // Add discount fields
                            originalPrice: parseFloat(product.price),
                            displayPrice: new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN',
                                maximumFractionDigits: 0
                            }).format(parseFloat(product.price)),
                            discountedPrice: hasDiscount ? parseFloat(product.price_after_ad_discount) : parseFloat(product.price),
                            displayDiscountedPrice: hasDiscount ? new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN',
                                maximumFractionDigits: 0
                            }).format(parseFloat(product.price_after_ad_discount)) : new Intl.NumberFormat('en-NG', {
                                style: 'currency',
                                currency: 'NGN',
                                maximumFractionDigits: 0
                            }).format(parseFloat(product.price)),
                            hasDiscount: hasDiscount,
                            discountPercentage: discountPercentage,
                            discountAmount: discountAmount,
                            isPromo: isPromo,
                        };
                    });
                    setRecentlyViewed(transformedProducts);
                }
            } catch (error) {
                console.error('Error fetching recently viewed products:', error);
                setRecentlyViewed([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentlyViewed();
    }, [token]);

    // Use recently viewed products or empty array
    const allProducts = recentlyViewed;

    // Slider configuration - 6 products per slide
    const itemsPerSlide = 6;
    const totalSlides = Math.ceil(allProducts.length / itemsPerSlide);

    // Slider navigation handlers
    const handleNextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            setCurrentSlide(0); // Loop back to first slide
        }
    };

    const handlePrevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        } else {
            setCurrentSlide(totalSlides - 1); // Loop to last slide
        }
    };

    const handleSlideTo = (slideIndex) => {
        setCurrentSlide(slideIndex);
    };

    // Auto slide (optional)
    useEffect(() => {
        const interval = setInterval(() => {
            handleNextSlide();
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [currentSlide, totalSlides]);

    // Get products for current slide
    const getCurrentSlideProducts = () => {
        const startIndex = currentSlide * itemsPerSlide;
        const endIndex = startIndex + itemsPerSlide;
        return allProducts.slice(startIndex, endIndex);
    };

    // Don't render if no products or loading
    if (loading) {
        return (
            <section className="featured-product pt0 pb90">
                <div className="verticalLimit">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="main-title text-left mb40">
                                <h2>Last viewed products</h2>
                            </div>
                            <div className="text-center">
                                <p>Loading recently viewed products...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // if (allProducts.length === 0) {
    //     return (
    //         <section className="featured-product pt0 pb90">
    //             <div className="verticalLimit">
    //                 <div className="row">
    //                     <div className="col-lg-12">
    //                         <div className="main-title text-left mb40">
    //                             <h2>Last viewed products</h2>
    //                         </div>
    //                         <div className="text-center">
    //                             <p>No recently viewed products found.</p>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </section>
    //     );
    // }

    return (
        <>
            <section className="featured-product pt0 pb90">
                <div className="verticalLimit">
                    {allProducts.length != 0 && <div className="row">
                        <div className="col-lg-12">
                            <div className="main-title text-left mb40">
                                <h2>Last viewed products</h2>
                            </div>
                        </div>
                    </div>}

                    {/* Slider Container */}
                    <div className="slider-container p-0" ref={sliderRef}>
                        {/* Slider Navigation Buttons */}
                        <div className="slider-navigation">
                            <button
                                className="slider-btn prev-btn"
                                onClick={handlePrevSlide}
                            >
                                <span className="flaticon-left-arrow"> ‹</span>
                            </button>
                            <button
                                className="slider-btn next-btn"
                                onClick={handleNextSlide}
                            >
                                <span className="flaticon-right-arrow">   › </span>
                            </button>
                        </div>

                        {/* Slider Content */}
                        <div className="slider-wrapper">
                            <div
                                className="slider-track"
                                style={{
                                    transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`
                                }}
                            >
                                {Array.from({ length: totalSlides }).map((_, slideIndex) => {
                                    const startIndex = slideIndex * itemsPerSlide;
                                    const endIndex = startIndex + itemsPerSlide;
                                    const slideProducts = allProducts.slice(startIndex, endIndex);

                                    return (
                                        <div key={slideIndex} className="slider-slide">
                                            <div className="row">
                                                {slideProducts.map((product, index) => (
                                                    <ProductItem
                                                       view={'home'}
                                                        key={`${product.id}-${product.brand}-${index}`}
                                                        product={product}
                                                        isWishlisted={isWishlisted(product.id)}
                                                        wishlistId={getWishlistId(product.id)}
                                                    />
                                                ))}
                                                {/* Add empty columns if less than 6 products in last slide */}
                                                {slideProducts.length < itemsPerSlide &&
                                                    Array.from({ length: itemsPerSlide - slideProducts.length }).map((_, emptyIndex) => (
                                                        <div
                                                            key={`empty-${emptyIndex}`}
                                                            className="col-lg-2 "
                                                        >
                                                            <div className="empty-product-slot"></div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Add custom CSS for slider */}
            <style jsx>{`
                .slider-container {
                    position: relative;
                    overflow: hidden;
                    margin: 0 auto;
                    padding: 0 50px;
                }

                .slider-navigation {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    transform: translateY(-50%);
                    display: flex;
                    justify-content: space-between;
                    z-index: 10;
                    pointer-events: none;
                }

                .slider-btn {
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    pointer-events: all;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .slider-btn:hover {
                    background-color: #007bff;
                    color: white;
                    border-color: #007bff;
                }

                .slider-wrapper {
                    overflow: hidden;
                    position: relative;
                    width: 100%;
                }

                .slider-track {
                    display: flex;
                    transition: transform 0.5s ease-in-out;
                    width: ${totalSlides * 100}%;
                }

                .slider-slide {
                    width: ${100 / totalSlides}%;
                    flex-shrink: 0;
                    padding: 0 10px;
                }

                .slider-slide .row {
                    margin: 0 -10px;
                    display: flex;
                    flex-wrap: wrap;
                }

                .slider-slide .col-lg-2 {
                    padding: 0 10px;
                    margin-bottom: 20px;
                }

                .slider-dots {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    margin-top: 30px;
                }

                .slider-dot {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    width: 12px;
                    height: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .slider-dot span {
                    display: block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #dee2e6;
                    transition: all 0.3s ease;
                }

                .slider-dot.active span {
                    background-color: #007bff;
                    width: 12px;
                    height: 12px;
                }

                .slider-dot:hover span {
                    background-color: #007bff;
                }

                .empty-product-slot {
                    height: 100%;
                    min-height: 200px;
                    visibility: hidden;
                }

                .shop_item {
                    transition: all 0.3s ease;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    overflow: hidden;
                    height: 100%;
                }
                
                .shop_item:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }

                /* Responsive adjustments */
                @media (max-width: 1200px) {
                    .slider-btn {
                        width: 35px;
                        height: 35px;
                    }
                    
                    .slider-container {
                        padding: 0 40px;
                    }
                }

                @media (max-width: 992px) {
                    .slider-slide .col-lg-2 {
                        flex: 0 0 33.333%;
                        max-width: 33.333%;
                    }
                }

                @media (max-width: 768px) {
                    .slider-container {
                        padding: 0 30px;
                    }
                    
                    .slider-navigation {
                        display: none;
                    }
                    
                    .slider-slide .col-lg-2 {
                        flex: 0 0 50%;
                        max-width: 50%;
                    }
                    
                    .slider-slide .row {
                        margin: 0 -5px;
                    }
                    
                    .slider-slide .col-lg-2 {
                        padding: 0 5px;
                    }
                }

                @media (max-width: 576px) {
                    .slider-slide .col-lg-2 {
                        flex: 0 0 50%;
                        max-width: 50%;
                    }
                }
            `}</style>
        </>
    );
};

export default ViewedItemProduct;