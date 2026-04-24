import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './InContentAds.css';

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

// Countdown Timer Component for InContentAds
const InContentCountdownTimer = ({ endDate }) => {
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

    return (
        <div className="incontent-countdown">
            {timeLeft.days > 0 && (
                <span className="countdown-days">{timeLeft.days}d</span>
            )}
            <span className="countdown-hours">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="countdown-sep">:</span>
            <span className="countdown-mins">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="countdown-sep">:</span>
            <span className="countdown-secs">{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
    );
};

const InContentAds = () => {
  const [ads, setAds] = useState([]);
  const [uniqueAdCount, setUniqueAdCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);
  const sliderRef = useRef(null);
  const scrollPosRef = useRef(0);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Track screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 992);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchInContentAds();
  }, []);

  // Auto-scroll for infinite scrolling effect
  useEffect(() => {
    if (ads.length === 0 || loading) return;
    
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollInterval = setInterval(() => {
      const itemWidth = 280; // Approximate width of each ad item
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const nextScroll = scrollPosRef.current + itemWidth;
      
      if (nextScroll >= maxScroll) {
        scrollPosRef.current = 0;
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollPosRef.current = nextScroll;
        slider.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(scrollInterval);
  }, [ads, loading]);

  const fetchInContentAds = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiUrl}/api/ads`);

      if (response.data.success) {
        // Filter by active status, position, AND valid date range
        const inContentAds = response.data.data.filter(
          ad => ad.status === 'active' && ad.position === 'in_content' && isAdValid(ad)
        );

        // Determine duplication based on screen size and ad count
        const minAdsForMobile = 2;
        const minAdsForLaptop = 5;

        let duplicatedAds;
        if (isLargeScreen) {
          // Laptop view (>= 992px): duplicate 5 times only if there are 5+ unique ads
          if (inContentAds.length >= minAdsForLaptop) {
            duplicatedAds = [...inContentAds, ...inContentAds, ...inContentAds, ...inContentAds, ...inContentAds];
          } else {
            duplicatedAds = [...inContentAds];
          }
        } else {
          // Mobile view (< 992px): don't repeat if there are less than 2 unique ads
          if (inContentAds.length >= minAdsForMobile) {
            duplicatedAds = [...inContentAds, ...inContentAds];
          } else {
            duplicatedAds = [...inContentAds];
          }
        }
        setAds(duplicatedAds);
        setUniqueAdCount(inContentAds.length);
      }
    } catch (err) {
      console.error('Failed to fetch in-content ads:', err);
      setError('Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  const getAdLink = (ad) => {
    if (ad.id && !ad.id.startsWith('mock')) {
      return `/promo-products/${ad.id}`;
    }
    return ad.link || ad.thumbnail_url || '/shop';
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const itemWidth = 280; // Approximate width of each ad item
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      
      if (direction === 'next') {
        const nextScroll = scrollPosRef.current + itemWidth;
        if (nextScroll >= maxScroll) {
          scrollPosRef.current = 0;
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollPosRef.current = nextScroll;
          slider.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      } else {
        const prevScroll = scrollPosRef.current - itemWidth;
        if (prevScroll <= 0) {
          scrollPosRef.current = maxScroll;
          slider.scrollTo({ left: maxScroll, behavior: 'smooth' });
        } else {
          scrollPosRef.current = prevScroll;
          slider.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        }
      }
    }
  };

  // Truncate text to specified length with ellipsis
  const truncateText = (text, maxLength = 20) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <section className="in-content-ads-section ">
        <div className="container ">
          <div className="ads-loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || ads.length === 0) {
    return null;
  }

  const renderAdCard = (ad, index) => {
    const baseUrl = apiUrl;
    const imageUrl = ad.mockUrl || `${baseUrl}/storage/${ad.media_url}`;
    const adLink = getAdLink(ad);
    const isExternal = adLink.startsWith('http');

    const adCard = (
      <div className="ad-item" style={{width:'100%'}} key={`${ad.id}-${index}`}>
        {isExternal ? (
          <a href={adLink} target="_blank" rel="noopener noreferrer" className="ad-link-wrapper">
            <div className="ad-image-container">
              <img src={imageUrl} alt={ad.title} className="ad-image" onError={(e) => (e.target.src = '/placeholder-product.png')} />
              <div className="badges-overlay">
                {ad.discount_value && (
                  <span className="discount-badge" >
                    {ad.discount_type === 'percent' ? <><span className="discount-percentage">{ad.discount_value}%</span><span className="discount-label">OFF</span></> : `₦${ad.discount_value} OFF`}
                  </span>
                )}
                {ad.free_shipping && <span className="free-delivery-badge"><span className="free-icon">🚚</span> Free Delivery</span>}
              </div>
              {/* Countdown Timer */}
              {ad.ends_at && (
                <div className="countdown-overlay">
                  <InContentCountdownTimer endDate={ad.ends_at} />
                </div>
              )}
              {/* <div className="overlay-hover"><button className="cta-button">View Offer</button></div> */}
            </div>
            <div className="ad-content">
              <h4 className="ad-title">{truncateText(ad.title, 20)}</h4>
              <div className="price-row">
                {ad.original_price && <span className="original-price">₦{ad.original_price.toLocaleString()}</span>}
                {ad.discount_value && ad.final_price && <span className="current-price">₦{ad.final_price.toLocaleString()}</span>}
              </div>
              {ad.rating && <div className="rating-row"><span className="star-icon">★</span><span className="rating-count">{ad.rating}</span></div>}
            </div>
          </a>
        ) : (
          <Link to={adLink} className="ad-link-wrapper">
            <div className="ad-image-container">
              <img src={imageUrl} alt={ad.title} className="ad-image" onError={(e) => (e.target.src = '/placeholder-product.png')} />
              <div className="badges-overlay" style={{background:'red'}}>
                {ad.discount_value && (
                  <span className="discount-badge" style={{ fontSize:'10px', minWidth:'fit-content',width:'fit-content', background:'red', backgroundColor: ad.discount_type === 'percent' ? '#e53935' : '#43a047' }}>
                    {ad.discount_type === 'percent' ? <><span style={{fontSize:'10px', }} className="discount-percentage">{ad.discount_value}%</span><span className="discount-label">OFF</span></> : <><span style={{fontSize:'10px'}} className="discount-percentage">₦{ad.discount_value}%</span><span className="discount-label">OFF</span></>}
                  </span>
                )}
                {ad.free_shipping && <span className="free-delivery-badge"><span className="free-icon">🚚</span> Free Delivery</span>}
              </div>
              {/* Countdown Timer */}
              {ad.ends_at && (
                <div className="countdown-overlay">
                  <InContentCountdownTimer endDate={ad.ends_at} />
                </div>
              )}
              {/* <div className="overlay-hover"><button className="cta-button">View Offer</button></div> */}
            </div>
            <div className="ad-content">
              <h4 className="ad-title">{truncateText(ad.title, 20)}</h4>
              <div className="price-row">
                {ad.original_price && <span className="original-price">₦{ad.original_price.toLocaleString()}</span>}
                {ad.discount_value && ad.final_price && <span className="current-price">₦{ad.final_price.toLocaleString()}</span>}
              </div>
              {ad.rating && <div className="rating-row"><span className="star-icon">★</span><span className="rating-count">{ad.rating}</span></div>}
            </div>
          </Link>
        )}
      </div>
    );

    return adCard;
  };

  // Determine if scroll buttons should be shown
  const shouldShowScrollButtons = isLargeScreen 
    ? uniqueAdCount >= 5 
    : uniqueAdCount >= 2;

  return (
    <section className="in-content-ads-section">
      <div className="verticalLimit">
        <div className="section-header">
          <div className="promo-title-wrapper">
            <span className="flash-icon">⚡</span>
            <h2 className="promo-title">Flash Sales</h2>
          </div>
          <a href="shop" className="shop-all-link">Shop All <span className="arrow-right">→</span></a>
        </div>
        
        <div className="ads-slider-container  ">
          {shouldShowScrollButtons && (
            <button className="slider-nav prev" onClick={() => scrollSlider('prev')} aria-label="Previous">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
          )}
          
          <div className="ads-slider " ref={sliderRef}>
            {ads.map((ad, index) => renderAdCard(ad, index))}
          </div>
          
          {shouldShowScrollButtons && (
            <button className="slider-nav next" onClick={() => scrollSlider('next')} aria-label="Next">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default InContentAds;

