import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

export const useWishlist = () => {
    const [loading, setLoading] = useState(false);
    const { token } = useSelector(state => state.auth);
    const baseUrl = import.meta.env.VITE_API_URL || '';

    const addToWishlist = async (productId) => {
        if (!token) {
            toast.error('Please login to add items to wishlist');
            return false;
        }

        try {
            setLoading(true);
            const formData = new URLSearchParams();
            formData.append('product_id', productId);
            
            const response = await axios.post(
                `${baseUrl}/api/customer/wishlist`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (response.data.success) {
                toast.success(response.data.message || 'Product added to wishlist');
                return true;
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            if (error.response?.status === 409) {
                toast.info('Product is already in your wishlist');
            } else {
                toast.error('Failed to add product to wishlist');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (wishlistId) => {
        if (!token) {
            toast.error('Please login to manage wishlist');
            return false;
        }

        try {
            setLoading(true);
            const response = await axios.delete(`${baseUrl}/api/customer/wishlist/${wishlistId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                toast.success(response.data.message || 'Product removed from wishlist');
                return true;
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove product from wishlist');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        addToWishlist,
        removeFromWishlist,
        loading
    };
};