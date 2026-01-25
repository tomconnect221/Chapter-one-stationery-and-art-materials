import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  return {
    user: user ? JSON.parse(user) : null,
    token: token,
    isAuthenticated: !!token,
    loading: false,
    error: null,
    fieldErrors: {},
    success: null,
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
      state.fieldErrors = {};
      state.success = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.fieldErrors = {};
      state.success = action.payload.message || 'Login successful';
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload.message;
      state.fieldErrors = action.payload.fieldErrors || {};
      state.success = null;
    },
    registerStart(state) {
      state.loading = true;
      state.error = null;
      state.fieldErrors = {};
      state.success = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.fieldErrors = {};
      state.success = action.payload.message || 'Registration successful';
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload.message;
      state.fieldErrors = action.payload.fieldErrors || {};
      state.success = null;
    },
    
    // Profile update reducers
    updateProfileStart(state) {
      state.loading = true;
      state.error = null;
      state.fieldErrors = {};
      state.success = null;
    },
    updateProfileSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.success = action.payload.message || 'Profile updated successfully';
      state.error = null;
      state.fieldErrors = {};
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
    },
    updateProfileFailure(state, action) {
      state.loading = false;
      state.error = action.payload.message;
      state.fieldErrors = action.payload.fieldErrors || {};
      state.success = null;
    },
    
    // Change password reducers
    changePasswordStart(state) {
      state.loading = true;
      state.error = null;
      state.fieldErrors = {};
      state.success = null;
    },
    changePasswordSuccess(state, action) {
      state.loading = false;
      state.success = action.payload.message || 'Password changed successfully';
      state.error = null;
      state.fieldErrors = {};
    },
    changePasswordFailure(state, action) {
      state.loading = false;
      state.error = action.payload.message;
      state.fieldErrors = action.payload.fieldErrors || {};
      state.success = null;
    },
    
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.fieldErrors = {};
      state.success = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
    clearError(state) {
      state.error = null;
      state.fieldErrors = {};
    },
    clearSuccess(state) {
      state.success = null;
    },
    updateUserStatus(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('auth_user', JSON.stringify(state.user));
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  logout,
  clearError,
  clearSuccess,
  updateUserStatus,
} = authSlice.actions;

export default authSlice.reducer;