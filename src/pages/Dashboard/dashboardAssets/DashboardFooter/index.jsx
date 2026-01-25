// components/DashboardFooter.jsx
import React from 'react';
import './DashboardFooter.css';

const DashboardFooter = () => {
  return (
    <footer className="dashboard-footer">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-left">
            <div className="copyright">
              <p>© {new Date().getFullYear()} All Rights Reserved</p>
             
            </div>
          </div>
            
       
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;