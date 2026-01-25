import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const useNotifications = (userType = 'admin') => {
  const { token } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, critical: 0, high: 0 });
  const [criticalNotifications, setCriticalNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0, last_page: 1 });

  // Determine endpoint based on user type
  const getEndpoint = (path) => {
    const userEndpoint = userType === 'subadmin' ? 'subadmin' : 'admin';
    return `/api/${userEndpoint}${path}`;
  };

  // Fetch all notifications
  const fetchNotifications = useCallback(
    async (page = 1) => {
      if (!token) return;

      setLoading(true);
      try {
        const endpoint = getEndpoint(`/notifications?page=${page}`);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const list = res.data?.data?.data || [];
        const meta = res.data?.data;

        const items = list.map((item) => ({
          id: item.id,
          title: item.title || item.subject || 'Notification',
          message: item.message || item.body || '',
          type: item.type || 'info',
          priority: item.priority || 'normal',
          category: item.category || 'general',
          created_at: item.created_at,
          read_at: item.read_at,
          unread: !item.read_at
        }));

        setNotifications(items);
        setPagination({
          page: meta.current_page || 1,
          per_page: meta.per_page || 20,
          total: meta.total || 0,
          last_page: meta.last_page || 1
        });
      } catch (err) {
        console.error('Failed to fetch notifications', err);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    },
    [token, userType]
  );

  // Fetch notification stats
  const fetchStats = useCallback(async () => {
    if (!token) return;

    try {
      const endpoint = getEndpoint('/notifications/stats');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(res.data?.data || { total: 0, unread: 0, critical: 0, high: 0 });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, [token, userType]);

  // Fetch critical notifications
  const fetchCritical = useCallback(async () => {
    if (!token) return;

    try {
      const endpoint = getEndpoint('/notifications/critical');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const list = res.data?.data || [];
      const items = list.map((item) => ({
        id: item.id,
        title: item.title || item.subject || 'Critical Alert',
        message: item.message || item.body || '',
        type: item.type || 'critical',
        priority: 'critical',
        category: item.category || 'general',
        created_at: item.created_at,
        read_at: item.read_at,
        unread: !item.read_at
      }));

      setCriticalNotifications(items);
    } catch (err) {
      console.error('Failed to fetch critical notifications', err);
    }
  }, [token, userType]);

  // Fetch notifications by category
  const fetchByCategory = useCallback(
    async (category) => {
      if (!token) return [];

      try {
        const endpoint = getEndpoint(`/notifications/category/${category}`);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        return res.data?.data || [];
      } catch (err) {
        console.error(`Failed to fetch ${category} notifications`, err);
        toast.error(`Failed to load ${category} notifications`);
        return [];
      }
    },
    [token, userType]
  );

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!token) return false;

      try {
        const endpoint = getEndpoint(`/notifications/${notificationId}/read`);
        await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, unread: false, read_at: new Date().toISOString() } : n
          )
        );

        toast.success('Notification marked as read');
        return true;
      } catch (err) {
        console.error('Failed to mark as read', err);
        toast.error('Failed to mark notification as read');
        return false;
      }
    },
    [token, userType]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return false;

    try {
      const endpoint = getEndpoint('/notifications/mark-all-read');
      const res = await axios.put(`${import.meta.env.VITE_API_URL}${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          unread: false,
          read_at: n.read_at || new Date().toISOString()
        }))
      );

      toast.success(res.data?.message || 'All notifications marked as read');
      return true;
    } catch (err) {
      console.error('Failed to mark all as read', err);
      toast.error('Failed to mark all notifications as read');
      return false;
    }
  }, [token, userType]);

  // Delete a notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!token) return false;

      try {
        const endpoint = getEndpoint(`/notifications/${notificationId}`);
        await axios.delete(`${import.meta.env.VITE_API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success('Notification deleted');
        return true;
      } catch (err) {
        console.error('Failed to delete notification', err);
        toast.error('Failed to delete notification');
        return false;
      }
    },
    [token, userType]
  );

  // Initial fetch on mount
  useEffect(() => {
    if (token) {
      fetchNotifications(1);
      fetchStats();
      fetchCritical();
    }
  }, [token, userType, fetchNotifications, fetchStats, fetchCritical]);

  return {
    notifications,
    stats,
    criticalNotifications,
    loading,
    pagination,
    fetchNotifications,
    fetchStats,
    fetchCritical,
    fetchByCategory,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

export default useNotifications;
