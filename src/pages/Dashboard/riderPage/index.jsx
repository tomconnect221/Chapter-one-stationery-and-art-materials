// pages/Dashboard/dispatchpage/dashboard.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../DashboardLayout';
import DispatchMainDashboard from './RiderDashboard';
import DispatchDeliveries from './RiderDeliveries';
import DeliveryDetails from './RiderDeliveries/DeliveryDetails';
import ProfileSettings from '../../../components/ProfileSettings';

const DispatchDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const userType = user?.role || 'rider';

  return (
    <DashboardLayout userType={userType}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DispatchMainDashboard />} />
        <Route path="deliveries" element={<DispatchDeliveries />} />
        <Route path="deliveries/:orderId" element={<DeliveryDetails />} />
  <Route path="profile" element={<ProfileSettings userType="dispatch" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DispatchDashboard;