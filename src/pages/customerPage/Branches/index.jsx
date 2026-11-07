import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Branches.css';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL;
      const url = baseUrl.endsWith('/') ? `${baseUrl}api/branches` : `${baseUrl}/api/branches`;
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const activeBranches = branches.filter(branch => {
    if (!branch.is_active) return false;
    const query = searchQuery.trim().toLowerCase();
    return !query ||
      branch.name?.toLowerCase().includes(query) ||
      branch.address?.toLowerCase().includes(query);
  });

  const openInMaps = (latitude, longitude, name) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  // if (loading) {
  //   return (
  //     <div className="branches-loading">
  //       <div className="loading-container">
  //         <div className="loading-spinner"></div>
  //         <h3>Finding Our Stores</h3>
  //         <p className='text-light'>Please wait while we locate our branches...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="branches-container">
      <section className="branches-hero">
        <div className="branches-shell">
          <div className="branches-hero-content">
            <span className="branches-eyebrow">
              <i className="fas fa-location-dot" aria-hidden="true"></i>
              HERE FOR YOU, IN PERSON
            </span>
            <h1>Find your <span>Chapter One.</span></h1>
            <p>
              Discover a store near you for stationery, art supplies, friendly advice,
              and convenient order pickup.
            </p>
            <div className="branches-hero-meta">
              <span className="branches-count">
                <i className="fas fa-store" aria-hidden="true"></i>
                {branches.filter(branch => branch.is_active).length} stores to explore
              </span>
              <Link to="/shop" className="branches-shop-link">
                Shop online <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </div>
          </div>
          <div className="branches-hero-art" aria-hidden="true">
            <div className="hero-art-orbit"></div>
            <div className="hero-art-card">
              <img src="/assets/image/dark_logo.png" alt="" />
            </div>
            <span className="hero-art-spark hero-art-spark-one">✦</span>
            <span className="hero-art-spark hero-art-spark-two">✳</span>
          </div>
        </div>
      </section>

      <section className="branch-finder">
        <div className="branches-shell">
          <div className="search-card">
            <div className="search-header">
              <span className="search-kicker">OUR LOCATIONS</span>
              <h2>Find your nearest store</h2>
              <p>Search by store name or address to find the right location.</p>
            </div>
            <div className="search-controls">
              <label className="search-input-wrapper">
                <i className="fas fa-search" aria-hidden="true"></i>
                <input
                  type="text"
                  aria-label="Search stores by name or address"
                  placeholder="Try a store name or address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="fas fa-times" aria-hidden="true"></i>
                  </button>
                )}
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="branches-section">
        <div className="branches-shell">
          <div className="locations-heading">
            <div>
              <span className="search-kicker">CHAPTER ONE NEAR YOU</span>
              <h2>{searchQuery ? 'Search results' : 'Visit us in store'}</h2>
            </div>
            {!loading && activeBranches.length > 0 && (
              <span className="locations-result-count">
                {activeBranches.length} {activeBranches.length === 1 ? 'location' : 'locations'}
              </span>
            )}
          </div>
          {loading ? (
            <div className="branches-state" role="status">
              <span className="branches-spinner"></span>
              <h3>Finding our stores</h3>
              <p>Loading locations near you...</p>
            </div>
          ) : activeBranches.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3>{searchQuery ? 'No matching stores' : 'Our stores are taking a break'}</h3>
              <p>{searchQuery
                ? 'Try another store name or address.'
                : 'Please check back soon for our store locations.'}</p>
              {searchQuery && (
                <button className="btn-primary" onClick={() => setSearchQuery('')}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className={`branches-grid${activeBranches.length === 1 ? ' branches-grid--one' : activeBranches.length === 2 ? ' branches-grid--two' : ''}`}>
              {activeBranches.map((branch, index) => (
                <article key={branch.id} className="branch-card" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="card-header">
                    {/* <div className="store-badge">
                      <i className="fas fa-store" aria-hidden="true"></i>
                    </div> */}
                    {/* <div className="status-indicator">
                      <span className="status-dot"></span>
                      <span className="status-text">Active location</span>
                    </div> */}
                  </div>
                  
                  <div className="card-body">
                    <h3 className="store-name">{branch.name}</h3>
                    
                    <div className="store-details">
                      <div className="detail-row">
                        <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
                        <span>{branch.address}</span>
                      </div>
                      <div className="detail-row">
                        <i className="fas fa-phone" aria-hidden="true"></i>
                        <a href={`tel:${branch.phone}`}>{branch.phone}</a>
                      </div>
                      <div className="detail-row">
                        <i className="fas fa-envelope" aria-hidden="true"></i>
                        <a href={`mailto:${branch.email}`}>{branch.email}</a>
                      </div>
                    </div>

                    <div className="services-tags">
                      <span className="service-tag">
                        <i className="fas fa-truck" aria-hidden="true"></i> Pickup
                      </span>
                      <span className="service-tag">
                        <i className="fas fa-undo" aria-hidden="true"></i> Returns
                      </span>
                      <span className="service-tag">
                        <i className="fas fa-headset" aria-hidden="true"></i> Support
                      </span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn-directions"
                      onClick={() => openInMaps(branch.latitude, branch.longitude, branch.name)}
                    >
                      <i className="fas fa-directions" aria-hidden="true"></i>
                      Directions
                    </button>
                    <a className="btn-call" href={`tel:${branch.phone}`}>
                      <i className="fas fa-phone" aria-hidden="true"></i> Call store
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="features-section">
        <div className="branches-shell">
          <div className="section-heade">
            <span className="search-kicker">A LITTLE MORE CHAPTER ONE</span>
            <h2>More than a place to shop.</h2>
            <p>Thoughtful service and a great selection, wherever you find us.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-box-open" aria-hidden="true"></i>
              </div>
              <h4>Easy order pickup</h4>
              <p>Shop online and collect your order from a convenient store location.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-palette" aria-hidden="true"></i>
              </div>
              <h4>Made for creativity</h4>
              <p>Explore art materials, stationery, and supplies for every bright idea.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-heart" aria-hidden="true"></i>
              </div>
              <h4>Here to help</h4>
              <p>Get friendly support choosing the right tools for school, work, or art.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Branches;