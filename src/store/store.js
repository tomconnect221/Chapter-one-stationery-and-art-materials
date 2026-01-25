import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import settingsReducer from './settingsSlice'; // Import the new reducer

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    settings: settingsReducer, // Add the settings reducer
  },
});

export default store;
