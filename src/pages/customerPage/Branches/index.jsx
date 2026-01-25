import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Branches.css';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBranches = filteredBranches.filter(branch => branch.is_active);

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
    

      {/* Search Section */}
      <div className="search-section verticalLimit">
        <div className="containe  m-0">
          <div className="search-card m-0 w-100 ">
            <div className="search-header">
              <h3>Find Your Nearest Store</h3>
              <p>Search by location, store name, or services</p>
            </div>
            <div className="search-controls">
              <div className="search-input-wrapper">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Enter city, address, or store name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
             
            </div>
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="branches-section ">
        <div className="container">
          {activeBranches.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3>No stores found</h3>
              <p>Try adjusting your search or browse all available locations</p>
              <button className="btn-primary" onClick={() => setSearchQuery('')}>
                Show All Stores
              </button>
            </div>
          ) : (
            <div className="branches-grid">
              {activeBranches.map((branch, index) => (
                <div key={branch.id} className="branch-card" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="card-header">
                    <div className="store-badge">
                      <i className="fas fa-store"></i>
                    </div>
                    {/* <div className="status-indicator">
                      <span className="status-dot"></span>
                      <span className="status-text">Open Now</span>
                    </div> */}
                  </div>
                  
                  <div className="card-body">
                    <h3 className="store-name">{branch.name}</h3>
                    
                    <div className="store-details">
                      <div className="detail-row">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{branch.address}</span>
                      </div>
                      <div className="detail-row">
                        <i className="fas fa-phone"></i>
                        <a href={`tel:${branch.phone}`}>{branch.phone}</a>
                      </div>
                      <div className="detail-row">
                        <i className="fas fa-envelope"></i>
                        <a href={`mailto:${branch.email}`}>{branch.email}</a>
                      </div>
                    </div>

                    <div className="services-tags">
                      <span className="service-tag">
                        <i className="fas fa-truck"></i> Pickup
                      </span>
                      <span className="service-tag">
                        <i className="fas fa-undo"></i> Returns
                      </span>
                      <span className="service-tag">
                        <i className="fas fa-headset"></i> Support
                      </span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn-directions"
                      onClick={() => openInMaps(branch.latitude, branch.longitude, branch.name)}
                    >
                      <i className="fas fa-directions"></i>
                      Directions
                    </button>
                    <button className="btn-call">
                      <i className="fas fa-phone"></i>
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Visit Our Stores?</h2>
            <p>Experience the best of both online and offline shopping</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h4>Flexible Hours</h4>
              <p>Extended hours to fit your schedule. Most locations open 9AM-8PM weekdays</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-check"></i>
              </div>
              <h4>Safe & Secure</h4>
              <p>Enhanced safety protocols and contactless options for your peace of mind</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-user-tie"></i>
              </div>
              <h4>Expert Staff</h4>
              <p>Knowledgeable associates ready to help with product recommendations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h4>Quick Pickup</h4>
              <p>Order online and pickup in-store for fast, convenient shopping</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Branches;