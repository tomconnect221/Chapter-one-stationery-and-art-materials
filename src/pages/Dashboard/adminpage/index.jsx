// pages/Dashboard/adminpage/dashboard.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../DashboardLayout';
import AdminMainDashboard from './dashboard';
import ProfileSettings from '../../../components/ProfileSettings';
import AdminProducts from '../../../components/AdminProducts';
import AdminOrders from '../../../components/AdminOrders';
import AdminCustomers from '../../../components/AdminCustomers';
import AdminCategories from '../../../components/AdminCategories';
// import AdminBrands from '../../../components/AdminBrands';
import AdminBranches from '../../../components/AdminBranches';
import AdminSubAdmins from '../../../components/AdminSubAdmins';
import AdminInventory from '../../../components/AdminInventory';
import SingleInventoryView from '../../../components/AdminInventory/SingleInventoryView';
import AdminRiders from '../../../components/AdminRiders';
import AdminSettings from '../../../components/AdminSettings';

const AdminDashboard = () => {  
  const { user } = useSelector(state => state.auth);
  const userType = user?.role || 'admin';
  const userBranch = user?.branch || null; // Assuming branch might be in user data

  return (
    <DashboardLayout userType={userType}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminMainDashboard />} />
        <Route path="profile" element={<ProfileSettings userType={userType} />} />
        <Route path="products" element={<AdminProducts userType={userType} userBranch={userBranch} />} />
        <Route path="orders" element={<AdminOrders userType={userType} userBranch={userBranch} />} />
        <Route path="customers" element={<AdminCustomers userType={userType} />} />
        <Route path="categories" element={<AdminCategories userType={userType} />} />
        {/* <Route path="brands" element={<AdminBrands userType={userType} />} /> */}
        <Route path="categories" element={<AdminCategories userType={userType} />} />
        <Route path="branches" element={<AdminBranches userType={userType} userBranch={userBranch} />} />
        <Route path="subadmins" element={<AdminSubAdmins userType={userType} />} />
        <Route path="inventory" element={<AdminInventory userType={userType} userBranch={userBranch} />} />
        <Route path="inventory/:id" element={<SingleInventoryView userType={userType} userBranch={userBranch} />} />
        <Route path="riders" element={<AdminRiders userType={userType} userBranch={userBranch} />} />
        <Route path="settings" element={<AdminSettings userType={userType} />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;