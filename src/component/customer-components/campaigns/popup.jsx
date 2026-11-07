import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PopupAd = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [popupAd, setPopupAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState({});
    const [hasInteracted, setHasInteracted] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Calculate time remaining for the ad
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

    // Fetch popup ads data from API
    const fetchPopupAds = async () => {
        try {
            setLoading(true);
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
            // //console.log('Popup Ads API Response:', result);
            
            if (result.success && result.data) {
                const now = new Date();
                // Filter for popup ads that are active and current
                const popupAds = result.data
                    .filter(ad => {
                        const isActive = ad.status === 'active';
                        const hasStarted = new Date(ad.starts_at) <= now;
                        const hasNotEnded = new Date(ad.ends_at) > now;
                        // Check if this is a popup ad - if no position field, include all
                        const isPopup = !ad.position || ad.position === 'popup';
                        return isActive && hasStarted && hasNotEnded && isPopup;
                    })
                    .map(ad => ({
                        id: ad.id,
                        title: ad.title,
                        description: ad.description,
                        image: ad.media_url ? `${baseUrl}/storage/${ad.media_url}` : '',
                        // price: ad.price || "$899",
                        // discount: ad.discount || "30% OFF",
                        link: "/shop",
                        type: ad.type,
                        position: ad.position,
                        starts_at: ad.starts_at,
                        ends_at: ad.ends_at,
                        priority: ad.priority
                    }))
                    .sort((a, b) => b.priority - a.priority);

                // //console.log('Filtered Popup Ads:', popupAds);
                
                // Take the highest priority popup ad
                if (popupAds.length > 0) {
                    setPopupAd(popupAds[0]);
                    setTimeRemaining(calculateTimeRemaining(popupAds[0].ends_at));
                    //console.log('✅ Popup ad set:', popupAds[0]);
                } else {
                    //console.log('❌ No popup ads found after filtering');
                    setPopupAd(null);
                }
            } else {
                //console.log('❌ API response not successful or no data');
                setPopupAd(null);
            }
        } catch (err) {
            //console.error('Error fetching popup ads:', err);
            setPopupAd(null);
        } finally {
            setLoading(false);
            setInitialLoadComplete(true);
            //console.log('✅ Loading set to false, initialLoadComplete set to true');
        }
    };

    // Update countdown timer
    useEffect(() => {
        if (!popupAd) return;

        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining(popupAd.ends_at));
        }, 1000);

        return () => clearInterval(timer);
    }, [popupAd]);

    // Check if we should show popup
    const shouldShowPopup = () => {
        //console.log('Checking if should show popup...');
        //console.log('Loading:', loading, 'PopupAd:', !!popupAd, 'InitialLoadComplete:', initialLoadComplete);
        
        // Don't show if still loading initial data
        if (loading || !initialLoadComplete) {
            //console.log('❌ Still loading or initial load not complete');
            return false;
        }
        
        // If no popup ad available, don't show
        if (!popupAd) {
            //console.log('❌ No popup ad available');
            return false;
        }
        
        const lastPopupTime = localStorage.getItem('lastPopupTime');
        const currentTime = new Date().getTime();
        
        // Show popup if never shown before or 20 minutes have passed
        if (!lastPopupTime) {
            //console.log('✅ First time visit - showing popup');
            return true;
        }
        
        const timeSinceLastPopup = currentTime - parseInt(lastPopupTime);
        const twentyMinutes = 20 * 60 * 1000;
        const shouldShow = timeSinceLastPopup >= twentyMinutes;
        
        //console.log(`Time since last popup: ${Math.round(timeSinceLastPopup / 1000 / 60)} minutes`);
        //console.log(`Should show: ${shouldShow}`);
        
        return shouldShow;
    };

    // Show popup function
    const showPopup = () => {
        //console.log('🎯 showPopup called');
        const shouldShow = shouldShowPopup() && !hasInteracted;
        //console.log('Should show:', shouldShow, 'Has interacted:', hasInteracted);
        
        if (shouldShow) {
            setIsVisible(true);
            //console.log('🚀 Setting popup visible!');
            localStorage.setItem('lastPopupTime', new Date().getTime().toString());
        }
    };

    // Close popup function
    const closePopup = () => {
        //console.log('Closing popup');
        setIsVisible(false);
        setHasInteracted(true);
    };

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closePopup();
        }
    };

    // Initial setup - fetch ads on mount
    useEffect(() => {
        //console.log('🔧 Initial setup started');
        fetchPopupAds();
    }, []);

    // Set up timers AFTER initial load is complete
    useEffect(() => {
        if (!initialLoadComplete) return;

        //console.log('⏰ Setting up timers after initial load complete');
        
        // Show popup immediately after load complete
        const initialTimer = setTimeout(() => {
            //console.log('⏰ Initial timer fired');
            showPopup();
        }, 1000); // Reduced to 1 second after load complete

        // Set up interval to check every minute if popup should be shown
        const interval = setInterval(() => {
            //console.log('🔄 Interval check fired');
            showPopup();
        }, 60000); // Check every minute

        return () => {
            //console.log('🧹 Cleaning up timers');
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [initialLoadComplete, popupAd]); // Depend on initialLoadComplete and popupAd

    // Debug effect to log state changes
    useEffect(() => {
        // //console.log('🔄 State updated:', { 
        //     isVisible, 
        //     hasPopupAd: !!popupAd, 
        //     loading, 
        //     hasInteracted,
        //     initialLoadComplete
        // });
    }, [isVisible, popupAd, loading, hasInteracted, initialLoadComplete]);

    // Don't render anything if no popup ad or not visible
    if (!popupAd || !isVisible) {
        // //console.log('❌ Not rendering popup:', { 
        //     hasPopupAd: !!popupAd, 
        //     isVisible,
        //     initialLoadComplete 
        // });
        return null;
    }

    //console.log('✅ Rendering popup!');
    const timeLeft = timeRemaining;
    const isExpired = timeLeft.expired;

    return (
        <>
            <div className="popup-ad-overlay" onClick={handleBackdropClick}>
                <div className="popup-ad-container">
                    <button 
                        className="popup-close-btn"
                        onClick={closePopup}
                        aria-label="Close popup"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <div className="popup-ad-content">
                        <div className="popup-image-section">
                            <img 
                                src={popupAd.image} 
                                alt={popupAd.title}
                                className="popup-ad-image"
                                onError={(e) => {
                                    //console.log('Image failed to load');
                                    e.target.style.display = 'none';
                                }}
                                onLoad={() => console.log('Image loaded successfully')}
                            />
                            {/* <div className="popup-badges">
                                <span className="popup-discount-badge">
                                    {isExpired ? 'EXPIRED' : popupAd.discount}
                                </span>
                                <span className="popup-trending-badge">🔥 Limited Time</span>
                            </div> */}
                        </div>

                        <div className="popup-info-section">
                            <div className="popup-header">
                                <h3 className="popup-ad-title">{popupAd.title}</h3>
                                <p className="popup-ad-description">{popupAd.description}</p>
                            </div>

                            <div className="popup-countdown">
                                <div className="countdown-header">
                                    <span className="countdown-icon">⏰</span>
                                    <span className="countdown-label">Offer ends in:</span>
                                </div>
                                <div className={`countdown-timer ${isExpired ? 'expired' : ''}`}>
                                    {isExpired ? 'Offer Ended' : formatTimeRemaining(timeLeft)}
                                </div>
                            </div>

                            {/* <div className="popup-price-section">
                                <span className="popup-price">{popupAd.price}</span>
                                <span className="popup-old-price">$1,199</span>
                            </div> */}

                            <div className="popup-actions">
                                <Link 
                                    to={isExpired ? '#' : popupAd.link}
                                    className={`popup-shop-btn ${isExpired ? 'disabled' : ''}`}
                                    onClick={isExpired ? (e) => e.preventDefault() : closePopup}
                                >
                                    {isExpired ? 'Offer Expired' : 'Shop Now'}
                                    {!isExpired && <span className="btn-arrow">→</span>}
                                </Link>
                                
                                {/* <button 
                                    className="popup-later-btn"
                                    onClick={closePopup}
                                >
                                    Maybe Later
                                </button> */}
                            </div>

                            {/* <div className="popup-footer">
                                <span className="popup-note">This offer won't last long!</span>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .popup-ad-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 20px;
                    animation: fadeIn 0.3s ease-out;
                }

                .popup-ad-container {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.3);
                    max-width: 900px;
                    width: 100%;
                    position: relative;
                    animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    overflow: hidden;
                }

                .popup-close-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    color: #666;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    z-index: 10;
                }

                .popup-close-btn:hover {
                    background: #ff6b00;
                    color: white;
                    transform: rotate(90deg);
                }

                .popup-ad-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: 500px;
                }

                .popup-image-section {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(135deg, #ff6b00, #ff8c00);
                }

                .popup-ad-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s ease;
                }

                .popup-ad-container:hover .popup-ad-image {
                    transform: scale(1.05);
                }

                .popup-badges {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    align-items: flex-start;
                }

                .popup-discount-badge {
                    background: linear-gradient(135deg, #ff416c, #ff4b2b);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: 0 4px 12px rgba(255, 65, 108, 0.4);
                }

                .popup-trending-badge {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .popup-info-section {
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .popup-header {
                    margin-bottom: 24px;
                }

                .popup-ad-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin: 0 0 12px 0;
                    line-height: 1.2;
                }

                .popup-ad-description {
                    font-size: 1rem;
                    color: #666;
                    line-height: 1.5;
                    margin: 0;
                }

                .popup-countdown {
                    background: linear-gradient(135deg, #fff5e6, #ffe8cc);
                    padding: 20px;
                    border-radius: 16px;
                    margin: 24px 0;
                    text-align: center;
                }

                .countdown-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .countdown-icon {
                    font-size: 1.2rem;
                    animation: pulse 2s infinite;
                }

                .countdown-label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #ff6b00;
                }

                .countdown-timer {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1a1a1a;
                }

                .countdown-timer.expired {
                    color: #dc2626;
                }

                .popup-price-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 20px 0;
                }

                .popup-price {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #ff6b00;
                }

                .popup-old-price {
                    font-size: 1.2rem;
                    color: #999;
                    text-decoration: line-through;
                }

                .popup-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin: 24px 0;
                }

                .popup-shop-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #ff6b00, #ff8c00);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 50px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 8px 25px rgba(255, 107, 0, 0.4);
                }

                .popup-shop-btn:hover:not(.disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(255, 107, 0, 0.6);
                }

                .popup-shop-btn.disabled {
                    background: #6b7280;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .popup-later-btn {
                    background: transparent;
                    color: #666;
                    border: 2px solid #e5e7eb;
                    padding: 12px 24px;
                    border-radius: 50px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .popup-later-btn:hover {
                    border-color: #ff6b00;
                    color: #ff6b00;
                }

                .popup-footer {
                    text-align: center;
                    margin-top: auto;
                }

                .popup-note {
                    font-size: 0.9rem;
                    color: #999;
                    font-style: italic;
                }

                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .popup-ad-overlay {
                        padding: 10px;
                    }

                    .popup-ad-content {
                        grid-template-columns: 1fr;
                        min-height: auto;
                    }

                    .popup-image-section {
                        height: 200px;
                    }

                    .popup-info-section {
                        padding: 24px;
                    }

                    .popup-ad-title {
                        font-size: 1.5rem;
                    }

                    .popup-price {
                        font-size: 1.5rem;
                    }

                    .countdown-timer {
                        font-size: 1.2rem;
                    }
                }

                @media (max-width: 480px) {
                    .popup-ad-container {
                        border-radius: 16px;
                    }

                    .popup-info-section {
                        padding: 20px;
                    }

                    .popup-ad-title {
                        font-size: 1.3rem;
                    }

                    .popup-actions {
                        flex-direction: column;
                        gap: 8px;
                        margin: 20px 0;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-wrap: wrap;
                    }

                    .popup-shop-btn,
                    .popup-later-btn {
                        width: 100%;
                        max-width: 200px;
                    }
                }
            `}</style>
        </>
    );
};

export default PopupAd;