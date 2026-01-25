import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useProducts = ({ 
  isFeatured = false,
  limit = null,
  categoryId = null,
  searchQuery = '',
  sortBy = '',
  page = 1,
  minPrice = null,
  maxPrice = null
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0
  });

  // Format price helper function
  const formatPrice = useCallback((price) => {
    return `₦${parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, []);

  // Fetch products function
  const fetchProducts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (isFeatured) params.append('is_featured', 'true');
      if (limit) params.append('limit', limit);
      if (categoryId) params.append('category_id', categoryId);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sort_by', sortBy);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (pageNum) params.append('page', pageNum);

      const queryString = params.toString();
      const baseUrl = import.meta.env.VITE_API_URL;
      const url = `${baseUrl}/api/products${queryString ? `?${queryString}` : ''}`;

      console.log('Fetching products from:', url); // Debug log

      const response = await axios.get(url);

      console.log('API Response:', response.data); // Debug log

      if (response.data.success) {
        setProducts(response.data.data);
        
        // Update pagination if meta data is available
        if (response.data.meta) {
          setPagination({
            currentPage: response.data.meta.current_page,
            lastPage: response.data.meta.last_page,
            perPage: response.data.meta.per_page,
            total: response.data.meta.total
          });
        }
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [isFeatured, limit, categoryId, searchQuery, sortBy, minPrice, maxPrice]);

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      fetchProducts(newPage);
    }
  }, [pagination.lastPage, fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    formatPrice,
    handlePageChange,
    refetch: fetchProducts,
    setProducts
  };
};

export default useProducts;