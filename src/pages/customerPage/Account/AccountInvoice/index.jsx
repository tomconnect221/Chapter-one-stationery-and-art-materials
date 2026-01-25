import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './AccountInvoice.css';

const AccountInvoice = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch invoices from API
  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/invoices?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const invoicesData = response.data.data.data.map(invoice => ({
          id: invoice.invoice_number,
          invoiceId: invoice.id,
          orderId: invoice.order?.order_number || 'N/A',
          date: invoice.created_at,
          dueDate: invoice.expires_at,
          status: invoice.status,
          amount: parseFloat(invoice.amount) * 100,
          paymentMethod: invoice.payment_channel || 'N/A',
          paymentDate: invoice.paid_at,
          customer: {
            name: invoice.paystack_response?.customer?.first_name + ' ' + invoice.paystack_response?.customer?.last_name || 'N/A',
            email: invoice.customer_email,
            phone: invoice.customer_phone || 'N/A',
            address: invoice.customer_address || 'N/A'
          },
          items: invoice.paystack_response?.metadata?.items || [],
          shippingFee: parseFloat(invoice.paystack_response?.metadata?.delivery_fee || 0) * 100,
          tax: parseFloat(invoice.paystack_response?.metadata?.tax_amount || 0) * 100,
          discount: 0
        }));
        
        setInvoices(invoicesData);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          total: response.data.data.total
        });
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInvoices();
    }
  }, [token]);

  const statusFilters = [
    { value: 'all', label: 'All Invoices', count: pagination.total },
    { value: 'paid', label: 'Paid', count: invoices.filter(inv => inv.status === 'paid').length },
    { value: 'overdue', label: 'Overdue', count: invoices.filter(inv => inv.status === 'overdue').length },
    { value: 'refunded', label: 'Refunded', count: invoices.filter(inv => inv.status === 'refunded').length }
  ];

  const formatPrice = (price) => {
    return `₦${(price / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { label: 'Paid', class: 'status-paid', icon: '✓' },
      overdue: { label: 'Overdue', class: 'status-overdue', icon: '⏰' },
      refunded: { label: 'Refunded', class: 'status-refunded', icon: '↻' }
    };

    const config = statusConfig[status] || { label: status, class: 'status-default', icon: '📄' };

    return (
      <span className={`status-badge d-flex align-items-center ${config.class}`}>
        <span className="">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = (invoice) => {
    alert(`Downloading invoice ${invoice.id} as PDF...`);
  };

  const handlePrintInvoice = (invoice) => {
    alert(`Printing invoice ${invoice.id}...`);
  };

  const handleShareInvoice = (invoice) => {
    alert(`Sharing invoice ${invoice.id}...`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchInvoices(page);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getTotalAmount = () => {
    return invoices.reduce((total, invoice) => total + invoice.amount, 0);
  };

  // Pagination component
  const Pagination = () => {
    const { current_page, last_page } = pagination;
    
    if (last_page <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(last_page, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${current_page === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageChange(current_page - 1)}
        disabled={current_page === 1}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`pagination-btn ${1 === current_page ? 'active' : ''}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === current_page ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < last_page) {
      if (endPage < last_page - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={last_page}
          className={`pagination-btn ${last_page === current_page ? 'active' : ''}`}
          onClick={() => handlePageChange(last_page)}
        >
          {last_page}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className={`pagination-btn ${current_page === last_page ? 'disabled' : ''}`}
        onClick={() => handlePageChange(current_page + 1)}
        disabled={current_page === last_page}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    );

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Page {current_page} of {last_page} • {pagination.total} total invoices
        </div>
        <div className="pagination">
          {pages}
        </div>
      </div>
    );
  };

  return (
    <div className="col-lg-10">
      <div className="invoice-container">
        {/* Header Section */}
        <div className="invoice-header">
          <div className="header-conten">
            <div className="header-text">
              <h1 className="invoice-title">My Invoices</h1>
              <p className="invoice-subtitle">
                Manage and track all your order invoices in one place
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                {/* <div className="stat-icon">
                  <i className="fas fa-receipt" style={{color:'#81d4f5'}}></i>
                </div> */}
                <div className="stat-content">
                  <div className="stat-value" style={{color:'white'}}>{pagination.total}</div>
                  <div className="stat-label" style={{color:'white'}}>Total Invoices</div>
                </div>
              </div>
              <div className="stat-card">
                {/* <div className="stat-icon">
                  <i className="fas fa-money-bill-wave"  style={{color:'#81d4f5'}}></i>
                </div> */}
                <div className="stat-content" >
                  <div className="stat-value" style={{color:'white'}}>{formatPrice(getTotalAmount())}</div>
                  <div className="stat-label" style={{color:'white'}}>Total Amount</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="invoice-filters">
          <div className="filter-section">
            <div className="search-box">
              {/* <i className="fas fa-search search-icon"></i> */}
              <input
                type="text"
                placeholder="Search invoices or orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="status-filters">
              {statusFilters.map(filter => (
                <button
                  key={filter.value}
                  className={`status-filter-btn ${filterStatus === filter.value ? 'active' : ''}`}
                  onClick={() => setFilterStatus(filter.value)}
                >
                  <span className="filter-label">{filter.label}</span>
                  <span className="filter-count">{filter.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="invoice-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
              <div className="loading-text">
                <h3>Loading Invoices</h3>
                <p>Please wait while we fetch your invoices...</p>
              </div>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="error-content">
                <h3>Unable to Load Invoices</h3>
                <p>{error}</p>
                <button onClick={() => fetchInvoices()} className="retry-btn">
                  <i className="fas fa-redo"></i>
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon">
                <i className="fas fa-file-invoice"></i>
              </div>
              <div className="empty-content">
                <h3>No Invoices Found</h3>
                <p>We couldn't find any invoices matching your criteria.</p>
                <div className="empty-actions">
                  <button onClick={() => {setSearchTerm(''); setFilterStatus('all');}} className="btn btn-primary">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              {/* <div className="invoices-table desktop-view">
                <div className="table-header">
                  <div className="col-invoice">Invoice</div>
                  <div className="col-order">Order</div>
                  <div className="col-date">Date & Due</div>
                  <div className="col-amount">Amount</div>
                  <div className="col-status">Status</div>
                  <div className="col-actions">Actions</div>
                </div>

                <div className="table-body">
                  {filteredInvoices.map(invoice => (
                    <div key={invoice.id} className="invoice-row">
                      <div className="col-invoice">
                        <div className="invoice-main">
                          <div className="invoice-id">{invoice.id}</div>
                          <div className="invoice-method">{invoice.paymentMethod}</div>
                        </div>
                      </div>

                      <div className="col-order">
                        <div className="order-info">
                          <span className="order-id">{invoice.orderId}</span>
                        </div>
                      </div>

                      <div className="col-date">
                        <div className="date-info">
                          <div className="invoice-date">{formatDate(invoice.date)}</div>
                          <div className="due-date">Due {formatDate(invoice.dueDate)}</div>
                        </div>
                      </div>

                      <div className="col-amount">
                        <div className="amount-display">
                          {formatPrice(invoice.amount)}
                        </div>
                      </div>

                      <div className="col-status">
                        {getStatusBadge(invoice.status)}
                      </div>

                      <div className="col-actions">
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => navigate(`/account/invoices/${invoice.invoiceId}`)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="action-btn download-btn"
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Download PDF"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                          <button
                            className="action-btn print-btn"
                            onClick={() => handlePrintInvoice(invoice)}
                            title="Print Invoice"
                          >
                            <i className="fas fa-print"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Mobile Card View */}
              <div className="invoices-cards mobile-view">
                {filteredInvoices.map(invoice => (
                  <div key={invoice.id} className="invoice-card">
                    <div className="card-header">
                      <div className="card-invoice-id">{invoice.id}</div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    
                    <div className="card-content">
                      <div className="card-row">
                        <span className="card-label">Order:</span>
                        <span className="card-value">{invoice.orderId}</span>
                      </div>
                      <div className="card-row">
                        <span className="card-label">Date:</span>
                        <span className="card-value">{formatDate(invoice.date)}</span>
                      </div>
                      <div className="card-row">
                        <span className="card-label">Due:</span>
                        <span className="card-value">{formatDate(invoice.dueDate)}</span>
                      </div>
                      <div className="card-row">
                        <span className="card-label">Amount:</span>
                        <span className="card-value amount">{formatPrice(invoice.amount)}</span>
                      </div>
                      <div className="card-row">
                        <span className="card-label">Payment:</span>
                        <span className="card-value">{invoice.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/account/invoices/${invoice.invoiceId}`)}
                      >
                        <i className="fas fa-eye m-3"></i>
                        View
                      </button>
                      {/* <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <i className="fas fa-download"></i>
                        Download
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <Pagination />
            </>
          )}
        </div>

        {/* Invoice Detail Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <h2>Invoice Details</h2>
                  <p className="invoice-number">{selectedInvoice.id}</p>
                </div>
                <div className="modal-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => handleShareInvoice(selectedInvoice)}
                  >
                    <i className="fas fa-share"></i>
                    Share
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handlePrintInvoice(selectedInvoice)}
                  >
                    <i className="fas fa-print"></i>
                    Print
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                  >
                    <i className="fas fa-download"></i>
                    Download PDF
                  </button>
                  <button
                    className="modal-close"
                    onClick={() => setShowInvoiceModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div className="modal-body">
                <div className="invoice-preview">
                  {/* Invoice content would go here */}
                  <div className="preview-placeholder">
                    <i className="fas fa-file-invoice-dollar"></i>
                    <p>Invoice Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountInvoice;