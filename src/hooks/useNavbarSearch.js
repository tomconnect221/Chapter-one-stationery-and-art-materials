// hooks/useSimpleSearch.js
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const useSimpleSearch = (searchQuery, limit = 6) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = import.meta.env.VITE_API_URL;
        
        // Try regular products endpoint with search filter
        const url = `${baseUrl}/api/products/search?query=${encodeURIComponent(searchQuery)}&limit=${limit}`;
        
        console.log('Trying products endpoint:', url);

        const response = await axios.get(url, {
          signal: abortControllerRef.current.signal
        });

        if (response.data.success) {
          const productsData = response.data.data?.data || response.data.data || [];
          setProducts(productsData);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError('Search temporarily unavailable');
          console.error('Search error:', err);
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 400);
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery, limit]);

  return { products, loading, error };
};

export default useSimpleSearch;