    import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const usePendingOrdersCount = (userType) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  const fetchPendingOrdersCount = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      let url = '';
      let headers = { Authorization: `Bearer ${token}` };
      
      if (userType === 'admin') {
        url = `${import.meta.env.VITE_API_URL}/api/admin/orders/pending/count`;
      } else if (userType === 'subadmin') {
        url = `${import.meta.env.VITE_API_URL}/api/subadmin/orders/pending/count`;
      }
      
      if (url) {
        const response = await axios.get(url, { headers });
        if (response.data && response.data.success) {
          setPendingCount(response.data.data || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching pending orders count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && (userType === 'admin' || userType === 'subadmin')) {
      fetchPendingOrdersCount();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingOrdersCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, userType]);

  return { pendingCount, loading, refetch: fetchPendingOrdersCount };
};

export default usePendingOrdersCount;
