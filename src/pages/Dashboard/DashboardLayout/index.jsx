// components/DashboardLayout.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardNavbar from '../dashboardAssets/DashboardNavbar';
import DashboardSidebar from '../dashboardAssets/DashboardSidebar';
import './DashboardLayout.css';

const DashboardLayout = ({  children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Get user type from Redux store
  const { user } = useSelector(state => state.auth);
  const userType = user?.role || 'admin'; // Default to admin if no role
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };
  return (
    <div className="dashboard-layout">
      <DashboardNavbar
        userType={userType}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onToggleMobileSidebar={toggleMobileSidebar}
      />

      <div className="dashboard-content-wrapper">
        <DashboardSidebar
          userType={userType}
          isOpen={sidebarOpen}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className={`dashboard-main ${!sidebarOpen ? 'expanded' : ''}`}>
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;