import React, { useState } from 'react';
import './FAQ.css';
import useSettings from '../../../hooks/useSettings';
import { useAuth } from '../../../component/Auth/AuthContext';
 import { Link } from 'react-router-dom';
const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { settings, isLoading: settingsLoading } = useSettings();
  const { isAuthenticated, user, logout } = useAuth();
  const company_email = settings ? settings.store_email && settings.store_email  : null;
  const company_phone = settings ? settings.store_phone && settings.store_phone  : null;
  const faqData = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days, depending on the destination."
    },


    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'Order History' section."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), and bank transfers for certain orders."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "Orders can be modified or cancelled within 1 hour of placement. After that, orders enter our fulfillment process and cannot be changed. Contact customer service immediately if you need assistance."
    },
    {
      question: "Do you have physical stores?",
      answer: "Yes! We have multiple physical locations across the country. Visit our Branches page to find a store near you with complete address, hours, and contact information."
    },
    {
      question: "How do I contact customer service?",
      answer: "You can reach our customer service team via phone at 1-800-STORES, email at support@ourstore.com"
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      {/* Hero Section */}
      <div className="faq-hero">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Frequently Asked Questions</h1>
            <p className="hero-subtitle">
              Find quick answers to common questions about shopping with us
            </p>
          </div>
        </div>
      </div>


      {/* FAQ Content */}
      <div className="faq-content-section">
        <div className="container">
          <div className="faq-grid">
            <div className="faq-main">
              <div className="faq-category">
                <h3>Shipping & Delivery</h3>
                <div className="faq-list">
                  {faqData.slice(0, 3).map((item, index) => (
                    <div key={index} className="faq-item">
                      <div
                        className="faq-question"
                        onClick={() => toggleFAQ(index)}
                      >
                        <span>{item.question}</span>
                        <i className={`fas fa-chevron-${activeIndex === index ? 'up' : 'down'}`}></i>
                      </div>
                      <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="faq-category">
                <h3>Orders & Returns</h3>
                <div className="faq-list">
                  {faqData.slice(3, 6).map((item, index) => (
                    <div key={index + 3} className="faq-item">
                      <div
                        className="faq-question"
                        onClick={() => toggleFAQ(index + 3)}
                      >
                        <span>{item.question}</span>
                        <i className={`fas fa-chevron-${activeIndex === index + 3 ? 'up' : 'down'}`}></i>
                      </div>
                      <div className={`faq-answer ${activeIndex === index + 3 ? 'active' : ''}`}>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

          
            </div>

            <div className="faq-sidebar">
              <div className="help-card">
                <div className="help-icon">
                  <i className="fas fa-headset"></i>
                </div>
                <h4>Still Need Help?</h4>
                <p>Our customer support team is here to assist you</p>
                <div className="contact-methods">
                  <div className="contact-method">
                    <i className="fas fa-phone"></i>
                    <div>
                      <strong>Call Us</strong>
                      <span>{company_phone}</span>
                    </div>
                  </div>
                  <div className="contact-method">
                    <i className="fas fa-envelope"></i>
                    <div>
                      <strong>Email Us</strong>
                      <span>{company_email}</span>
                    </div>
                  </div>
                 { settings && settings.whatsapp && <div className="contact-method">
                    <i className="fab fa-whatsapp"></i>
                    <div>
                      <strong>Live Chat</strong>
                      <span>on whatsapp ({settings.whatsapp})</span>
                    </div>
                  </div>
                  }
                </div>
                {/* <button className="btn-primary-faq">
                  Contact Support
                </button> */}
              </div>

              <div className="quick-links-card">
                <h4>Quick Links</h4>
                <div className="quick-links">

                  {!isAuthenticated ? (<Link href="/track-order" className="quick-link">
                    <i className="fas fa-shipping-fast"></i>
                    Track Your Orders
                  </Link>) : <Link href="/track-order" className="quick-link">
                    <i className="fas fa-shipping-fast"></i>
                    Log in to track your order
                  </Link> }
                  <Link href="/returns" className="quick-link">
                    <i className="fa fa-bolts"></i>
                    Check out today's deals
                  </Link>
                  <Link href="/branches" className="quick-link">
                    <i className="fas fa-store"></i>
                    Find a Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default FAQ;