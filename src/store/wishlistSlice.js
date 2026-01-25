import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ids: []
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action) {
      const id = action.payload;
      if (state.ids.includes(id)) state.ids = state.ids.filter(x => x !== id);
      else state.ids.push(id);
    },
    setWishlist(state, action) {
      state.ids = action.payload || [];
    },
    clearWishlist(state) {
      state.ids = [];
    }
  }
});

export const { toggleWishlist, setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
