import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Import CSS
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

// Helper function to calculate time remaining
const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
};

// Helper function to check if ad is valid based on dates
const isAdValid = (ad) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if ad has start and end dates
    if (!ad.starts_at || !ad.ends_at) {
        return false;
    }

    const startDate = new Date(ad.starts_at);
    const endDate = new Date(ad.ends_at);

    // Compare dates only (without time)
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    // Ad is valid if current date is between start and end dates (inclusive)
    return today >= startDateOnly && today <= endDateOnly;
};

// Countdown Timer Component
const CountdownTimer = ({ endDate, compact = false }) => {
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeRemaining(endDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (timeLeft.expired) {
        return null;
    }

    if (compact) {
        // Compact version for small ad cards
        return (
            <div className="countdown-compact d-flex gap-1">
                {timeLeft.days > 0 && (
                    <span className="countdown-item">
                        <span className="countdown-value">{timeLeft.days}</span>
                        <span className="countdown-label">d</span>
                    </span>
                )}
                <span className="countdown-item">
                    <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="countdown-label">h</span>
                </span>
                <span className="countdown-item">
                    <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="countdown-label">m</span>
                </span>
                <span className="countdown-item">
                    <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="countdown-label">s</span>
                </span>
            </div>
        );
    }

    // Full version for main banner
    return (
        <div className="countdown-timer d-flex gap-2 flex-wrap align-items-center">
            <span className="countdown-label-text">Ends in:</span>
            {timeLeft.days > 0 && (
                <div className="countdown-box">
                    <span className="countdown-number">{timeLeft.days}</span>
                    <span className="countdown-text">Days</span>
                </div>
            )}
            <div className="countdown-box">
                <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="countdown-text">Hours</span>
            </div>
            <div className="countdown-box">
                <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="countdown-text">Min</span>
            </div>
            <div className="countdown-box">
                <span className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="countdown-text">Sec</span>
            </div>
        </div>
    );
};

const HomeSLider = () => {
    const carouselRef = useRef(null);
    const adsCarouselRef = useRef(null);
    const owlCarouselRef = useRef(null);
    const owlAdsCarouselRef = useRef(null);
    const leftBtnRef = useRef(null);
    const rightBtnRef = useRef(null);
    const [sliders, setSliders] = useState([]);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [combinedSliders, setCombinedSliders] = useState([]);
    const [error, setError] = useState(null);
    const [carouselInitialized, setCarouselInitialized] = useState(false); 
    const [carouselKey, setCarouselKey] = useState(0);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);

    // Update isLargeScreen on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 992);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const HERO_HEIGHT = "75vh";

    // Function to strip HTML tags from text
    const stripHtmlTags = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await refreshData();
            } catch (err) {
                console.error('Error in fetchData:', err);
                setError('Failed to load content');
            } finally {
                setLoading(false);
            }
        };

        const refreshData = async () => {
            const baseUrl = import.meta.env.VITE_API_URL;

            const [sliderRes, adsRes] = await Promise.all([
                axios.get(`${baseUrl}/api/sliders`),
                axios.get(`${baseUrl}/api/ads`)
            ]);

                if (sliderRes.data.success && adsRes.data.success) {
                const sliderData = sliderRes.data.data;
                // Filter ads: active status, banner position, and valid date range
                const adsData = adsRes.data.data.filter(ad => 
                    ad.status === 'active' && 
                    ad.position === 'banner' &&
                    isAdValid(ad) // Check if current date is within start and end dates
                );
                    console.log(sliderData)
                setSliders(sliderData);
                setAds(adsData);

                // Create combined array for mobile: alternate between sliders and ads
                const combined = [...sliderData];
                adsData.forEach((ad, index) => {
                    // Insert ad after every slider on mobile (interleave)
                    const insertIndex = (index + 1) * 2;
                    if (insertIndex <= combined.length) {
                        combined.splice(insertIndex, 0, { ...ad, isAd: true });
                    } else {
                        combined.push({ ...ad, isAd: true });
                    }
                });
                setCombinedSliders(combined);
            }
        };

        fetchData();
    }, []);


    const handlePrev = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (owlCarouselRef.current) {
            owlCarouselRef.current.trigger('prev.owl.carousel');
        } else {
            const $ = window.$;
            if ($ && carouselRef.current) {
                $(carouselRef.current).trigger('prev.owl.carousel');
            }
        }
    };

    const handleNext = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (owlCarouselRef.current) {
            owlCarouselRef.current.trigger('next.owl.carousel');
        } else {
            const $ = window.$;
            if ($ && carouselRef.current) {
                $(carouselRef.current).trigger('next.owl.carousel');
            }
        }
    };

    // Handle ads carousel navigation
    const handleAdsPrev = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (owlAdsCarouselRef.current) {
            owlAdsCarouselRef.current.trigger('prev.owl.carousel');
        }
    };

    const handleAdsNext = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (owlAdsCarouselRef.current) {
            owlAdsCarouselRef.current.trigger('next.owl.carousel');
        }
    };

    // Determine which items to display in carousel based on screen size
    const getCarouselItems = () => {
        if (!isLargeScreen && combinedSliders.length > 0) {
            return combinedSliders;
        }
        return sliders;
    };

    const carouselItems = getCarouselItems();

    useEffect(() => {
        const initializeCarousel = async () => {
            // Wait for loading to complete and ensure we have data and DOM ref
            if (loading || carouselItems.length === 0 || !carouselRef.current) {
                return;
            }

            // Multiple attempts with increasing delays to ensure DOM is ready
            const tryInitialize = async (attempt = 0) => {
                if (attempt > 3) {
                    console.log('Max initialization attempts reached');
                    return;
                }

                // Wait for DOM to be ready
                await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));

                try {
                    const $ = (await import('jquery')).default;
                    window.jQuery = $;
                    window.$ = $;

                    await import('owl.carousel');

                    if (carouselRef.current && $.fn.owlCarousel) {
                        // Destroy existing carousel if any
                        if (owlCarouselRef.current) {
                            try {
                                $(carouselRef.current).trigger('destroy.owl.carousel');
                            } catch (e) {
                                console.log('No existing carousel to destroy');
                            }
                            owlCarouselRef.current = null;
                        }

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
                            onInitialized: function () {
                                console.log('Carousel initialized');
                                setCarouselInitialized(true);
                            }
                        });
                    } else if (attempt < 3) {
                        // Retry if carousel not ready
                        tryInitialize(attempt + 1);
                    }
                } catch (error) {
                    console.error('Error initializing carousel:', error);
                    if (attempt < 3) {
                        tryInitialize(attempt + 1);
                    }
                }
            };

            tryInitialize();
        };

        initializeCarousel();

        return () => {
            if (carouselRef.current && window.$) {
                const $ = window.$;
                try {
                    if (owlCarouselRef.current) {
                        $(carouselRef.current).trigger('destroy.owl.carousel');
                        owlCarouselRef.current = null;
                    }
                } catch (error) {
                    console.error('Error cleaning up carousel:', error);
                }
            }
        };
    }, [loading, carouselItems, isLargeScreen]);

    // Initialize ads carousel on mobile
    useEffect(() => {
        // Wait for loading to complete
        if (loading) return;

        const initializeAdsCarousel = async () => {
            if (ads.length === 0 || !adsCarouselRef.current || isLargeScreen) {
                return;
            }

            try {
                const $ = (await import('jquery')).default;
                window.jQuery = $;
                window.$ = $;

                await import('owl.carousel');

                if (adsCarouselRef.current && $.fn.owlCarousel) {
                    if (owlAdsCarouselRef.current) {
                        try {
                            $(adsCarouselRef.current).trigger('destroy.owl.carousel');
                        } catch (e) {
                            console.log('No existing ads carousel to destroy');
                        }
                    }

                    owlAdsCarouselRef.current = $(adsCarouselRef.current).owlCarousel({
                        items: 1,
                        loop: true,
                        margin: 10,
                        nav: false,
                        dots: false,
                        autoplay: true,
                        autoplayTimeout: 4000,
                        autoplayHoverPause: true,
                        smartSpeed: 800,
                        responsive: {
                            0: { items: 1 },
                            576: { items: 1 }
                        }
                    });
                }
            } catch (error) {
                console.error('Error initializing ads carousel:', error);
            }
        };

        initializeAdsCarousel();

        return () => {
            if (adsCarouselRef.current && window.$) {
                const $ = window.$;
                try {
                    if (owlAdsCarouselRef.current) {
                        $(adsCarouselRef.current).trigger('destroy.owl.carousel');
                        owlAdsCarouselRef.current = null;
                    }
                } catch (error) {
                    console.error('Error cleaning up ads carousel:', error);
                }
            }
        };
    }, [loading, ads, isLargeScreen]);


    // Manual refresh function
    const refreshSliders = async () => {
        setError(null);
        setLoading(true);
        setCarouselInitialized(false);
        window.location.reload();
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
                                        height: "70vh",
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
            <section className="home-one  mt-0">
                <div className="container-fluid m-0 px-0">
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

    // Helper components to keep the layout clean
    const BannerImage = ({ item, height, isSlider, isAd }) => {
        const baseUrl = import.meta.env.VITE_API_URL;
        // Check if item is an ad (either passed as prop or marked in the item itself)
        const itemIsAd = isAd || item.isAd;
        const imageUrl = itemIsAd
            ? (item.mockUrl || `${baseUrl}/storage/${item.media_url}`)
            : `${baseUrl}/storage/${item.image_path}`;

        const link = itemIsAd 
          ? (item.id && !item.id.startsWith('mock')) 
            ? `/promo-products/${item.id}` 
            : (item.link || item.thumbnail_url || "/shop")
          : (item.link || item.thumbnail_url || "/shop");
        const isExternal = link.startsWith('http');

        const BannerContent = (
            <div
                className="banner-item-box w-100 h-100 position-relative ovh bdrs8 shadow-sm"
                style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: height || HERO_HEIGHT,
                    transition: "all 0.3s ease",
                }}
            >
                <div className="banner-overlay" style={{ pointerEvents: 'none', position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8))', zIndex: 1 }}></div>
                <div className="banner-content p-4" style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-start',
                    zIndex: 2,
                    padding: '2rem'
                }}>
                    <h3 className="banner-title text-white mb-2" style={{
                        fontSize: isSlider && !itemIsAd ? "clamp(1.5rem, 4vw, 2.5rem)" : "clamp(1.1rem, 2vw, 1.4rem)",
                        fontWeight: "800",
                        textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textDecoration: 'none',
                        margin: 0
                    }}>
                        {item.title}
                    </h3>
                   
                    {isSlider && !itemIsAd && (
                        <p className="text-white mb-4 d-none d-md-block" style={{
                            maxWidth: "500px",
                            textShadow: '0 1px 5px rgba(0,0,0,0.5)',
                            fontSize: '1.1rem',
                            fontWeight: '500'
                        }}>
                            {stripHtmlTags(item.description)}
                        </p>
                    )}
                    {itemIsAd && (
                        <>
                            <p className="text-white mb-2 d-block" style={{
                                textShadow: '0 1px 5px rgba(0,0,0,0.5)',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                background: 'rgba(255,107,0,0.9)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                display: 'inline-block'
                            }}>
                                🔥 Special Offer
                            </p>
                            {/* Countdown Timer for Ad */}
                            {item.ends_at && (
                                <div className="mb-2" style={{ pointerEvents: 'auto' }}>
                                    <CountdownTimer endDate={item.ends_at} compact={true} />
                                </div>
                            )}
                        </>
                    )}
                    <Link to={link} className={`btn btn-thm ${isSlider && !itemIsAd ? '' : 'btn-sm'} bdrs50 px-4 mb-2`} style={{ pointerEvents: 'none' }}>
                        {itemIsAd ? 'Grab Deal' : 'Shop Now'}
                    </Link>
                </div>
            </div>
        );

        const commonStyle = {
            textDecoration: 'none',
            display: 'block',
            width: '100%',
            height: '100%',
            cursor: 'pointer'
        };

        if (isExternal) {
            return (
                <a
                    href={link}
                    className="d-block w-100 h-100"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={commonStyle}
                >
                    {BannerContent}
                </a>
            );
        }

        return (
            <Link
                to={link}
                className="d-block w-100 h-100"
                style={commonStyle}
            >
                {BannerContent}
            </Link>
        );
    };

    const displayAds = ads.slice(0, 4);

    return (
        <section className="home-one container-flui mt-4">
            <div className="row g-3 ">
                {/* Main Slider */}
                <div className={isLargeScreen && displayAds.length > 0 ? "col-lg-8" : "col-lg-12"}>
                    <div className="main-banner-wrapper bdrs8 ovh shadow-sm ">
                        <div
                            ref={carouselRef}
                            className="banner-style-one dots_none owl-theme owl-carousel "
                        >
                            {carouselItems.map((item, index) => (
                                <div key={item.id || `slide-${index}`} style={{ height: HERO_HEIGHT }}>
                                    <BannerImage 
                                        item={item} 
                                        isSlider={true} 
                                        isAd={!isLargeScreen && item.isAd} 
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Carousel Controls - Show if there are multiple items */}
                        {carouselItems.length > 1 && (
                            <div className="carousel-controls-wrapper">
                                <button
                                    className="carousel-button-nav prev-nav"
                                    onClick={handlePrev}
                                    aria-label="Previous slide"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button
                                    className="carousel-button-nav next-nav"
                                    onClick={handleNext}
                                    aria-label="Next slide"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop: Side Banners/Ads Grid (2x2) - Only show on large screens */}
                {isLargeScreen && displayAds.length > 0 && (
                    <div className="col-lg-4">
                        <div className="row g-2 h-100">
                            {displayAds.map((ad, index) => (
                                <div key={ad.id || index} className="col-6" style={{ height: "calc(35vh - 4px)" }}>
                                    <BannerImage item={ad} height="100%" isSlider={false} isAd={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile: Special Offers indicator - shown below carousel when ads are in the slider */}
                {/* {!isLargeScreen && displayAds.length > 0 && (
                    <div className="col-lg-12 mt-2">
                        <div className="d-flex align-items-center justify-content-center">
                            <span className="badge" style={{ 
                                background: 'linear-gradient(135deg, #ff7b00 0%, #f68b1e 100%)',
                                padding: '8px 16px',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}>
                                🔥 Swipe to see Special Offers
                            </span>
                        </div>
                    </div>
                )} */}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .home-one {
                    position: relative;
                    z-index: 5;
                }
                .main-banner-wrapper {
                    position: relative;
                    z-index: 10;
                    height: 100%;
                }
                .owl-carousel, .owl-stage-outer, .owl-stage {
                    cursor: grab !important;
                }
                .owl-carousel:active, .owl-stage:active {
                    cursor: grabbing !important;
                }
                .banner-item-box {
                    cursor: pointer !important;
                    transition: all 0.3s ease;
                }
                .banner-item-box:hover {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
                    transform: translateY(-2px);
                }
                .carousel-controls-wrapper {
                    position: absolute;
                    top: 50%;
                    width: 100%;
                    left: 0;
                    transform: translateY(-50%);
                    display: flex;
                    justify-content: space-between;
                    padding: 0 20px;
                    pointer-events: none;
                    z-index: 99999;
                }
                .carousel-button-nav {
                    pointer-events: auto !important;
                    background: rgba(255, 255, 255, 0.95) !important;
                    color: #333 !important;
                    width: 50px !important;
                    height: 50px !important;
                    border-radius: 50% !important;
                    border: none !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
                    transition: all 0.3s ease !important;
                    z-index: 100000;
                }
                .carousel-button-nav:hover {
                    background: #fff !important;
                    color: #f68b1e !important;
                    transform: scale(1.15) !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
                }
                .carousel-button-nav i {
                    pointer-events: none !important;
                    font-size: 1.2rem;
                }
                .underline-none, .underline-none:hover {
                    text-decoration: none !important;
                }
                
                /* Ads Carousel Styles */
                .ads-carousel-wrapper {
                    position: relative;
                    padding: 0 30px;
                }
                .ads-carousel-controls {
                    position: absolute;
                    top: 50%;
                    width: 100%;
                    left: 0;
                    transform: translateY(-50%);
                    display: flex;
                    justify-content: space-between;
                    pointer-events: none;
                    z-index: 100;
                }
                .ads-carousel-btn {
                    pointer-events: auto !important;
                    background: rgba(255, 255, 255, 0.95) !important;
                    color: #333 !important;
                    width: 36px !important;
                    height: 36px !important;
                    border-radius: 50% !important;
                    border: none !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.15) !important;
                    transition: all 0.3s ease !important;
                }
                .ads-carousel-btn:hover {
                    background: #ff7b00 !important;
                    color: #fff !important;
                }
                .ads-carousel-btn i {
                    font-size: 0.9rem;
                }
                
                /* Countdown Timer Styles */
                .countdown-compact {
                    background: rgba(0, 0, 0, 0.75);
                    padding: 6px 12px;
                    border-radius: 8px;
                    display: inline-flex;
                    align-items: center;
                }
                .countdown-item {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.85rem;
                }
                .countdown-value {
                    font-size: 1rem;
                    min-width: 18px;
                    text-align: center;
                }
                .countdown-label {
                    font-size: 0.7rem;
                    opacity: 0.9;
                    margin-left: 2px;
                }
                .countdown-timer {
                    background: rgba(0, 0, 0, 0.8);
                    padding: 10px 16px;
                    border-radius: 10px;
                    display: inline-flex;
                    align-items: center;
                }
                .countdown-label-text {
                    color: #fff;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-right: 8px;
                }
                .countdown-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.15);
                    padding: 6px 10px;
                    border-radius: 6px;
                    min-width: 50px;
                }
                .countdown-number {
                    color: #fff;
                    font-size: 1.2rem;
                    font-weight: 800;
                    line-height: 1;
                }
                .countdown-text {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    margin-top: 2px;
                }
                `
            }} />
        </section>
    );
};

export default HomeSLider;
