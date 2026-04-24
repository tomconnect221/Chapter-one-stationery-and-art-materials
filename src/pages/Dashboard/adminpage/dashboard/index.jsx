import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Line, Doughnut } from 'react-chartjs-2';
import useCategories from '../../../../hooks/useCategories';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminMainDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersPagination, setOrdersPagination] = useState({ current_page: 1, per_page: 5, total: 0 });
  const { token, user } = useSelector((state) => state.auth);
  const userType = user?.role || 'admin';

  // Filter states for orders
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterSKU, setFilterSKU] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [products, setProducts] = useState([]);
  const [skus, setSkus] = useState([]);

  // Filter states for revenue analytics
  const [revenueStartDate, setRevenueStartDate] = useState('');
  const [revenueEndDate, setRevenueEndDate] = useState('');
  const [revenueFilterCategory, setRevenueFilterCategory] = useState('all');
  const [revenueFilterProduct, setRevenueFilterProduct] = useState('all');
  const [revenueFilterSKU, setRevenueFilterSKU] = useState('all');
  const [filteredRevenueData, setFilteredRevenueData] = useState(null);

  const { categories } = useCategories();

  useEffect(() => {
    fetchDashboardStats();
    fetchRevenueAnalytics();
    fetchRecentOrders();
  }, []);

  // Fetch products and SKUs for filter options
  useEffect(() => {
    fetchProductsAndSKUs();
  }, [token]);

  // Reset pagination when filters change
  useEffect(() => {
    setOrdersPagination(prev => ({ ...prev, current_page: 1 }));
  }, [startDate, endDate, filterCategory, filterProduct, filterSKU, sortBy]);

  // Filter revenue analytics when filter states change
  useEffect(() => {
    filterRevenueAnalytics();
  }, [revenueStartDate, revenueEndDate, revenueData]);

  const fetchRecentOrders = async (page = 1) => {
    const limit = 5;
    try {
      setOrdersLoading(true);
      const endpoint = userType === 'subadmin'
        ? `${import.meta.env.VITE_API_URL}/api/subadmin/orders?page=${page}&per_page=${limit}`
        : `${import.meta.env.VITE_API_URL}/api/admin/orders?page=${page}&per_page=${limit}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        let orders = response.data.data.data || [];

        // Apply client-side filtering and sorting
        orders = orders
          .filter(order => {
            // Date range filter
            const orderDate = new Date(order.created_at);
            const matchesStartDate = !startDate || orderDate >= new Date(startDate);
            const matchesEndDate = !endDate || orderDate <= new Date(endDate + 'T23:59:59');

            // Category, Product, SKU filters
            let matchesCategory = filterCategory === 'all';
            let matchesProduct = filterProduct === 'all';
            let matchesSKU = filterSKU === 'all';

            if (order.order_items && order.order_items.length > 0) {
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

            return matchesStartDate && matchesEndDate && matchesCategory && matchesProduct && matchesSKU;
          })
          .sort((a, b) => {
            switch (sortBy) {
              case 'date_desc':
                return new Date(b.created_at) - new Date(a.created_at);
              case 'date_asc':
                return new Date(a.created_at) - new Date(b.created_at);
              case 'total_desc':
                return parseFloat(b.total_amount) - parseFloat(a.total_amount);
              case 'total_asc':
                return parseFloat(a.total_amount) - parseFloat(b.total_amount);
              default:
                return 0;
            }
          });

        setRecentOrders(orders.slice(0, limit));
        setOrdersPagination({
          current_page: page,
          per_page: limit,
          total: orders.length,
          last_page: Math.ceil(orders.length / limit)
        });
      }
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProductsAndSKUs = async () => {
    try {
      const endpoint = userType === 'admin'
        ? `${import.meta.env.VITE_API_URL}/api/admin/products`
        : `${import.meta.env.VITE_API_URL}/api/subadmin/products`;

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} ${timeStr}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return { bg: '#ecfdf5', color: '#10b981' };
      case 'processing':
      case 'confirmed':
        return { bg: '#eff6ff', color: '#3b82f6' };
      case 'pending':
        return { bg: '#fef3c7', color: '#f59e0b' };
      case 'cancelled':
        return { bg: '#fef2f2', color: '#ef4444' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const endpoint = userType === 'admin'
        ? `${import.meta.env.VITE_API_URL}/api/admin/dashboard/stats`
        : `${import.meta.env.VITE_API_URL}/api/subadmin/statistics`;
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setStats(response.data.data);
        
      }
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueAnalytics = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/analytics/revenue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setRevenueData(response.data.data);
        setFilteredRevenueData(response.data.data); // Initialize filtered data

        console.log('Revenue analytics',response.data.data);
      }
    } catch (err) {
      generateMockRevenueData();
    }
  };

  // Filter revenue analytics data
  const filterRevenueAnalytics = () => {
    if (!revenueData) return;

    let filtered = { ...revenueData };

    // Filter daily revenue by date range
    if (revenueStartDate || revenueEndDate) {
      filtered.daily_revenue = revenueData.daily_revenue.filter(day => {
        const dayDate = new Date(day.date);
        const startMatch = !revenueStartDate || dayDate >= new Date(revenueStartDate);
        const endMatch = !revenueEndDate || dayDate <= new Date(revenueEndDate + 'T23:59:59');
        return startMatch && endMatch;
      });
    }

    // Recalculate totals based on filtered data
    if (filtered.daily_revenue.length > 0) {
      filtered.total_revenue = filtered.daily_revenue.reduce((sum, day) => sum + parseFloat(day.revenue), 0);
      filtered.orders_count = Math.floor(filtered.daily_revenue.length * 0.8); // Estimate orders count
      filtered.average_order_value = filtered.total_revenue / filtered.orders_count;
    } else {
      filtered.total_revenue = 0;
      filtered.orders_count = 0;
      filtered.average_order_value = 0;
    }

    setFilteredRevenueData(filtered);
  };

  const generateMockRevenueData = () => {
    const data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 49000) + 1000);
    setRevenueData({
      total_revenue: data.reduce((sum, val) => sum + val, 0),
      orders_count: Math.floor(data.length * 0.8),
      average_order_value: 2500,
      daily_revenue: data
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getStatsCards = () => {
    if (!stats) return [];
    
    const cards = [
      // {
      //   title: 'Total sales',
      //   value: formatCurrency(stats.total_revenue || 0),
      //   icon: '💰',
      //   color: '#f97316',
      //   bgColor: '#fff7ed',
      //   change: '+12.5%',
      //   changeType: 'positive'
      // },
      {
        title: 'Total Orders',
        value: formatNumber(stats.total_orders || 0),
        icon: '📦',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        change: '+8.2%',
        changeType: 'positive'
      },
      {
        title: 'Total Products',
        value: formatNumber(stats.total_products || 0),
        icon: '🛍️',
        color: '#10b981',
        bgColor: '#ecfdf5',
        change: '+3.1%',
        changeType: 'positive'
      },
      {
        title: 'Total Customers',
        value: formatNumber(stats.total_customers || 0),
        icon: '👥',
        color: '#8b5cf6',
        bgColor: '#f3e8ff',
        change: '+15.3%',
        changeType: 'positive'
      }
    ];

    if (userType === 'admin') {
      cards.push(
        {
          title: 'Active Riders',
          value: `${stats.active_riders || 0}/${stats.total_riders || 0}`,
          icon: '🚚',
          color: '#ef4444',
          bgColor: '#fef2f2',
          change: '85%',
          changeType: 'neutral'
        },
        {
          title: 'Total Branches',
          value: formatNumber(stats.total_branches || 0),
          icon: '🏢',
          color: '#6b7280',
          bgColor: '#f9fafb',
          change: 'Active',
          changeType: 'neutral'
        }
      );
    }

    return cards;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #f97316',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        background: '#fef2f2',
        borderRadius: '12px',
        border: '1px solid #fecaca'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Unable to load dashboard</h3>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>{error}</p>
        <button
          onClick={fetchDashboardStats}
          style={{
            background: '#f97316',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const statsCards = getStatsCards();

  return (
    <div style={{
      padding: '24px',
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            Dashboard Overview
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '16px'
          }}>
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => {
              fetchDashboardStats();
              fetchRevenueAnalytics();
              fetchRecentOrders();
              fetchProductsAndSKUs();
            }}
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}
          >
            🔄 Refresh
          </button>
          {/* <button style={{
            background: '#f97316',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📊 Export Report
          </button> */}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {statsCards.map((card, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f3f4f6',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div>
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  margin: '0 0 8px 0'
                }}>
                  {card.title}
                </p>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {card.value}
                </h3>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {card.icon}
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                color: card.changeType === 'positive' ? '#10b981' : card.changeType === 'negative' ? '#ef4444' : '#6b7280',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {card.changeType === 'positive' ? '↗' : card.changeType === 'negative' ? '↘' : '→'} {card.change}
              </span>
              <span style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      
      {/* Recent Orders Table */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f3f4f6'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Recent Orders (5)
          </h3>
          <button
            onClick={() => fetchRecentOrders()}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f97316',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            View All →
          </button>
        </div>

       
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <th style={{ padding: '12px 0', textAlign: 'left', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Order Number</th>
                <th style={{ padding: '12px 0', textAlign: 'left', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Customer</th>
                <th style={{ padding: '12px 0', textAlign: 'left', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Items</th>
                <th style={{ padding: '12px 0', textAlign: 'left', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Date</th>
                <th style={{ padding: '12px 0', textAlign: 'left', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '12px 0', textAlign: 'right', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #f3f4f6',
                        borderTop: '2px solid #f97316',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span style={{ color: '#6b7280' }}>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No recent orders found
                  </td>
                </tr>
              ) : (
                recentOrders.slice(0, 5).map((order, index) => {
                  const statusStyle = getStatusColor(order.status);
                  const firstProduct = order.order_items?.[0]?.product?.name || 'N/A';
                  const itemCount = order.order_items?.length || 0;
                  
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '16px 0', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {order.order_number}
                      </td>
                      <td style={{ padding: '16px 0', fontSize: '14px', color: '#1f2937' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{order.customer?.name || 'N/A'}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.customer?.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 0', fontSize: '14px', color: '#1f2937' }}>
                        <div>
                          <div>{firstProduct}</div>
                          {itemCount > 1 && (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>+{itemCount - 1} more items</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 0', fontSize: '14px', color: '#6b7280' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#1f2937' }}>
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {new Date(order.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          textTransform: 'capitalize'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 0', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                        {formatCurrency(parseFloat(order.total_amount))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminMainDashboard;