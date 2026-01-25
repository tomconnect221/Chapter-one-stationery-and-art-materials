import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../component/Auth/AuthContext';
import Wishlist from '../../../component/customer-components/Wishlist';


const CustomerWishlistPage = () => {
	const { isAuthenticated, user } = useAuth();
   {console.log(user?.role)}
	// Only allow access if user is authenticated and is a customer
	if (!isAuthenticated ) {
		return <Navigate to="/login" replace />;
	}
	return (
		<div>
			<Wishlist />
		</div>
	);
};

export default CustomerWishlistPage;
