import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import useSettings from '../../../hooks/useSettings';

const renderQuillContent = (content) => {
  if (!content) return null;

  if (typeof content === 'string' && (content.includes('<') || content.includes('&'))) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return <p>{content}</p>;
};

const AboutUs = () => {
  const { settings } = useSettings();
  const hasStory = Boolean(settings?.store_description);
  const hasMissionOrVision = Boolean(settings?.mission_statement || settings?.vision_statement);

  return (
    <main className="about-us-container">
      <section className="about-hero">
        <div className="about-shell about-hero-layout">
          <div className="about-hero-copy">
            <span className="about-eyebrow">
              <i className="fas fa-sparkles" aria-hidden="true"></i>
              MADE FOR EVERY BRIGHT IDEA
            </span>
            <h1>Creativity starts <span>with the right things.</span></h1>
            <p>
              We bring together stationery, art materials, and everyday essentials
              to help students, makers, and dreamers do their best work.
            </p>
            <div className="about-hero-actions">
              <Link to="/shop" className="about-primary-link">
                Explore the store <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </Link>
              <Link to="/branches" className="about-secondary-link">
                Find a branch
              </Link>
            </div>
          </div>
          <div className="about-hero-visual" aria-hidden="true">
            <div className="about-visual-orbit"></div>
            <div className="about-logo-card">
              <img src="/assets/image/dark_logo.png" alt="" />
              <span>Ideas start here</span>
            </div>
            <span className="about-visual-spark about-visual-spark-one">✦</span>
            <span className="about-visual-spark about-visual-spark-two">✳</span>
          </div>
        </div>
      </section>

      {hasStory && (
        <section className="about-story-section">
          <div className="about-shell about-story-layout">
            <div className="about-story-heading">
              <span className="about-section-kicker">WHO WE ARE</span>
              <h2>A place for people who love to make.</h2>
              <span className="about-heading-accent" aria-hidden="true"></span>
            </div>
            <div className="about-story-copy">
              {renderQuillContent(settings.store_description)}
            </div>
          </div>
        </section>
      )}

      {hasMissionOrVision && (
        <section className="about-purpose-section">
          <div className="about-shell">
            <div className="about-section-heading">
              <span className="about-section-kicker">WHAT GUIDES US</span>
              <h2>Our purpose, in every detail.</h2>
              <p>The reason behind the products we choose and the way we serve.</p>
            </div>
            <div className={`about-purpose-grid${settings.mission_statement && settings.vision_statement ? '' : ' about-purpose-grid--single'}`}>
              {settings.mission_statement && (
                <article className="about-purpose-card">
                  <div className="about-purpose-icon">
                    <i className="fas fa-bullseye" aria-hidden="true"></i>
                  </div>
                  <span className="about-card-label">OUR MISSION</span>
                  <h3>What we do</h3>
                  <div className="about-rich-content">
                    {renderQuillContent(settings.mission_statement)}
                  </div>
                </article>
              )}

              {settings.vision_statement && (
                <article className="about-purpose-card about-purpose-card--accent">
                  <div className="about-purpose-icon">
                    <i className="fas fa-eye" aria-hidden="true"></i>
                  </div>
                  <span className="about-card-label">OUR VISION</span>
                  <h3>Where we’re going</h3>
                  <div className="about-rich-content">
                    {renderQuillContent(settings.vision_statement)}
                  </div>
                </article>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="about-values-section">
        <div className="about-shell">
          <div className="about-section-heading">
            <span className="about-section-kicker">THE CHAPTER ONE WAY</span>
            <h2>Good things we believe in.</h2>
            <p>The principles that shape every customer experience.</p>
          </div>
          <div className="about-values-grid">
            <article className="about-value-card">
              <div className="about-value-icon"><i className="fas fa-users" aria-hidden="true"></i></div>
              <div>
                <h3>People come first</h3>
                <p>We put customers at the heart of every decision we make.</p>
              </div>
            </article>
            <article className="about-value-card">
              <div className="about-value-icon"><i className="fas fa-shield-alt" aria-hidden="true"></i></div>
              <div>
                <h3>Trust in every detail</h3>
                <p>We stand behind the quality of every product and promise.</p>
              </div>
            </article>
            <article className="about-value-card">
              <div className="about-value-icon"><i className="fas fa-lightbulb" aria-hidden="true"></i></div>
              <div>
                <h3>Always keep creating</h3>
                <p>We keep finding better ways to support work, learning, and art.</p>
              </div>
            </article>
            <article className="about-value-card">
              <div className="about-value-icon"><i className="fas fa-heart" aria-hidden="true"></i></div>
              <div>
                <h3>Rooted in community</h3>
                <p>We build relationships that go well beyond the checkout.</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
