import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../AdminProducts/AdminProducts.css';
import OrderDetails from './OrderDetails';
import { useSelector } from 'react-redux';
import './AdminOrderStyling.css';
import { toast } from 'react-toastify';
import useCategories from '../../hooks/useCategories';

const AdminOrders = ({ userType = 'admin', userBranch = null }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const base_url = import.meta.env.VITE_API_URL;
  const { token } = useSelector((state) => state.auth);

  
  const [riders, setRiders] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');

  // New filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterSKU, setFilterSKU] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, total_desc, total_asc
  const [products, setProducts] = useState([]);
  const [skus, setSkus] = useState([]);

  const { categories } = useCategories();

  useEffect(() => {
    fetchOrders();
  }, [userType, token]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterBranch, startDate, endDate, filterCategory, filterProduct, filterSKU, sortBy]);

  // Fetch products and SKUs for filter options
  useEffect(() => {
    fetchProductsAndSKUs();
  }, [token]);

  const fetchProductsAndSKUs = async () => {
    try {
      const endpoint = userType === 'admin'
        ? `${base_url}/api/admin/products`
        : `${base_url}/api/subadmin/products`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 1000 } // Get all products for filter options
      });

      if (response.data.success) {
        const productList = response.data.data.data || [];
        setProducts(productList);

        // Extract unique SKUs
        const uniqueSKUs = [...new Set(productList.map(p => p.sku).filter(Boolean))];
        setSkus(uniqueSKUs);
      }
    } catch (err) {
      console.error('Failed to fetch products and SKUs:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const endpoint = userType === 'admin'
        ? `${base_url}/api/admin/orders`
        : `${base_url}/api/subadmin/orders`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const formattedOrders = response.data.data.data.map(order => ({
          id: order.id,
          order_number: order.order_number,
          customer: order.customer.name,
          items: order.order_items.length,
          total: parseFloat(order.total_amount) * 100,
          branch: userBranch,
          rider: order.rider ? order.rider.name : 'Unassigned',
          riderId: order.rider_id,
          status: order.status,
          paymentStatus: order.payment_status,
          createdAt: order.created_at,
          address: order.delivery_address,
          order_items: order.order_items // Include order items for filtering
        }));
        setOrders(formattedOrders);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const branches = ['Lagos Main', 'Abuja Branch', 'Port Harcourt', 'Kano Branch'];
  const canEdit = userType === 'admin' || userType === 'subadmin' ;

  const fetchRiders = async () => {
    try {
      const endpoint = userType === 'admin'
        ? `${base_url}/api/admin/riders`
        : `${base_url}/api/subadmin/available-riders`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRiders(response.data.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch riders');
    }
  };
  const handleAssignRider = (order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
    fetchRiders();
  };
  const handleViewDetails = async (order) => {
    setViewLoading(true);
    setSelectedOrder(order);
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setViewLoading(false);
      setShowDetailsModal(true);
    }, 800);
  };
  const handleRiderAssignment = async (riderId) => {
    setStatusLoading(true);
    try {
      const endpoint = userType === 'admin'
        ? `${base_url}/api/admin/orders/${selectedOrder.id}/assign-rider`
        : `${base_url}/api/subadmin/orders/${selectedOrder.id}/assign-rider`;

      const formData = new URLSearchParams();
      formData.append('rider_id', riderId);

      const response = await axios.post(endpoint, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Rider assigned successfully');
        
        // Find the assigned rider name from the riders list
        const assignedRider = riders.find(rider => rider.id === riderId);
        const riderName = assignedRider ? assignedRider.name : 'Assigned';
        
        // Update the order in local state immediately
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrder.id 
              ? { ...order, rider: riderName, riderId: riderId }
              : order
          )
        );
        
        setShowAssignModal(false);
      } else {
        toast.error(response.data.message || 'Failed to assign rider');
      }
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          toast.error(`${errorData.message}: ${errorMessages}`);
        } else {
          toast.error(errorData.message || 'Failed to assign rider');
        }
      } else {
        toast.error(err.message || 'An unexpected error occurred');
      }
    } finally {
      setStatusLoading(false);
    }
  };
  const handleStatusChange = async (orderId, newStatus) => {
    setStatusLoading(true);
    try {
      const endpoint = userType === 'admin'
        ? `${base_url}/api/admin/orders/${orderId}/status`
        : `${base_url}/api/subadmin/orders/${orderId}/status`;

      const formData = new URLSearchParams();
      formData.append('status', newStatus);

      const response = await axios.put(endpoint, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Order status updated successfully');
        
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: response.data.data.status, paymentStatus: response.data.data.payment_status }
              : order
          )
        );
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }

    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(', ');
          toast.error(`${errorData.message}: ${errorMessages}`);
        } else {
          toast.error(errorData.message || 'Failed to update order status');
        }
      } else if (err.request) {
        toast.error('Network error: Unable to connect to server');
      } else {
        toast.error(err.message || 'An unexpected error occurred');
      }
    } finally {
      setStatusLoading(false);
    }
  };
  // Enhanced filtering and sorting logic
  const filteredOrders = orders
    .filter(order => {
      // Basic filters
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesBranch = filterBranch === 'all' || order.branch === filterBranch;
      const matchesUserBranch = !userBranch || order.branch === userBranch;

      // Date range filter
      const orderDate = new Date(order.createdAt);
      const matchesStartDate = !startDate || orderDate >= new Date(startDate);
      const matchesEndDate = !endDate || orderDate <= new Date(endDate + 'T23:59:59');

      // Category, Product, SKU filters
      let matchesCategory = filterCategory === 'all';
      let matchesProduct = filterProduct === 'all';
      let matchesSKU = filterSKU === 'all';

      if (order.order_items && order.order_items.length > 0) {
        // Check if any item in the order matches the filters
        const categoryMatch = order.order_items.some(item =>
          item.product && item.product.category_id === filterCategory
        );
        const productMatch = order.order_items.some(item =>
          item.product && item.product.id === filterProduct
        );
        const skuMatch = order.order_items.some(item =>
          item.product && item.product.sku === filterSKU
        );

        matchesCategory = filterCategory === 'all' || categoryMatch;
        matchesProduct = filterProduct === 'all' || productMatch;
        matchesSKU = filterSKU === 'all' || skuMatch;
      }

      return matchesSearch && matchesStatus && matchesBranch && matchesUserBranch &&
             matchesStartDate && matchesEndDate && matchesCategory && matchesProduct && matchesSKU;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'total_desc':
          return b.total - a.total;
        case 'total_asc':
          return a.total - b.total;
        default:
          return 0;
      }
    });
  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatPrice = (price) => {
    return `₦${(price / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-badge',
      confirmed: 'status-badge active',
      processing: 'status-badge active',
      shipped: 'status-badge active',
      delivered: 'status-badge active',
      cancelled: 'status-badge inactive'
    };
    return colors[status] || 'status-badge';
  };

  return (
    <div className="admin-products">
      <div className="products-header">
        <div>
          <h1>Orders Management</h1>
          <p>Manage orders and assign to riders</p>
        </div>
      </div>



      <div className="stats-grid">
        <div className="stat-card d-flex justify-content-between">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-label">Total Orders ({orders.length})</div>
          </div>
        </div>
        <div className="stat-card d-flex justify-content-between">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-label">Pending ({orders.filter(o => o.status === 'pending').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex justify-content-between">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <div className="stat-label">Shipped ({orders.filter(o => o.status === 'shipped').length})</div>
          </div>
        </div>
        <div className="stat-card d-flex justify-content-between">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">Delivered ({orders.filter(o => o.status === 'delivered').length})</div>
          </div>
        </div>
      </div>

      <div className="filters-section" style={{ marginBottom: '20px' }}>
        {/* First row: Search and basic filters */}
        <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #dee2e6', borderRadius: '4px', minWidth: '200px' }}
            />
          </div>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready_for_delivery">Ready for Delivery</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {userType === 'admin' && (
            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #dee2e6', borderRadius: '4px' }}>
              <option value="all">All Branches</option>
              {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
            </select>
          )}

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #dee2e6', borderRadius: '4px' }}>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="total_desc">Highest Total</option>
            <option value="total_asc">Lowest Total</option>
          </select>
        </div>

        {/* Second row: Advanced filters */}
        <div className="d-flex justify-content-start align-items-center" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="d-flex align-items-center gap-2">
            <label style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>Date Range:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '6px 8px', border: '1px solid #dee2e6', borderRadius: '4px', fontSize: '14px' }}
            />
            <span style={{ fontSize: '14px', color: '#6c757d' }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '6px 8px', border: '1px solid #dee2e6', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>

          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '6px 8px', border: '1px solid #dee2e6', borderRadius: '4px', fontSize: '14px', minWidth: '120px' }}>
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} style={{ padding: '6px 8px', border: '1px solid #dee2e6', borderRadius: '4px', fontSize: '14px', minWidth: '120px' }}>
            <option value="all">All Products</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>

          <select value={filterSKU} onChange={(e) => setFilterSKU(e.target.value)} style={{ padding: '6px 8px', border: '1px solid #dee2e6', borderRadius: '4px', fontSize: '14px', minWidth: '120px' }}>
            <option value="all">All SKUs</option>
            {skus.map(sku => (
              <option key={sku} value={sku}>{sku}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setFilterCategory('all');
              setFilterProduct('all');
              setFilterSKU('all');
              setSortBy('date_desc');
              setSearchTerm('');
              setFilterStatus('all');
              setFilterBranch('all');
            }}
            style={{
              padding: '6px 12px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center" style={{ padding: '40px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="table-container" style={{ width: '100%', overflowX: 'auto' }}>
        <table className="products-table" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Branch</th>
              <th>Rider</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map(order => (
              <tr key={order.id}>
                <td data-label="Order ID"><strong>{order.order_number}</strong></td>
                <td data-label="Customer">{order.customer}</td>
                <td data-label="Items">{order.items}</td>
                <td data-label="Total" className="price">{formatPrice(order.total)}</td>
                <td data-label="Branch">{order.branch}</td>
                <td data-label="Rider" className="bg-dange">
                 <span > 

                   {order.rider === 'Unassigned' ? (
                    <span style={{ color: '#6c757d', fontStyle: 'italic' }}>Unassigned</span>
                  ) : (
                    <span className="status-badge badge badge-success active w-100" style={{ width:'100%'}}>{order.rider}</span>
                  )}
                 </span>
                </td>
                <td data-label="Status">
                  {canEdit ? (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready_for_delivery">Ready for Delivery</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={getStatusColor(order.status)}>
                      {order.status}
                    </span>
                  )}
                </td>
                <td data-label="Payment">
                  <span className={`status-badge ${order.paymentStatus === 'paid' ? 'active' : 'inactive'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td data-label="Actions">
                  <div className="action-button d-flex gap-8 justify-content-center">
                    <button className="btn-icon" onClick={() => handleViewDetails(order)} title="View" style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '4px 8px' }}>
                      👁️
                    </button>
                    {canEdit && order.rider === 'Unassigned' && (
                      <button className="btn-icon" onClick={() => handleAssignRider(order)} title="Assign Rider" style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '4px 8px' }}>
                        🚚
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            style={{ padding: '8px 12px', border: '1px solid #dee2e6', borderRadius: '4px', background: currentPage === 1 ? '#f8f9fa' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  background: currentPage === pageNumber ? '#007bff' : '#fff',
                  color: currentPage === pageNumber ? '#fff' : '#000',
                  cursor: 'pointer'
                }}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            style={{ padding: '8px 12px', border: '1px solid #dee2e6', borderRadius: '4px', background: currentPage === totalPages ? '#f8f9fa' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
          
          <span style={{ marginLeft: '15px', fontSize: '14px', color: '#6c757d' }}>
            Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
          </span>
        </div>
      )}

      {/* Status Loading Popup */}
      {statusLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="spinner-border" role="status" style={{ marginBottom: '15px' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', color: '#333' }}>Updating order status...</p>
          </div>
        </div>
      )}

      {/* View Order Loading Popup */}
      {viewLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="spinner-border" role="status" style={{ marginBottom: '15px' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ margin: 0, fontSize: '16px', color: '#333' }}>Loading order details...</p>
          </div>
        </div>
      )}

      {showAssignModal && (
        <AssignRiderModal
          order={selectedOrder}
          riders={riders.filter(r => r.status === 'available')}
          onAssign={handleRiderAssignment}
          onClose={() => setShowAssignModal(false)}
        />
      )}

      {showDetailsModal && selectedOrder && (
        <OrderDetails
          orderId={selectedOrder.id}
          userType={userType}
          token={token}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

const AssignRiderModal = ({ order, riders, onAssign, onClose }) => {
  const [selectedRider, setSelectedRider] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '500px', width: '90%', padding: '20px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Assign Rider to {order.order_number}</h2>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', float: 'right' }}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-field">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Select Rider *</label>
            <select
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #dee2e6', borderRadius: '4px' }}
            >
              <option value="">Choose a rider...</option>
              {riders.map(rider => (
                <option key={rider.id} value={rider.id}>
                  {rider.name} - {rider.phone} ({rider.vehicle_type})
                </option>
              ))}
            </select>
          </div>
          {riders.length === 0 && (
            <p style={{ color: '#6c757d', fontSize: '14px', margin: '10px 0' }}>
              No available riders at the moment. All riders are currently busy.
            </p>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6', paddingTop: '15px', marginTop: '20px', textAlign: 'right' }}>
          <button className="btn btn-warning" onClick={onClose} style={{ marginRight: '10px', padding: '8px 16px', border: '1px solid #dee2e6', borderRadius: '4px',cursor: 'pointer' }}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => onAssign(selectedRider)}
            disabled={!selectedRider}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: selectedRider ? '#007bff' : '#6c757d', color: '#fff', cursor: selectedRider ? 'pointer' : 'not-allowed' }}
          >
            Assign Rider
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;