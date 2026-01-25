import React from 'react';
import './About.css';
import useSettings from '../../../hooks/useSettings';

// Helper function to safely render Quill content
const renderQuillContent = (content) => {
  if (!content) return null;
  
  // If content is already HTML, return it as is
  if (typeof content === 'string' && (content.includes('<') || content.includes('&'))) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }
  
  // If it's plain text, wrap in paragraph
  return <p>{content}</p>;
};

const AboutUs = () => {
  const { settings, isLoading: settingsLoading } = useSettings();

  // if (settingsLoading) {
  //   return <div className="about-us-container">Loading...</div>;
  // }

  return (
    <div className="about-us-container">
      {/* Hero Section */}
      {/* <div className="about-hero">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">About Our Company</h1>
            <p className="hero-subtitle">
              Building the future of e-commerce, one customer at a time
            </p>
          </div>
        </div>
      </div> */}

    

      {/* Story Section */}
      {settings && settings.store_description && (
        <div className="story-section">
          <div className="container">
            <div className="story-content">
              <div className="story-text">
                <h2>Our Story</h2>
                <div className="store-description">
                  {renderQuillContent(settings.store_description)}
                </div>
                {/* Stats Grid - Optional */}
                {/* <div className="stats-grid-about-us">
                  <div className="stat-item">
                    <div className="stat-number">50K+</div>
                    <div className="stat-label">Happy Customers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">100+</div>
                    <div className="stat-label">Cities Served</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">24/7</div>
                    <div className="stat-label">Customer Support</div>
                  </div>
                </div> */}
              </div>
              <div className="story-image">
                <div className="image-placeholder">
                  <i className="fas fa-store"></i>
                  <p className="text-light">Our Journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
  {/* Mission & Vision Section */}
      {settings && (settings.mission_statement || settings.vision_statement) && (
        <div className="mission-vision-section">
          <div className="container">
            <div className="mv-grid">
              {settings.mission_statement && (
                <div className="mv-card mission-car shadow-md">
                  <div className="mv-icon">
                    <i className="fas fa-bullseye"></i>
                  </div>
                  <h3>Our Mission</h3>
                  <div className="mission-content" style={{ color: 'white' }}>
                    <p style={{ color: 'white' }}>{renderQuillContent(settings.mission_statement)} </p>
                  </div>
                </div>
              )}

              {settings.vision_statement && (
                <div className="mv-card vision-car shadow-md">
                  <div className="mv-icon">
                    <i className="fas fa-eye"></i>
                  </div>
                  <h3>Our Vision</h3>
                  <div className="vision-content" style={{ color: 'white' }}>
                    {renderQuillContent(settings.vision_statement)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Values Section */}
      <div className="values-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-users"></i>
              </div>
              <h4>Customer First</h4>
              <p>Our customers are at the heart of every decision we make</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Trust & Quality</h4>
              <p>We stand behind every product and promise we make</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h4>Innovation</h4>
              <p>Constantly evolving to bring you better shopping experiences</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
              <h4>Community</h4>
              <p>Building relationships that go beyond transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;