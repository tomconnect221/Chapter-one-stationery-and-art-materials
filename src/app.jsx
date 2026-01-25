import React from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./pages/customerPage/customer-Assets/navbar/index";
import Homepage from "./pages/customerPage/homepage";
import Wishlist from "./pages/customerPage/customer-Wishlist";
import Shop from "./pages/customerPage/Shop";
import ProductDetail from "./pages/customerPage/ProductDetail";
import Cart from "./pages/customerPage/Cart";
import Checkout from "./pages/customerPage/Checkout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AdminLogin from "./pages/Auth/AdminLogin";
import AdminForgotPassword from "./pages/Auth/AdminForgotPassword";
import AuthModal from "./component/Auth/AuthModal";
import { useAuth } from "./component/Auth/AuthContext";
import NotFound from "./pages/NotFound";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import AccountDetails from './pages/customerPage/Account/AccountDetails';
import CustomerAccount from './pages/customerPage/Account';
import Orders from './pages/customerPage/Account/Orders';
import OrderLayout from './pages/customerPage/Account/Orders/OrderLayout';
import OrderDetails from './pages/customerPage/Account/Orders/OrdersDetails';
import AccountAddressLayout from './pages/customerPage/Account/AccountAddress/AccountAddressLayout';
import AccountAddress from './pages/customerPage/Account/AccountAddress';
import AccountWishlistLayout from './pages/customerPage/Account/AccountWishlist/AccountWishlistLayout';
import AccountWishlist from './pages/customerPage/Account/AccountWishlist';
import AccountInvoice from './pages/customerPage/Account/AccountInvoice';
import AccountInvoiceLayout from './pages/customerPage/Account/AccountInvoice/AccountInvoiceLayout';
import AccountInvoiceView from './pages/customerPage/Account/AccountInvoice/AccountInvoiceView';
import Branches from './pages/customerPage/Branches';
import AdminDashboard from './pages/Dashboard/adminpage';
import DispatchDashboard from './pages/Dashboard/riderPage';
import ProtectedRoute from './components/ProtectedRoute';
import AboutUs from './pages/customerPage/About_us';
import FAQ from './pages/customerPage/store_faq';
import PaymentConfirmation from './pages/customerPage/Checkout/PaymentConfirmation';
import PopupAd from './component/customer-components/ads/popup';
// import PopupAd from './components/PopupAd'; // Import the PopupAd component

// Protected Route Component for Customer Routes
const CustomerProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Component to conditionally render Navbar and PopupAd
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const { openAuth } = useAuth();

  const shouldShowNavbar = () => {
    const path = location.pathname;
    return !path.startsWith('/admin') && !path.startsWith('/dispatch');
  };

  const shouldShowPopupAd = () => {
    const path = location.pathname;
    // Show popup ads on all routes EXCEPT:
    // - Dashboard routes (/admin/*, /dispatch/*)
    // - Account routes (/account/*)
    // - Auth routes that are not customer-facing? (optional - you can adjust)
    return !path.startsWith('/admin') && 
           !path.startsWith('/dispatch') && 
           !path.startsWith('/account');
  };

  return (
    <>
      {shouldShowNavbar() && <Navbar onOpenAuth={openAuth} />}
      {children}
      {/* Conditionally render PopupAd based on route */}
      {shouldShowPopupAd() && <PopupAd />}
    </>
  );
};

/**
 * Main App Component
 * Handles routing and authentication modal management
 */
export function App() {
  const { authModal, openAuth, closeAuth, user, isAuthenticated } = useAuth();

  return (
    <div className="wrapper ovh" style={{ fontFamily: "Inter, sans-serif" }}>
      <LayoutWrapper>
        <Routes>
          {/* Customer Routes - WITH Navbar and PopupAd */}
          <Route path="/" element={<Homepage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* Protected Checkout Routes - Only for authenticated users */}
          <Route 
            path="/checkout" 
            element={
              <CustomerProtectedRoute>
                <Checkout />
              </CustomerProtectedRoute>
            } 
          />
          <Route 
            path="/payment-confirmation" 
            element={
              <CustomerProtectedRoute>
                <PaymentConfirmation />
              </CustomerProtectedRoute>
            } 
          />
          
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/faq" element={<FAQ />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

          {/* Account Routes - WITH Navbar but NO PopupAd */}
          <Route path="/account" element={<CustomerAccount />}>
            <Route index element={<AccountDetails />} />
            <Route path="orders" element={<OrderLayout />}>
              <Route index element={<Orders />} />
              <Route path="/account/orders/:orderId" element={<OrderDetails />} />
            </Route>
            <Route path="address" element={<AccountAddressLayout />}>
              <Route index element={<AccountAddress />} />
            </Route>
            <Route path="wishlist" element={<AccountWishlistLayout />}>
              <Route index element={<AccountWishlist />} />
            </Route>
            <Route path="invoices" element={<AccountInvoiceLayout />}>
              <Route index element={<AccountInvoice />} />
              <Route path=":invoiceId" element={<AccountInvoiceView />} />
            </Route>
          </Route>

          {/* Dashboard Routes - WITHOUT Navbar and WITHOUT PopupAd */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dispatch/*" element={
            <ProtectedRoute allowedRoles={['rider', 'dispatch']}>
              <DispatchDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback routes - WITH Navbar and PopupAd */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LayoutWrapper>

      {/* Authentication Modal - Only render when needed */}
      {authModal.show && (
        <AuthModal
          show={authModal.show}
          onClose={closeAuth}
          initialView={authModal.view}
        />
      )}
    </div>
  );
}