import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const AdsTypeBlock = () => {
    const [currentSlide, setCurrentSlide] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [adsData, setAdsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState({});
    const carouselRef = useRef(null);
    const autoplayRef = useRef(null);

    // Calculate time remaining for each ad
    const calculateTimeRemaining = (endsAt) => {
        const now = new Date().getTime();
        const endTime = new Date(endsAt).getTime();
        const difference = endTime - now;

        if (difference <= 0) {
            return { expired: true };
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return {
            days,
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            expired: false
        };
    };

    // Format time for display
    const formatTimeRemaining = (time) => {
        if (time.expired) return 'Expired';

        if (time.days > 0) {
            return `${time.days}d ${time.hours}h ${time.minutes}m`;
        }
        return `${time.hours}:${time.minutes}:${time.seconds}`;
    };

    // Fetch ads data from API
    const fetchAdsData = async () => {
        try {
            setLoading(true);
            setError(null);

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${baseUrl}/api/ads`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch ads: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            if (result.success && result.data) {
                const now = new Date();
                const activeAds = result.data
                    .filter(ad => {
                        const isActive = ad.status === 'active';
                        const hasStarted = new Date(ad.starts_at) <= now;
                        const hasNotEnded = new Date(ad.ends_at) > now;
                        return isActive && hasStarted && hasNotEnded;
                    })
                    .map(ad => {
                        // --- handle description truncation ---
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = ad.description || '';
                        const plainText = tempDiv.textContent || tempDiv.innerText || '';

                        let truncatedText = plainText;
                        if (plainText.length > 200) {
                            truncatedText = plainText.substring(0, 200).trim() + '...';
                        }

                        // Optionally keep simple HTML tags (like <b>, <i>, <p>) if needed:
                        // but for clarity, we’re showing plain-text truncation only.

                        return {
                            id: ad.id,
                            title: ad.title,
                            description: truncatedText, // safely truncated version
                            image: ad.media_url ? `${baseUrl}/storage/${ad.media_url}` : '',
                            // para: "Limited Time Offer",
                            price: "$899",
                            discount: "30% OFF",
                            link: "/shop",
                            type: ad.type,
                            position: ad.position,
                            starts_at: ad.starts_at,
                            ends_at: ad.ends_at,
                            priority: ad.priority
                        };
                    })
                    .sort((a, b) => b.priority - a.priority);

                setAdsData(activeAds);

                const initialTimers = {};
                activeAds.forEach(ad => {
                    initialTimers[ad.id] = calculateTimeRemaining(ad.ends_at);
                });
                setTimeRemaining(initialTimers);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching ads data:', err);
            setError(err.message);
            setAdsData([]);
        } finally {
            setLoading(false);
        }
    };


    // Update countdown timers every second
    useEffect(() => {
        if (adsData.length === 0) return;
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                const updated = {};
                adsData.forEach(ad => {
                    updated[ad.id] = calculateTimeRemaining(ad.ends_at);
                });
                return updated;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [adsData]);


    useEffect(() => {
        fetchAdsData();
    }, []);

    const itemsPerView = Math.min(3, adsData.length);
    const originalItems = adsData.slice(0, 4);

    const carouselItems = originalItems.length > 1 ? [
        { ...originalItems[originalItems.length - 1], id: 'clone-last' },
        ...originalItems,
        { ...originalItems[0], id: 'clone-first' }
    ] : originalItems;

    const totalSlides = carouselItems.length;

    const goToSlide = (slideIndex) => {
        if (isTransitioning || originalItems.length <= 1) return;
        setIsTransitioning(true);
        setCurrentSlide(slideIndex);

        setTimeout(() => {
            setIsTransitioning(false);
            if (slideIndex === 0) {
                setTimeout(() => setCurrentSlide(originalItems.length), 50);
            } else if (slideIndex === totalSlides - 1) {
                setTimeout(() => setCurrentSlide(1), 50);
            }
        }, 500);
    };

    const nextSlide = () => {
        if (isTransitioning || originalItems.length <= 1) return;
        goToSlide(currentSlide + 1);
        resetAutoplay();
    };

    const prevSlide = () => {
        if (isTransitioning || originalItems.length <= 1) return;
        goToSlide(currentSlide - 1);
        resetAutoplay();
    };

    const resetAutoplay = () => {
        if (autoplayRef.current) clearInterval(autoplayRef.current);
        startAutoplay();
    };

    const startAutoplay = () => {
        if (originalItems.length > 1) {
            autoplayRef.current = setInterval(nextSlide, 4000);
        }
    };

    useEffect(() => {
        setCurrentSlide(1);
        startAutoplay();
        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [adsData]);

    const getTransformValue = () => {
        if (originalItems.length <= 1) return 'translateX(0%)';
        const slideWidth = 100 / itemsPerView;
        return `translateX(-${currentSlide * slideWidth}%)`;
    };

    if (loading) {
        return (
            <section className="ads-section">
                <div className="container verticalLimit">
                    <div className="section-header">
                        <h2 className="section-title">Hot Deals 🔥</h2>
                    </div>
                    <div className="loading-skeleton">
                        {[1, 2, 3].map(item => (
                            <div key={item} className="skeleton-card">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-badge"></div>
                                    <div className="skeleton-title"></div>
                                    <div className="skeleton-text"></div>
                                    <div className="skeleton-button"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="ads-section">
                <div className="container">
                    <div className="error-state">
                        <div className="error-icon">⚠️</div>
                        <h3>Failed to load deals</h3>
                        <p className="error-message">{error}</p>
                        <button onClick={fetchAdsData} className="retry-btn">Try Again</button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="ads-section">
                <div className="container verticalLimit">
                    <div className="section-header">
                        <div className="title-group">
                            <h3 className="section-title">Hot Deals 🔥</h3>
                            <p className="section-subtitle">Don't miss out on these limited-time offers</p>
                        </div>
                       
                    </div>

                    <div className="ads-carousel-container m-0 p-0">
                        <div className="carousel-wrapper bg-none m-0 p-0">
                            <div
                                ref={carouselRef}
                                className="carousel-track m-0 p-0 "
                                style={{
                                    transform: getTransformValue(),
                                    transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                                    padding:'0px', margin:'0px'
                                }}
                            >
                                {carouselItems.map((item, index) => {
                                    const timeLeft = timeRemaining[item.id] || calculateTimeRemaining(item.ends_at);
                                    const isExpired = timeLeft.expired;

                                    return (
                                        <div
                                            key={`${item.id}-${index}`}
                                            className="carousel-slide p-0 m-0 gap-5"
                                        >
                                            <Link
                                                to={isExpired ? '#' : item.link}
                                                className={`ad-card ${isExpired ? 'expired' : ''}`}
                                                onClick={isExpired ? (e) => e.preventDefault() : undefined}
                                            >
                                                <div className="card-inner">
                                                    <div
                                                        className="ad-background"
                                                        style={{
                                                            backgroundImage: `url(${item.image})`
                                                        }}
                                                    >
                                                        <div className="ad-overlay"></div>
                                                        {isExpired && (
                                                            <div className="expired-overlay">
                                                                <div className="expired-text">Offer Expired</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="ad-content ">
                                                        <div className="ad-countdown">
                                                            <div className="countdown-icon">⏰</div>
                                                            <div className={`countdown-timer ${isExpired ? 'expired' : ''}`}>
                                                                {isExpired ? 'Offer Ended' : `Ends in: ${formatTimeRemaining(timeLeft)}`}
                                                            </div>
                                                        </div>
                                                        <div className="ad-badge-group">
                                                            {/* <span className="discount-badge">
                                                                {isExpired ? 'EXPIRED' : item.discount}
                                                            </span> */}
                                                            <span className="trending-badge">🔥 Trending</span>
                                                        </div>

                                                        <div className="ad-text-content">
                                                            <p className="ad-subtitle">{item.para}</p>
                                                            <h3 className="ad-title">{item.title}</h3>
                                                            <p className="ad-description">{item.description}</p>
                                                        </div>

                                                        <div className="ad-footer">
                                                            <button className={`ad-btn ${isExpired ? 'disabled' : ''}`}>
                                                                {isExpired ? 'Expired' : 'Shop Now'}
                                                                {!isExpired && <span className="btn-arrow">→</span>}
                                                            </button>
                                                        </div>
                                                    </div>


                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {originalItems.length > itemsPerView && (
                            <>
                                <button className="carousel-nav prev" onClick={prevSlide} disabled={isTransitioning}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <button className="carousel-nav next" onClick={nextSlide} disabled={isTransitioning}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {/* {originalItems.length > 1 && (
                            <div className="carousel-indicators">
                                {originalItems.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`indicator ${currentSlide === index + 1 ? 'active' : ''}`}
                                        onClick={() => goToSlide(index + 1)}
                                    />
                                ))}
                            </div>
                        )} */}
                    </div>
                </div>
            </section>

            <style jsx>{`
                .ads-section {
                    padding: 60px 0;
                    background: linear-gradient(135deg, #fff9f0 0%, #fff5e6 50%, #fff0e0 100%);
                    position: relative;
                    overflow: hidden;
                    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                }

                .ads-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #ff8008, transparent);
                }

                .container {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 48px;
                    gap: 24px;
                }

                .title-group {
                    flex: 1;
                }

                .section-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin: 0 0 8px 0;
                    background: linear-gradient(135deg, #ff6b00, #ff8c00, #ffa500);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 0 2px 4px rgba(255, 107, 0, 0.1);
                }

                .section-subtitle {
                    font-size: 1.1rem;
                    color: #666;
                    margin: 0;
                    font-weight: 500;
                }

                .section-controls {
                    flex-shrink: 0;
                }

                .view-all-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #ff6b00, #ff8c00);
                    color: white;
                    border: none;
                    padding: 12px 28px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
                    position: relative;
                    overflow: hidden;
                }

                .view-all-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.5s;
                }

                .view-all-btn:hover::before {
                    left: 100%;
                }

                .view-all-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 107, 0, 0.4);
                }

                .ads-carousel-container {
                    position: relative;
                    border-radius: 24px;
                    overflow: visible;
                }

                .carousel-wrapper {
                    overflow: hidden;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
                    background: none;
                    padding: 8px;

                }

                .carousel-track {
                    display: flex;
                    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .carousel-slide {
                    flex: 0 0 ${100 / itemsPerView}%;
                    min-width: ${100 / itemsPerView}%;
                    padding: 0 12px;
                }

                .ad-card {
                    position: relative;
                    border-radius: 16px;
                    overflow: hidden;
                    height: 300px;
                    display: block;
                    text-decoration: none;
                    background: #000;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }

                .ad-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 25px 50px rgba(255, 107, 0, 0.25);
                }

                .card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .ad-background {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    z-index: 1;
                    transition: transform 0.8s ease;
                }

                .ad-card:hover .ad-background {
                    transform: scale(1.1);
                }

                .ad-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        180deg,
                        rgba(0, 0, 0, 0.1) 0%,
                        rgba(0, 0, 0, 0.3) 30%,
                        rgba(0, 0, 0, 0.7) 80%,
                        rgba(0, 0, 0, 0.9) 100%
                    );
                    z-index: 2;
                }

                .ad-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 3;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .ad-badge-group {
                    display: flex;
                    gap: 8px;
                    justify-content:space-between;
                    // flex-wrap: wrap;
                    width:100%
                }

                .discount-badge {
                    background: linear-gradient(135deg, #ff416c, #ff4b2b);
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: 0 2px 8px rgba(255, 65, 108, 0.4);
                }

                .trending-badge {
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .ad-text-content {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .ad-subtitle {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #ffd700;
                    margin: 0;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                }

                .ad-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    line-height: 1.3;
                    margin: 0;
                    color: white;
                    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
                }

                .ad-description {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .ad-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                }

                .ad-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #ff6b00, #ff8c00);
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(255, 107, 0, 0.4);
                }

                .ad-btn:hover:not(.disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 107, 0, 0.6);
                }

                .ad-btn.disabled {
                    background: #6b7280;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .ad-countdown {
                    // position: absolute;
                    // top: 20px;
                    // left: 20px;
                    z-index: 99999994;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .countdown-icon {
                    font-size: 1rem;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .countdown-timer {
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(10px);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .countdown-timer.expired {
                    background: rgba(239, 68, 68, 0.8);
                }

                .expired-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .expired-text {
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .carousel-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: none;
                    background: white;
                    color: #ff6b00;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .carousel-nav:hover:not(:disabled) {
                    background: #ff6b00;
                    color: white;
                    transform: translateY(-50%) scale(1.1);
                    box-shadow: 0 12px 30px rgba(255, 107, 0, 0.4);
                }

                .carousel-nav:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .carousel-nav.prev {
                    left: -24px;
                }

                .carousel-nav.next {
                    right: -24px;
                }

                .carousel-indicators {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 32px;
                }

                .indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: rgba(255, 107, 0, 0.3);
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .indicator.active {
                    background: #ff6b00;
                    transform: scale(1.2);
                    box-shadow: 0 2px 8px rgba(255, 107, 0, 0.4);
                }

                .indicator:hover {
                    background: #ff6b00;
                    transform: scale(1.1);
                }

                /* Loading Skeleton */
                .loading-skeleton {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-top: 24px;
                }

                .skeleton-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    height: 380px;
                }

                .skeleton-image {
                    height: 60%;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }

                .skeleton-content {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .skeleton-badge {
                    width: 60px;
                    height: 24px;
                    border-radius: 12px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }

                .skeleton-title {
                    height: 24px;
                    border-radius: 6px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }

                .skeleton-text {
                    height: 16px;
                    border-radius: 4px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }

                .skeleton-button {
                    width: 100px;
                    height: 36px;
                    border-radius: 18px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }

                @keyframes loading {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -200% 0;
                    }
                }

                /* Error State */
                .error-state {
                    text-align: center;
                    padding: 60px 24px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                }

                .error-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                .error-state h3 {
                    font-size: 1.5rem;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                }

                .error-message {
                    color: #666;
                    margin-bottom: 24px;
                }

                .retry-btn {
                    background: linear-gradient(135deg, #ff6b00, #ff8c00);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .retry-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 107, 0, 0.4);
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .carousel-slide {
                        flex: 0 0 50%;
                    }
                    
                    .ad-card {
                        height: 350px;
                    }
                }

                @media (max-width: 768px) {
                    .container {
                        padding: 0 16px;
                    }

                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        margin-bottom: 32px;
                    }

                    .section-title {
                        font-size: 2rem;
                    }

                    .carousel-slide {
                        flex: 0 0 100%;
                    }

                    .ad-card {
                        height: 320px;
                    margin: 0 8px;
                    border-radius: 12px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    background: #000;
                    display: block;
                        text-decoration: none;
                    }

                    .ad-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 30px rgba(255, 107, 0, 0.25);
                    }

                    .ad-content {
                        // padding: 20px;
                        gap: 12px;
                    }

                    .ad-title {
                        font-size: 1.3rem;
                    }

                    .carousel-nav {
                        width: 40px;
                        height: 40px;
                    }

                    .carousel-nav.prev {
                        left: -20px;
                    }

                    .carousel-nav.next {
                        right: -20px;
                    }

                    .loading-skeleton {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .ads-section {
                        padding: 40px 0;
                    }

                    .section-title {
                        font-size: 1.75rem;
                    }

                    .ad-card {
                        height: 280px;
                    margin: 0 4px;
                        border-radius: 10px;
                    }

                    .ad-content {
                        padding: 16px;
                    }

                    .ad-title {
                        font-size: 1.1rem;
                    }

                    .ad-description {
                        font-size: 0.8rem;
                    }

                    .ad-btn {
                        padding: 8px 16px;
                        font-size: 0.8rem;
                    }

                    .countdown-timer {
                        font-size: 0.7rem;
                        padding: 4px 10px;
                    }
                }
            `}</style>
        </>
    );
};

export default AdsTypeBlock;