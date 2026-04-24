import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


const HomepageCategorySection = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCategory, setHoveredCategory] = useState(null);

    // Cache keys for localStorage
    const CATEGORY_CACHE_KEY = 'category_data_cache';
    const CATEGORY_CACHE_TIMESTAMP_KEY = 'category_cache_timestamp';
    const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes cache duration

    // Check if cache is valid
    const isCacheValid = () => {
        const cachedTimestamp = localStorage.getItem(CATEGORY_CACHE_TIMESTAMP_KEY);
        if (!cachedTimestamp) return false;
        
        const now = Date.now();
        const cacheTime = parseInt(cachedTimestamp, 10);
        return (now - cacheTime) < CACHE_DURATION;
    };

    // Get cached categories
    const getCachedCategories = () => {
        try {
            const cachedData = localStorage.getItem(CATEGORY_CACHE_KEY);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        } catch (error) {
            console.error('Error reading cached categories:', error);
            // Clear corrupted cache
            localStorage.removeItem(CATEGORY_CACHE_KEY);
            localStorage.removeItem(CATEGORY_CACHE_TIMESTAMP_KEY);
        }
        return null;
    };

    // Cache categories to localStorage
    const cacheCategories = (categoryData) => {
        try {
            localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(categoryData));
            localStorage.setItem(CATEGORY_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
            console.error('Error caching categories:', error);
        }
    };

    // Process categories data
    const processCategories = (categoriesData) => {
        return categoriesData
            .filter(category => category.is_active)
            .slice(0, 8)
            .map(category => ({
                id: category.id,
                name: category.name,
                image: category.image 
                    && `${import.meta.env.VITE_API_URL}/storage/${category.image}`,
                items: `${category.products?.length || 0} items`,
                link: `/shop?category=${encodeURIComponent(category.name)}`,
                color: getCategoryColor(category.name)
            }));
    };

    // Fetch categories from API with cache fallback
    const fetchCategories = async () => {
        try {
            setLoading(true);

            // First, try to use cached data if it's valid
            if (isCacheValid()) {
                const cachedCategories = getCachedCategories();
                if (cachedCategories && cachedCategories.length > 0) {
                    setCategories(cachedCategories);
                    setLoading(false);
                    console.log('Using cached category data');
                    
                    // Still fetch fresh data in background
                    fetchFreshCategories();
                    return;
                }
            }

            // If no valid cache, fetch from API
            await fetchFreshCategories();
            
        } catch (error) {
            console.error('Error in fetchCategories:', error);
            
            // On network error, try to use cached data even if expired
            const cachedCategories = getCachedCategories();
            if (cachedCategories && cachedCategories.length > 0) {
                setCategories(cachedCategories);
                console.log('Using cached data due to network error');
            } else {
                // No cached data available, set empty array
                setCategories([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch fresh categories from API
    const fetchFreshCategories = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`, {
                timeout: 10000,
            });
            
            if (response.data.success) {
                const processedCategories = processCategories(response.data.data);
                setCategories(processedCategories);
                
                // Cache the fresh data
                cacheCategories(processedCategories);
                console.log('Fresh category data fetched and cached');
            } else {
                throw new Error('Failed to load categories from server');
            }
        } catch (error) {
            console.error('Error fetching fresh categories:', error);
            throw error; // Re-throw to be handled by parent function
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

  

    const getCategoryColor = (categoryName) => {
        const colors = ['#ff6b35', '#f7931e', '#00b4d8', '#90e0ef', '#06ffa5', '#ffbe0b', '#fb8500', '#8338ec'];
        return colors[Math.abs(categoryName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
    };

    // Manual refresh function
    const refreshCategories = async () => {
        setLoading(true);
        
        // Clear cache to force fresh fetch
        localStorage.removeItem(CATEGORY_CACHE_KEY);
        localStorage.removeItem(CATEGORY_CACHE_TIMESTAMP_KEY);
        
        await fetchCategories();
    };

    if (loading) {
        return (
            <section className="categories-section">
                <div className="containe">
                    {/* <div className="section-header">
                        <h2>Shop by Category</h2>
                        <p>Discover amazing products across all categories</p>
                    </div> */}
                    <div className="categories-grid loading">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="category-card loading-card">
                                <div className="category-image-placeholder"></div>
                                <div className="category-info">
                                    <div className="loading-text"></div>
                                    <div className="loading-text small"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // No categories state
    if (categories.length === 0) {
        return (
            <section className="categories-sectio">
                <div className=" verticalLimit">
                   
                    <div className="text-center py-5">
                        <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No categories available at the moment.</p>
                        <button 
                            onClick={refreshCategories}
                            className="btn btn-primary mt-2"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="categories-section">
            <div className="containe verticalLimit">
                <div className="section-header text-left">
                    <h2>Shop by Category</h2>
                    <p>Discover amazing products across all categories</p>
                </div>
                <div className="categories-grid">
                    {categories.map((category) => (
                        <Link 
                            key={category.id} 
                            to={'shop?category='+category.id} 
                            className="category-card"
                            onMouseEnter={() => setHoveredCategory(category.id)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            <div className="category-image-wrapper">
                                <div 
                                    className="category-bg" 
                                    style={{ backgroundColor: `${category.color}20` }}
                                ></div>
                                <img 
                                    src={category.image} 
                                    alt={category.name}
                                    className="category-image"
                                    loading="lazy"
                                />
                                <div className="category-overlay">
                                    <span className="shop-now">Shop Now</span>
                                </div>
                            </div>
                            <div className="category-info">
                                <h3 className="category-name">{category.name}</h3>
                                {/* <span className="category-items">{category.items}</span> */}
                            </div>
                         
                        </Link>
                    ))}
                </div>
            </div>
            
            <style jsx>{`
                .categories-section {
                    padding: 60px 0;
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                
                .section-header {
                    text-align: left;
                    margin-bottom: 50px;
                    position: relative;
                }
                
                .section-header h2 {
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 10px;
                }
                
                .section-header p {
                    font-size: 1.1rem;
                    color: #64748b;
                    margin-bottom: 20px;
                }
                
                .view-all-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                }
                
                .view-all-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                    color: white;
                    text-decoration: none;
                }
                
                .categories-grid {
                    display: flex;
                    overflow-x: auto;
                    gap: 15px;
                    padding: 10px 0;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }
                
                .categories-grid::-webkit-scrollbar {
                    height: 6px;
                }
                
                .categories-grid::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                
                .categories-grid::-webkit-scrollbar-thumb {
                    background: #667eea;
                    border-radius: 3px;
                }
                
                .categories-grid::-webkit-scrollbar-thumb:hover {
                    background: #5a67d8;
                }
                
                .category-card {
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                    position: relative;
                    border: 1px solid #e2e8f0;
                    min-width: 180px;
                    flex-shrink: 0;
                }
                
                .category-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
                    text-decoration: none;
                    color: inherit;
                }
                
                .category-image-wrapper {
                    position: relative;
                    width: 180px;
                    height: 120px;
                    overflow: hidden;
                }
                
                .category-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                }
                
                .category-image {
                    width: 180px;
                    height: 120px;
                    object-fit: cover;
                    position: relative;
                    z-index: 2;
                    transition: transform 0.4s ease;
                }
                
                .category-card:hover .category-image {
                    transform: scale(1.1);
                }
                
                .category-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 3;
                }
                
                .category-card:hover .category-overlay {
                    opacity: 1;
                }
                
                .shop-now {
                    color: white;
                    font-weight: 600;
                    font-size: 1.1rem;
                    padding: 10px 20px;
                    border: 2px solid white;
                    border-radius: 25px;
                    transition: all 0.3s ease;
                }
                
                .shop-now:hover {
                    background: white;
                    color: #1a202c;
                }
                
                .category-info {
                    padding: 15px 12px;
                    text-align: center;
                }
                
                .category-name {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 5px;
                    transition: color 0.3s ease;
                }
                
                .category-items {
                    color: #64748b;
                    font-size: 0.8rem;
                    font-weight: 400;
                }
                
                .category-accent {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    transition: height 0.3s ease;
                }
                
                .category-card:hover .category-accent {
                    height: 6px;
                }
                
                .loading-card {
                    animation: pulse 1.5s ease-in-out infinite;
                }
                
                .category-image-placeholder {
                    height: 120px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                
                .loading-text {
                    height: 20px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 4px;
                    margin-bottom: 10px;
                }
                
                .loading-text.small {
                    height: 16px;
                    width: 60%;
                    margin: 0 auto;
                }
                
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                @media (max-width: 768px) {
                    .categories-section {
                        padding: 40px 0;
                    }
                    
                    .section-header h2 {
                        font-size: 2rem;
                    }
                    
                    .category-card {
                        min-width: 160px;
                    }
                    
                    .category-image-wrapper {
                        height: 100px;
                    }
                }
                
                @media (max-width: 480px) {
                    .category-card {
                        min-width: 140px;
                    }
                    
                    .category-info {
                        padding: 12px 8px;
                    }
                    
                    .category-name {
                        font-size: 0.9rem;
                    }
                    
                    .category-items {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default HomepageCategorySection;
