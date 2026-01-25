import { useState, useEffect } from 'react';
import axios from 'axios';

const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);

                if (response.data.success) {
                    setCategories(response.data.data);
                } else {
                    throw new Error('Failed to fetch categories');
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Function to get category name by ID
    const getCategoryById = (categoryId) => {
        return categories.find(category => category.id === categoryId);
    };

    // Function to get active categories only
    const getActiveCategories = () => {
        return categories.filter(category => category.is_active);
    };

    return {
        categories,
        loading,
        error,
        getCategoryById,
        getActiveCategories
    };
};

export default useCategories;