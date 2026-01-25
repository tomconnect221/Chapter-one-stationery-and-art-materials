// hooks/useProductSearch.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useProductSearch = ({ 
  page = 1,
  limit = 12,
  searchQuery = '',
  categoryId = '',
  minPrice = null,
  maxPrice = null,
  sortBy = 'recommended',
  brands = [],
  color = '',
  inStock = false
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
    from: 0,
    to: 0
  });

  // Map sortBy to API sort parameters
  const getSortParams = useCallback((sortBy) => {
    switch (sortBy) {
      case 'price_asc':
        return { sort_by: 'price', sort_order: 'asc' };
      case 'price_desc':
        return { sort_by: 'price', sort_order: 'desc' };
      case 'newest':
        return { sort_by: 'created_at', sort_order: 'desc' };
      case 'rating':
        return { sort_by: 'rating', sort_order: 'desc' };
      default:
        return { sort_by: 'created_at', sort_order: 'desc' };
    }
  }, []);

  // Format price helper function
  const formatPrice = useCallback((price) => {
    if (!price) return '₦0.00';
    return `₦${parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, []);

  // Fetch products from search endpoint
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters for the search endpoint
      const params = new URLSearchParams();

      // Search query
      if (searchQuery) {
        params.append('query', searchQuery);
      }

      // Category filter
      if (categoryId) {
        params.append('category_id', categoryId);
      }

      // Price range
      if (minPrice !== null && minPrice > 0) {
        params.append('min_price', minPrice);
      }
      if (maxPrice !== null) {
        params.append('max_price', maxPrice);
      }

      // Brand filter (using first brand for now)
      if (brands.length > 0) {
        params.append('brand', brands[0]);
      }

      // Color filter
      if (color) {
        params.append('color', color);
      }

      // Stock filter
      if (inStock) {
        params.append('in_stock', '1');
      }

      // Sorting
      const sortParams = getSortParams(sortBy);
      params.append('sort_by', sortParams.sort_by);
      params.append('sort_order', sortParams.sort_order);

      // Pagination
      params.append('page', page.toString());
      params.append('per_page', limit.toString());

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const url = `${baseUrl}/api/products/search?${params.toString()}`;

      console.log('Fetching products from search endpoint:', url);

      const response = await axios.get(url);

      console.log('Search API Response:', response.data);

      if (response.data.success) {
        // Handle the nested response structure
        const productsData = response.data.data?.data || [];
        setProducts(productsData);
        
        // Update pagination from the response
        if (response.data.data) {
          setPagination({
            currentPage: response.data.data.current_page || 1,
            lastPage: response.data.data.last_page || 1,
            perPage: response.data.data.per_page || limit,
            total: response.data.data.total || 0,
            from: response.data.data.from || 0,
            to: response.data.data.to || 0,
            firstPageUrl: response.data.data.first_page_url,
            lastPageUrl: response.data.data.last_page_url,
            nextPageUrl: response.data.data.next_page_url,
            prevPageUrl: response.data.data.prev_page_url,
            path: response.data.data.path,
            links: response.data.data.links || []
          });
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
      setError(errorMessage);
      console.error('Error fetching products from search endpoint:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    searchQuery,
    categoryId,
    minPrice,
    maxPrice,
    sortBy,
    brands,
    color,
    inStock,
    getSortParams
  ]);

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    formatPrice,
    refetch: fetchProducts
  };
};

export default useProductSearch;