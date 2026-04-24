import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setWishlist } from '../store/wishlistSlice';

export const useWishlistData = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const fetchWishlist = async () => {
        if (!token) return;
        
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/wishlist`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setWishlistItems(response.data.data);
                // Sync to Redux store and localStorage
                const productIds = response.data.data.map(item => item.product_id);
                dispatch(setWishlist(productIds));
                localStorage.setItem('wishlistIds', JSON.stringify(productIds));
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [token]);

    const isWishlisted = (productId) => {
        return wishlistItems.some(item => item.product_id === productId);
    };

    const getWishlistId = (productId) => {
        const item = wishlistItems.find(item => item.product_id === productId);
        return item?.id;
    };

    const updateWishlist = () => {
        fetchWishlist();
    };

    return {
        wishlistItems,
        loading,
        isWishlisted,
        getWishlistId,
        updateWishlist
    };
};
