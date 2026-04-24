import { createSlice } from '@reduxjs/toolkit';

// Constants for localStorage
const CART_STORAGE_KEY = 'ecommerce_cart';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    if (typeof window === 'undefined') return [];
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      // Validate the structure
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items) => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const initialState = {
  items: loadCartFromStorage() // { id, qty, product }
};

// Initialize localStorage with loaded cart if it exists
if (typeof window !== 'undefined' && initialState.items.length > 0) {
  saveCartToStorage(initialState.items);
}

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
      // Save to localStorage after change
      saveCartToStorage(state.items);
    },
    removeFromCart(state, action) {
      const id = action.payload;
      state.items = state.items.filter(i => i.id !== id);
      // Save to localStorage after change
      saveCartToStorage(state.items);
    },
    setQty(state, action) {
      const { id, qty } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) item.qty = Math.max(1, Number(qty));
      // Save to localStorage after change
      saveCartToStorage(state.items);
    },
    clearCart(state) {
      state.items = [];
      // Save to localStorage after change
      saveCartToStorage(state.items);
    }
  }
});

export const { addToCart, removeFromCart, setQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
