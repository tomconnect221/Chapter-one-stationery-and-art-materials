import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminTransactions.css';

const AdminTransactions = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Store all transactions for client-side filtering
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  
  // Combined Search state - replaces both filter search and order ID search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states (without search - using unified searchQuery instead)
  const [filters, setFilters] = useState({
    status: '',
    payment_channel: '',
    start_date: '',
    end_date: ''
  });

  // Helper function to get customer info from transaction
  const getCustomerInfo = (transaction) => {
    // Try to get from invoice first
    if (transaction.invoice?.customer_email) {
      return {
        email: transaction.invoice.customer_email,
        name: transaction.invoice.customer_email.split('@')[0] // Use email prefix as name fallback
      };
    }
    // Try to get from gateway_data
    if (transaction.gateway_data?.customer?.email) {
      const customer = transaction.gateway_data.customer;
      return {
        email: customer.email,
        name: customer.first_name || customer.last_name || customer.email.split('@')[0]
      };
    }
    return { email: 'N/A', name: 'N/A' };
  };

  // Client-side filtering with search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery && !filters.status && !filters.payment_channel && !filters.start_date && !filters.end_date) {
      return transactions;
    }

    return transactions.filter(transaction => {
      const customerInfo = getCustomerInfo(transaction);
      
      // Search query filter - searches across multiple fields
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          transaction.transaction_reference?.toLowerCase().includes(query) ||
          transaction.paystack_reference?.toLowerCase().includes(query) ||
          transaction.order?.order_number?.toLowerCase().includes(query) ||
          customerInfo.email?.toLowerCase().includes(query) ||
          customerInfo.name?.toLowerCase().includes(query) ||
          transaction.status?.toLowerCase().includes(query) ||
          transaction.payment_channel?.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && transaction.status?.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }

      // Payment channel filter
      if (filters.payment_channel && transaction.payment_channel?.toLowerCase() !== filters.payment_channel.toLowerCase()) {
        return false;
      }

      // Date filters
      if (filters.start_date) {
        const transactionDate = new Date(transaction.created_at);
        const startDate = new Date(filters.start_date);
        startDate.setHours(0, 0, 0, 0);
        if (transactionDate < startDate) return false;
      }

      if (filters.end_date) {
        const transactionDate = new Date(transaction.created_at);
        const endDate = new Date(filters.end_date);
        endDate.setHours(23, 59, 59, 999);
        if (transactionDate > endDate) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, filters]);

  // View state
  const [viewMode, setViewMode] = useState('list'); // 'list', 'view', 'byOrder'
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [orderIdInput, setOrderIdInput] = useState('');
  const [orderTransactions, setOrderTransactions] = useState([]);

  const fetchTransactions = async (page = 1) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', itemsPerPage);
      if (searchQuery) params.append('search', searchQuery);
      if (filters.status) params.append('status', filters.status);
      if (filters.payment_channel) params.append('payment_channel', filters.payment_channel);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      console.log('Fetching transactions with params:', params.toString());
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/transactions?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTransactions(response.data.data.data || []);
        setAllTransactions(response.data.data.data || []);
        console.log('admin transactions response:', response.data); 
        setPagination(response.data.data);
        setCurrentPage(page);
        setTotalCount(response.data.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [token, itemsPerPage]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchTransactions(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      status: '',
      payment_channel: '',
      start_date: '',
      end_date: ''
    });
    fetchTransactions(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination?.last_page || 1)) {
      fetchTransactions(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    fetchTransactions(1);
  };

  const fetchTransactionById = async (transactionId) => {
    if (!token || !transactionId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/transactions/${transactionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedTransaction(response.data.data);
        setViewMode('view');
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast.error('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionsByOrderId = async (orderId) => {
    if (!token || !orderId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/transactions/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setOrderTransactions(response.data.data || []);
        setViewMode('byOrder');
      }
    } catch (error) {
      console.error('Error fetching order transactions:', error);
      toast.error('Failed to load order transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setViewMode('view');
  };

  const handleBackToList = () => {
    setSelectedTransaction(null);
    setOrderTransactions([]);
    setViewMode('list');
  };

  const handleSearchByOrderId = () => {
    if (orderIdInput.trim()) {
      fetchTransactionsByOrderId(orderIdInput.trim());
    }
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'paid':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'pending':
      case 'processing':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'failed':
      case 'cancelled':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  const getPaginationButtons = () => {
    const totalPages = pagination?.last_page || 1;
    const buttons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => handlePageChange(1)} className="page-btn">1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis" className="page-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)} 
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis" className="page-ellipsis">...</span>);
      }
      buttons.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="page-btn">{totalPages}</button>
      );
    }

    return buttons;
  };

  // Render single transaction view
  if (viewMode === 'view' && selectedTransaction) {
    return (
      <TransactionDetail 
        transaction={selectedTransaction} 
        onBack={handleBackToList}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
      />
    );
  }

  // Render transactions by order view
  if (viewMode === 'byOrder') {
    return (
      <OrderTransactions 
        transactions={orderTransactions}
        orderId={orderIdInput}
        onBack={handleBackToList}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        loading={loading}
      />
    );
  }

  return (
    <div className="transactions-container">
      {/* Header */}
      <div className="transactions-header">
        <div>
          <h1 className="page-title">💳 Transactions</h1>
          <p className="page-subtitle">View and manage all payment transactions</p>
        </div>
        <div className="header-actions">
          <button onClick={() => fetchTransactions()} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Search by Order ID */}
      {/* <div className="order-search-section">
        <h3>Search by Order ID</h3>
        <div className="order-search-box">
          <input
            type="text"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            placeholder="Enter Order ID (e.g., 019a0fdb-3dcc-71e1-8e53-cdb1fc2f74db)"
            className="order-search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearchByOrderId()}
          />
          <button onClick={handleSearchByOrderId} className="btn-search">
            Search
          </button>
        </div>
      </div> */}

      {/* Unified Search & Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search (Transaction Ref / Order No. / Customer Email)</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by transaction ref, order number, customer email..."
              className="filter-input"
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-input"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Payment Channel</label>
            <select
              value={filters.payment_channel}
              onChange={(e) => handleFilterChange('payment_channel', e.target.value)}
              className="filter-input"
            >
              <option value="">All Channels</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="ussd">USSD</option>
              <option value="qr">QR</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
        {/* <div className="filter-action mt-4">
          <button onClick={handleApplyFilters} className="btn-apply" disabled={loading}>
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
          <button onClick={handleResetFilters} className="btn-reset">
            Reset
          </button>
        </div> */}
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading transactions...</p>
        </div>
      ) : (
        <>
          <div className="table-section">
            <div className="table-header">
              <h2>All Transactions ({pagination?.total || 0})</h2>
              <div className="items-per-page">
                <label>Show:</label>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="per-page-select">
                  <option value="15">15</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <label>entries</label>
              </div>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction Ref</th>
                    <th>Order</th>
                    <th>Customer Name</th>
                    <th>Customer Email</th>
                    <th>Amount</th>
                    <th>Fee</th>
                    <th>Net Amount</th>
                    <th>Status</th>
                    <th>Channel</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {console.log(transactions)}
                  {(searchQuery || filters.status || filters.payment_channel || filters.start_date || filters.end_date ? filteredTransactions : transactions).map((transaction) => {
                    const statusStyle = getStatusColor(transaction.status);
                    const customerInfo = getCustomerInfo(transaction);
                    return (
                      <tr key={transaction.id}>
                        <td>
                          <div className="transaction-ref">
                            <span className="ref-badge">{transaction.transaction_reference}</span>
                            {transaction.paystack_reference && (
                              <span className="paystack-ref">{transaction.paystack_reference}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {transaction.order ? (
                            <span className="order-number">{transaction.order.order_number}</span>
                          ) : (
                            <span className="no-order">N/A</span>
                          )}
                        </td>
                        <td className="customer-name">{customerInfo.name}</td>
                        <td className="customer-email">{customerInfo.email}</td>
                        <td className="amount">{formatCurrency(transaction.amount)}</td>
                        <td className="fee">{formatCurrency(transaction.fee)}</td>
                        <td className="net-amount">{formatCurrency(transaction.net_amount)}</td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td>
                          <span className="channel-badge">
                            {transaction.payment_channel || 'N/A'}
                          </span>
                        </td>
                        <td className="date">{formatDate(transaction.created_at)}</td>
                        <td>
                          <button 
                            onClick={() => handleViewTransaction(transaction)}
                            className="btn-view"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {transactions.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <h3>No Transactions Found</h3>
                <p>No transactions match your current filters</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {pagination.from} to {pagination.to} of {pagination.total} entries
              </div>
              <div className="pagination-controls">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  className="page-btn nav-btn"
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                {getPaginationButtons()}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  className="page-btn nav-btn"
                  disabled={currentPage === pagination.last_page}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Transaction Detail Component
const TransactionDetail = ({ transaction, onBack, formatCurrency, formatDate, getStatusColor }) => {
  const statusStyle = getStatusColor(transaction.status);
  
  return (
    <div className="transaction-detail-container">
      <div className="detail-header">
        <button onClick={onBack} className="btn-back">← Back to List</button>
        <h1>Transaction Details</h1>
      </div>

      <div className="detail-grid">
        {/* Main Info Card */}
        <div className="detail-card">
          <h3>Transaction Information</h3>
          <div className="detail-row">
            <span className="label">Transaction Reference</span>
            <span className="value">{transaction.transaction_reference}</span>
          </div>
          <div className="detail-row">
            <span className="label">Paystack Reference</span>
            <span className="value">{transaction.paystack_reference || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Type</span>
            <span className="value">{transaction.type}</span>
          </div>
          <div className="detail-row">
            <span className="label">Status</span>
            <span 
              className="status-badge"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
            >
              {transaction.status}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Amount</span>
            <span className="value amount">{formatCurrency(transaction.amount)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Fee</span>
            <span className="value">{formatCurrency(transaction.fee)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Net Amount</span>
            <span className="value net-amount">{transaction.net_amount}</span>
          </div>
          <div className="detail-row">
            <span className="label">Currency</span>
            <span className="value">{transaction.currency}</span>
          </div>
          <div className="detail-row">
            <span className="label">Payment Channel</span>
            <span className="value">{transaction.payment_channel || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Payment Method</span>
            <span className="value">{transaction.payment_method || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Gateway Response</span>
            <span className="value">{transaction.gateway_response || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Initiated By</span>
            <span className="value">{transaction.initiated_by || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Description</span>
            <span className="value">{transaction.description || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Created At</span>
            <span className="value">{formatDate(transaction.created_at)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Processed At</span>
            <span className="value">{formatDate(transaction.processed_at)}</span>
          </div>
        </div>

        {/* Order Info Card */}
        {transaction.order && (
          <div className="detail-card">
            <h3>Order Information</h3>
            <div className="detail-row">
              <span className="label">Order Number</span>
              <span className="value">{transaction.order.order_number}</span>
            </div>
            <div className="detail-row">
              <span className="label">Subtotal</span>
              <span className="value">{formatCurrency(transaction.order.subtotal)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Tax Amount</span>
              <span className="value">{formatCurrency(transaction.order.tax_amount)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Delivery Fee</span>
              <span className="value">{formatCurrency(transaction.order.delivery_fee)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Total Amount</span>
              <span className="value amount">{formatCurrency(transaction.order.total_amount)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Order Status</span>
              <span className="value">{transaction.order.status}</span>
            </div>
            <div className="detail-row">
              <span className="label">Payment Status</span>
              <span className="value">{transaction.order.payment_status}</span>
            </div>
            <div className="detail-row">
              <span className="label">Delivery Address</span>
              <span className="value">{transaction.order.delivery_address}</span>
            </div>
            <div className="detail-row">
              <span className="label">Delivery Phone</span>
              <span className="value">{transaction.order.delivery_phone}</span>
            </div>
          </div>
        )}

        {/* Invoice Info Card */}
        {transaction.invoice && (
          <div className="detail-card">
            <h3>Invoice Information</h3>
            <div className="detail-row">
              <span className="label">Invoice Number</span>
              <span className="value">{transaction.invoice.invoice_number}</span>
            </div>
            <div className="detail-row">
              <span className="label">Amount</span>
              <span className="value">{formatCurrency(transaction.invoice.amount)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status</span>
              <span className="value">{transaction.invoice.status}</span>
            </div>
            <div className="detail-row">
              <span className="label">Customer Email</span>
              <span className="value">{transaction.invoice.customer_email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Customer Phone</span>
              <span className="value">{transaction.invoice.customer_phone || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Gateway Data Card */}
        {transaction.gateway_data && (
          <div className="detail-card full-width">
            <h3>Gateway Data</h3>
            <div className="gateway-data">
              <div className="detail-row">
                <span className="label">Gateway ID</span>
                <span className="value">{transaction.gateway_data.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Domain</span>
                <span className="value">{transaction.gateway_data.domain}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status</span>
                <span className="value">{transaction.gateway_data.status}</span>
              </div>
              <div className="detail-row">
                <span className="label">Message</span>
                <span className="value">{transaction.gateway_data.message}</span>
              </div>
              <div className="detail-row">
                <span className="label">Channel</span>
                <span className="value">{transaction.gateway_data.channel}</span>
              </div>
              <div className="detail-row">
                <span className="label">Currency</span>
                <span className="value">{transaction.gateway_data.currency}</span>
              </div>
              <div className="detail-row">
                <span className="label">IP Address</span>
                <span className="value">{transaction.gateway_data.ip_address}</span>
              </div>
              <div className="detail-row">
                <span className="label">Paid At</span>
                <span className="value">{formatDate(transaction.gateway_data.paid_at)}</span>
              </div>
              
              {transaction.gateway_data.authorization && (
                <>
                  <h4>Authorization</h4>
                  <div className="detail-row">
                    <span className="label">Authorization Code</span>
                    <span className="value">{transaction.gateway_data.authorization.authorization_code}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Bank</span>
                    <span className="value">{transaction.gateway_data.authorization.bank}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Card Type</span>
                    <span className="value">{transaction.gateway_data.authorization.card_type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Last 4</span>
                    <span className="value">{transaction.gateway_data.authorization.last4}</span>
                  </div>
                </>
              )}

              {transaction.gateway_data.customer && (
                <>
                  <h4>Customer</h4>
                  <div className="detail-row">
                    <span className="label">Email</span>
                    <span className="value">{transaction.gateway_data.customer.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Customer Code</span>
                    <span className="value">{transaction.gateway_data.customer.customer_code}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Order Transactions Component
const OrderTransactions = ({ transactions, orderId, onBack, formatCurrency, formatDate, getStatusColor, loading }) => {
  return (
    <div className="order-transactions-container">
      <div className="detail-header">
        <button onClick={onBack} className="btn-back">← Back to List</button>
        <h1>Transactions for Order</h1>
        <p className="order-id-display">{orderId}</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading order transactions...</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="order-transactions-list">
          {transactions.map((transaction) => {
            const statusStyle = getStatusColor(transaction.status);
            return (
              <div key={transaction.id} className="transaction-card">
                <div className="card-header">
                  <div className="transaction-ref">
                    <span className="ref-badge large">{transaction.transaction_reference}</span>
                    {transaction.paystack_reference && (
                      <span className="paystack-ref">{transaction.paystack_reference}</span>
                    )}
                  </div>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                  >
                    {transaction.status}
                  </span>
                </div>
                <div className="card-body">
                  <div className="amount-row">
                    <div className="amount-item">
                      <span className="label">Amount</span>
                      <span className="value amount">{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="label">Fee</span>
                      <span className="value">{formatCurrency(transaction.fee)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="label">Net Amount</span>
                      <span className="value net-amount">{formatCurrency(transaction.net_amount)}</span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment Channel</span>
                    <span className="value">{transaction.payment_channel || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Gateway Response</span>
                    <span className="value">{transaction.gateway_response || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Created At</span>
                    <span className="value">{formatDate(transaction.created_at)}</span>
                  </div>
                  {transaction.description && (
                    <div className="detail-row">
                      <span className="label">Description</span>
                      <span className="value">{transaction.description}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Transactions Found</h3>
          <p>No transactions found for this order ID</p>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;
