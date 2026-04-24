import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setWishlist } from '../store/wishlistSlice';

export const useWishlist = () => {
    const [loading, setLoading] = useState(false);
    const { token } = useSelector(state => state.auth);
    const dispatch = useDispatch();
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
                // Update local Redux state to stay in sync
                const currentWishlist = JSON.parse(localStorage.getItem('wishlistIds') || '[]');
                if (!currentWishlist.includes(productId)) {
                    const newWishlist = [...currentWishlist, productId];
                    localStorage.setItem('wishlistIds', JSON.stringify(newWishlist));
                    dispatch(setWishlist(newWishlist));
                }
                return true;
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            const errorMessage = error.response?.data?.message || '';
            
            // Handle "already in wishlist" gracefully - treat as success
            if (error.response?.status === 409 || 
                error.response?.status === 400 || 
                errorMessage.toLowerCase().includes('already')) {
                toast.info('Product is already in your wishlist');
                // Update local Redux state to stay in sync even if it was already there
                const currentWishlist = JSON.parse(localStorage.getItem('wishlistIds') || '[]');
                if (!currentWishlist.includes(productId)) {
                    const newWishlist = [...currentWishlist, productId];
                    localStorage.setItem('wishlistIds', JSON.stringify(newWishlist));
                    dispatch(setWishlist(newWishlist));
                }
                return true;
            } else {
                toast.error('Failed to add product to wishlist');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (wishlistId, productId = null) => {
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
                // Update local Redux state to stay in sync
                if (productId) {
                    const currentWishlist = JSON.parse(localStorage.getItem('wishlistIds') || '[]');
                    const newWishlist = currentWishlist.filter(id => id !== productId);
                    localStorage.setItem('wishlistIds', JSON.stringify(newWishlist));
                    dispatch(setWishlist(newWishlist));
                }
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
