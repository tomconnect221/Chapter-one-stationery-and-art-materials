import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Import CSS
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

const HomeSLider = () => {
    const carouselRef = useRef(null);
    const owlCarouselRef = useRef(null);
    const leftBtnRef = useRef(null);
    const rightBtnRef = useRef(null);
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [carouselInitialized, setCarouselInitialized] = useState(false);

    // Function to strip HTML tags from text
    const stripHtmlTags = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    // Cache keys for localStorage
    const SLIDER_CACHE_KEY = 'slider_data_cache';
    const CACHE_TIMESTAMP_KEY = 'slider_cache_timestamp';
    const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes cache duration

    // Check if cache is valid
    const isCacheValid = () => {
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (!cachedTimestamp) return false;
        
        const now = Date.now();
        const cacheTime = parseInt(cachedTimestamp, 10);
        return (now - cacheTime) < CACHE_DURATION;
    };

    // Get cached sliders
    const getCachedSliders = () => {
        try {
            const cachedData = localStorage.getItem(SLIDER_CACHE_KEY);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        } catch (error) {
            console.error('Error reading cached sliders:', error);
            // Clear corrupted cache
            localStorage.removeItem(SLIDER_CACHE_KEY);
            localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        }
        return null;
    };

    // Cache sliders to localStorage
    const cacheSliders = (sliderData) => {
        try {
            localStorage.setItem(SLIDER_CACHE_KEY, JSON.stringify(sliderData));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
            console.error('Error caching sliders:', error);
        }
    };

    // Fetch sliders from API with cache fallback
    const fetchSliders = async () => {
        try {
            setLoading(true);
            setError(null);

            // First, try to use cached data if it's valid
            if (isCacheValid()) {
                const cachedSliders = getCachedSliders();
                if (cachedSliders && cachedSliders.length > 0) {
                    setSliders(cachedSliders);
                    setLoading(false);
                    console.log('Using cached slider data');
                    
                    // Still fetch fresh data in background
                    fetchFreshSliders();
                    return;
                }
            }

            // If no valid cache, fetch from API
            await fetchFreshSliders();
            
        } catch (error) {
            console.error('Error in fetchSliders:', error);
            
            // On network error, try to use cached data even if expired
            const cachedSliders = getCachedSliders();
            if (cachedSliders && cachedSliders.length > 0) {
                setSliders(cachedSliders);
                setError('Using cached data - Network unavailable');
                console.log('Using cached data due to network error');
            } else {
                setError('Failed to load carousel content. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch fresh sliders from API
    const fetchFreshSliders = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const url = `${baseUrl}/api/sliders`;
            
            const response = await axios.get(url, {
                timeout: 10000,
            });
            
            if (response.data.success) {
                const sliderData = response.data.data;
                setSliders(sliderData);
                cacheSliders(sliderData);
                console.log('Fresh slider data fetched and cached');
            } else {
                throw new Error('Failed to load sliders from server');
            }
        } catch (error) {
            console.error('Error fetching fresh sliders:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchSliders();
    }, []);

    // Initialize carousel buttons with native event listeners
    const initializeCarouselButtons = () => {
        if (!carouselRef.current || !owlCarouselRef.current) return;

        const leftBtn = leftBtnRef.current;
        const rightBtn = rightBtnRef.current;

        const handleLeftClick = () => {
            if (owlCarouselRef.current) {
                owlCarouselRef.current.trigger('prev.owl.carousel');
            }
        };

        const handleRightClick = () => {
            if (owlCarouselRef.current) {
                owlCarouselRef.current.trigger('next.owl.carousel');
            }
        };

        // Remove existing event listeners
        if (leftBtn) {
            leftBtn.removeEventListener('click', handleLeftClick);
            leftBtn.addEventListener('click', handleLeftClick);
        }

        if (rightBtn) {
            rightBtn.removeEventListener('click', handleRightClick);
            rightBtn.addEventListener('click', handleRightClick);
        }

        console.log('Carousel buttons initialized');
    };

    useEffect(() => {
        const initializeCarousel = async () => {
            // Only initialize if we have sliders and carousel ref
            if (sliders.length === 0 || !carouselRef.current) {
                return;
            }

            try {
                // Import jQuery and Owl Carousel
                const $ = (await import('jquery')).default;
                window.jQuery = $;
                window.$ = $;
                
                await import('owl.carousel');
                
                if (carouselRef.current && $.fn.owlCarousel) {
                    // Destroy existing carousel if any
                    if (owlCarouselRef.current) {
                        $(carouselRef.current).trigger('destroy.owl.carousel');
                    }

                    // Initialize carousel
                    owlCarouselRef.current = $(carouselRef.current).owlCarousel({
                        items: 1,
                        loop: true,
                        margin: 0,
                        nav: false,
                        dots: false,
                        autoplay: true,
                        autoplayTimeout: 5000,
                        autoplayHoverPause: true,
                        smartSpeed: 1000,
                        responsive: {
                            0: { items: 1 },
                            768: { items: 1 },
                            992: { items: 1 }
                        },
                        onInitialized: function() {
                            console.log('Carousel initialized');
                            setCarouselInitialized(true);
                        }
                    });

                    // Initialize buttons after a short delay to ensure DOM is ready
                    setTimeout(() => {
                        initializeCarouselButtons();
                    }, 300);

                }
            } catch (error) {
                console.error('Error initializing carousel:', error);
            }
        };

        initializeCarousel();

        return () => {
            // Cleanup function
            if (carouselRef.current && window.$) {
                const $ = window.$;
                try {
                    // Remove event listeners from buttons
                    const leftBtn = leftBtnRef.current;
                    const rightBtn = rightBtnRef.current;
                    
                    if (leftBtn) {
                        leftBtn.replaceWith(leftBtn.cloneNode(true));
                    }
                    if (rightBtn) {
                        rightBtn.replaceWith(rightBtn.cloneNode(true));
                    }

                    // Destroy carousel
                    if (owlCarouselRef.current) {
                        $(carouselRef.current).trigger('destroy.owl.carousel');
                        owlCarouselRef.current = null;
                    }
                } catch (error) {
                    console.error('Error cleaning up carousel:', error);
                }
            }
        };
    }, [sliders]);

    // Re-initialize buttons when carousel is initialized
    useEffect(() => {
        if (carouselInitialized) {
            initializeCarouselButtons();
        }
    }, [carouselInitialized]);

    // Manual refresh function
    const refreshSliders = async () => {
        setError(null);
        setLoading(true);
        setCarouselInitialized(false);
        
        // Clear cache to force fresh fetch
        localStorage.removeItem(SLIDER_CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        
        await fetchSliders();
    };

    // Loading state
    if (loading) {
        return (
            <section className="home-one mt0">
                <div className="container-fluid px-0">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="main-banner-wrapper home1_style bdrs6 ovh">
                                <div 
                                    style={{
                                        height: "600px",
                                        background: "#f8f9fa",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3">Loading</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="home-one mt0">
                <div className="container-fluid px-0">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="main-banner-wrapper home1_style bdrs6 ovh">
                                <div 
                                    style={{
                                        height: "400px",
                                        background: "#f8f9fa",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    check your network
                                    {/* <div className="text-center">
                                        <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                                        <p className="text-muted">{error}</p>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button 
                                                onClick={refreshSliders}
                                                className="btn btn-primary mt-2"
                                            >
                                                Try Again
                                            </button>
                                            {sliders.length > 0 && (
                                                <button 
                                                    onClick={() => setError(null)}
                                                    className="btn btn-outline-primary mt-2"
                                                >
                                                    Use Cached Data
                                                </button>
                                            )}
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // No sliders state
    if (sliders.length === 0) {
        return (
            <section className="home-one mt0">
                <div className="container-fluid px-0">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="main-banner-wrapper home1_style bdrs6 ovh">
                                <div 
                                    style={{
                                        height: "400px",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white"
                                    }}
                                >
                                    <div className="text-center">
                                        <h3>Welcome to Our Store</h3>
                                        <p className="mb-4">Discover amazing products and offers</p>
                                        <Link to="/shop" className="btn btn-light btn-thm">
                                            Start Shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            {/* Hero Banner Section */}
            <section className="home-one mt0">
                <div className="container-fluid px-0">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="main-banner-wrapper home1_style bdrs6 ovh">
                                <div 
                                    ref={carouselRef}
                                    className="banner-style-one dots_none owl-theme owl-carousel"
                                >
                                    {sliders.map((slider) => (
                                        <div
                                            key={slider.id}
                                            className="slide slide-one"
                                            style={{
                                                backgroundImage: `url(${import.meta.env.VITE_API_URL}/storage/${slider.image_path})`,
                                                height: "calc(100vh - 80px)",
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                                position: "relative",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            {/* Transparent black overlay */}
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                                                    zIndex: 1
                                                }}
                                            ></div>
                                            <div className="container" style={{ position: "relative", zIndex: 2 }}>
                                                <div className="row justify-content-center">
                                                    <div className="col-12 col-md-8 col-lg-12 text-center">
                                                        <h3 className="banner-title" style={{
                                                            fontSize: "clamp(2rem, 5vw, 3.5rem)",
                                                            fontWeight: "700",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "2px",
                                                            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                                                            marginBottom: "1.5rem",
                                                            lineHeight: "1.2"
                                                        }}>
                                                            <span className="fw400 text-thm1-light slider_title" style={{
                                                                background: "linear-gradient(45deg, #fff, #f8f9fa)",
                                                                WebkitBackgroundClip: "text",
                                                                WebkitTextFillColor: "transparent",
                                                                backgroundClip: "text"
                                                            }}>
                                                                {slider.title}
                                                            </span>
                                                        </h3>
                                                        <p className="slider_description" style={{
                                                            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                                                            fontWeight: "500",
                                                            color: "#ffffff",
                                                            textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                                                            marginBottom: "2.5rem",
                                                            lineHeight: "1.6",
                                                            maxWidth: "600px",
                                                            marginLeft: "auto",
                                                            marginRight: "auto"
                                                        }}>
                                                            {stripHtmlTags(slider.description)}
                                                        </p>
                                                        <div className="d-flex justify-content-center">
                                                            <Link
                                                                to={slider.link || "/shop"}
                                                                className="btn banner-btn fw500 home9_style btn-thm text-light"
                                                                style={{
                                                                    // padding: "15px 40px",
                                                                    fontSize: "18px",
                                                                    fontWeight: "600",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "1px",
                                                                    borderRadius: "50px",
                                                                    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                                                                    transition: "all 0.3s ease",
                                                                    border: "2px solid rgba(255,255,255,0.3)"
                                                                }}
                                                            >
                                                                Shop Now
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Carousel Controls - Only show if we have multiple sliders */}
                                {/* {sliders.length > 1 && (
                                    <div className="carousel-btn-block banner-carousel-btn">
                                        <span 
                                            ref={leftBtnRef}
                                            className="carousel-btn left-btn"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <i className="fas fa-chevron-left left"></i>
                                        </span>
                                        <span 
                                            ref={rightBtnRef}
                                            className="carousel-btn right-btn"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <i className="fas fa-chevron-right right"></i>
                                        </span>
                                    </div>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomeSLider;