import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminAccounting.css';

const AdminAccounting = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
    branch_id: ''
  });

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (!token) return;
      
      setBranchesLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/branches`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setBranches(response.data.data || []);
   
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setBranchesLoading(false);
      }
    };

    fetchBranches();
  }, [token]);

  const fetchAccountingData = async (page = 1) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', itemsPerPage);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.status) params.append('status', filters.status);
      if (filters.branch_id) params.append('branch_id', filters.branch_id);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/accounting?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setData(response.data.data);
               console.log('_______________+_+_+_+_+_+_+',response.data.data);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching accounting data:', error);
      toast.error('Failed to load accounting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountingData(1);
  }, [token, itemsPerPage]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchAccountingData(1);
  };

  const handleResetFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      status: '',
      branch_id: ''
    });
    fetchAccountingData(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (data?.pagination?.last_page || 1)) {
      fetchAccountingData(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    fetchAccountingData(1);
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getPaginationButtons = () => {
    const totalPages = data?.pagination?.last_page || 1;
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

  return (
    <div className="accounting-container">
      {/* Header */}
      <div className="accounting-header">
        <div>
          <h1 className="page-title">📊 Accounting</h1>
          <p className="page-subtitle">Track your sales, profits, and financial performance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
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
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-input"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Branch</label>
            <select
              value={filters.branch_id}
              onChange={(e) => handleFilterChange('branch_id', e.target.value)}
              className="filter-input"
              disabled={branchesLoading}
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-action mt-4">
          <button onClick={handleApplyFilters} className="btn-apply" disabled={loading}>
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
          <button onClick={handleResetFilters} className="btn-reset">
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading accounting data...</p>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          {data.summary && (
            <div className="summary-sectio">
              <h2 className="section-title">Financial Summary</h2>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-icon">📦</div>
                  <div className="summary-content">
                    <span className="summary-label">Total Orders</span>
                    <span className="summary-value">{data.summary.total_orders}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">🎨</div>
                  <div className="summary-content">
                    <span className="summary-label">Items Sold</span>
                    <span className="summary-value">{data.summary.items_sold}</span>
                  </div>
                </div>
                <div className="summary-card highlight">
                  <div className="summary-icon">💰</div>
                  <div className="summary-content">
                    <span className="summary-label">Total Sales</span>
                    <span className="summary-value">{formatCurrency(data.summary.total_sales_price)}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">🏷️</div>
                  <div className="summary-content">
                    <span className="summary-label">Cost Price</span>
                    <span className="summary-value">{formatCurrency(data.summary.total_cost_price)}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">💵</div>
                  <div className="summary-content">
                    <span className="summary-label">Gross Profit</span>
                    <span className="summary-value profit">{formatCurrency(data.summary.gross_profit)}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">🚚</div>
                  <div className="summary-content">
                    <span className="summary-label">Delivery Fee</span>
                    <span className="summary-value">{formatCurrency(data.summary.total_delivery_fee)}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">📝</div>
                  <div className="summary-content">
                    <span className="summary-label">Tax</span>
                    <span className="summary-value">{formatCurrency(data.summary.total_tax)}</span>
                  </div>
                </div>
                <div className="summary-card accent">
                  <div className="summary-icon">💎</div>
                  <div className="summary-content">
                    <span className="summary-label">Net Profit</span>
                    <span className="summary-value">{formatCurrency(data.summary.net_profit)}</span>
                    <span className="profit-margin">{data.summary.profit_margin}% margin</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters Applied */}
          {data.filters && (
            <div className="active-filters">
              <span className="filter-tag">📅 {data.filters.start_date} to {data.filters.end_date}</span>
              {data.filters.status && <span className="filter-tag">📌 Status: {data.filters.status}</span>}
              {data.filters.branch_id && (
                <span className="filter-tag">
                  🏢 Branch: {branches.find(b => b.id === data.filters.branch_id)?.name || data.filters.branch_id}
                </span>
              )}
            </div>
          )}

          {/* Product Breakdown */}
          {data.product_breakdown && data.product_breakdown.length > 0 && (
            <div className="breakdown-section">
              <div className="breakdown-header">
                <h2 className="section-title">Product Breakdown</h2>
                <div className="items-per-page">
                  <label>Show:</label>
                  <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="per-page-select">
                    <option value="10">10</option>
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
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Qty</th>
                      <th>Cost Price</th>
                      <th>Sales Price</th>
                      <th>Discount</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.product_breakdown.map((product, index) => (
                      <tr key={index}>
                        <td className="product-name">{product.product_name}</td>
                        <td><span className="sku-badge">{product.sku}</span></td>
                        <td><span className="qty-badge">{product.quantity_sold}</span></td>
                        <td>{formatCurrency(product.cost_price_total)}</td>
                        <td>{formatCurrency(product.sales_price_total)}</td>
                        <td>{formatCurrency(product.discount_total)}</td>
                        <td className={product.profit >= 0 ? 'profit-positive' : 'profit-negative'}>
                          {formatCurrency(product.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination && data.pagination.last_page > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {((data.pagination.current_page - 1) * data.pagination.per_page) + 1} to{' '}
                    {Math.min(data.pagination.current_page * data.pagination.per_page, data.pagination.total)} of{' '}
                    {data.pagination.total} entries
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
                      disabled={currentPage === data.pagination.last_page}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {data.product_breakdown && data.product_breakdown.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No Data Found</h3>
              <p>No transactions match your current filters</p>
            </div>
          )}
        </>
      ) : (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Data</h3>
          <p>Please check your connection and try again</p>
        </div>
      )}
    </div>
  );
};

export default AdminAccounting;
