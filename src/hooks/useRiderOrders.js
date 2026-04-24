import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../apiClient';

const useRiderOrders = ({ 
  status = null,
  page = 1,
  limit = 10,
  sortBy = 'created_at'
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalEarnings: 0
  });

  const { user } = useSelector((state) => state.auth);

  // Fetch rider's assigned orders
  const fetchRiderOrders = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', pageNum);
      params.append('limit', limit);
      params.append('sort_by', sortBy);

      const queryString = params.toString();
      const url = `/api/rider/orders${queryString ? `?${queryString}` : ''}`;

      console.log('Fetching rider orders from:', url);

      const response = await apiClient.get(url);

      console.log('Rider Orders Response:', response.data);

      if (response.data.success) {
        setOrders(response.data.data || []);
        
        // Update pagination if meta data is available
        if (response.data.meta) {
          setPagination({
            currentPage: response.data.meta.current_page || 1,
            lastPage: response.data.meta.last_page || 1,
            perPage: response.data.meta.per_page || limit,
            total: response.data.meta.total || 0
          });
        }

        // Update stats if available
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch rider orders';
      setError(errorMessage);
      console.error('Error fetching rider orders:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, status, sortBy]);

  // Fetch orders when dependencies change
  useEffect(() => {
    if (user?.id) {
      fetchRiderOrders(page);
    }
  }, [page, fetchRiderOrders, user?.id]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      fetchRiderOrders(newPage);
    }
  }, [pagination.lastPage, fetchRiderOrders]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      setError(null);
      
      const response = await apiClient.put(`/api/rider/orders/${orderId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        // Refetch orders to get updated data
        fetchRiderOrders(pagination.currentPage);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update order status';
      setError(errorMessage);
      console.error('Error updating order status:', err);
      throw err;
    }
  }, [fetchRiderOrders, pagination.currentPage]);

  // Get orders by status
  const getOrdersByStatus = useCallback((filterStatus) => {
    return orders.filter(order => order.status === filterStatus);
  }, [orders]);

// Get order statistics
  const getOrderStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate total earnings from delivered orders
    const totalEarnings = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => {
        return sum + parseFloat(order.total_amount || 0);
      }, 0);
    
    // Calculate today's earnings from orders delivered today
    const todayEarnings = orders
      .filter(o => {
        if (o.status !== 'delivered' || !o.delivered_at) return false;
        const deliveredDate = new Date(o.delivered_at);
        deliveredDate.setHours(0, 0, 0, 0);
        return deliveredDate.getTime() === today.getTime();
      })
      .reduce((sum, order) => {
        return sum + parseFloat(order.total_amount || 0);
      }, 0);

    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      readyForDelivery: orders.filter(o => o.status === 'ready_for_delivery').length,
      outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
      inProgress: orders.filter(o => 
        o.status === 'confirmed' || 
        o.status === 'preparing' || 
        o.status === 'ready_for_delivery' || 
        o.status === 'out_for_delivery'
      ).length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalEarnings: totalEarnings,
      todayEarnings: todayEarnings
    };
  }, [orders]);

  return {
    orders,
    loading,
    error,
    pagination,
    stats,
    handlePageChange,
    updateOrderStatus,
    getOrdersByStatus,
    getOrderStats,
    refetch: fetchRiderOrders,
    setOrders
  };
};

export default useRiderOrders;
