import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [] // { id, qty, product }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const payload = action.payload || {};
      const id = payload.id;
      if (id == null) return;
      const delta = Math.max(1, Number(payload.qty || 1));
      const existing = state.items.find(i => i.id === id);
      if (existing) {
        existing.qty += delta;
      } else {
        state.items.push({ id, qty: delta, product: payload });
      }
    },
    removeFromCart(state, action) {
      const id = action.payload;
      state.items = state.items.filter(i => i.id !== id);
    },
    setQty(state, action) {
      const { id, qty } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) item.qty = Math.max(1, Number(qty));
    },
    clearCart(state) {
      state.items = [];
    }
  }
});

export const { addToCart, removeFromCart, setQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
