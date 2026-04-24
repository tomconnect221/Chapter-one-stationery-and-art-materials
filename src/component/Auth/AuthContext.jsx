import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import { toast } from 'react-toastify';
import {
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
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  logout,
  clearError,
  clearSuccess,
} from '../../store/authSlice';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authModal, setAuthModal] = useState({ show: false, view: 'signin' });
  const dispatch = useDispatch();
  const { isAuthenticated, user, token, loading, error, fieldErrors, success } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const openAuth = (view = 'signin') => {
    dispatch(clearError());
    dispatch(clearSuccess());
    setAuthModal({ show: true, view });
  };

  const closeAuth = () => {
    setAuthModal({ show: false, view: 'signin' });
  };

  // Update customer profile
  const updateProfile = async (profileData) => {
    dispatch(updateProfileStart());
    try {
      // Create form data with only the expected fields
      const formData = new URLSearchParams();

      // Only include fields that are expected by the API
      const expectedFields = [
        'name', 'email', 'phone', 'address', 'city', 'state', 'postal_code'
      ];

      expectedFields.forEach(field => {
        if (profileData[field] !== undefined && profileData[field] !== null) {
          formData.append(field, profileData[field]);
        }
      });

      const response = await apiClient.put('/api/customer/profile', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.success) {
        dispatch(updateProfileSuccess({
          user: response.data.data,
          message: response.data.message,
        }));
        toast.success(response.data.message || 'Profile updated successfully');
        return { success: true, data: response.data.data };
      } else {
        dispatch(updateProfileFailure(response.data.message || 'Profile update failed'));
        toast.error(response.data.message || 'Profile update failed');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      const fieldErrors = error.response?.data?.errors || {};
      dispatch(updateProfileFailure({ message: errorMessage, fieldErrors }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage, fieldErrors };
    }
  };

  // Change password
  const changePassword = async (passwordData, usetoken) => {
    dispatch(changePasswordStart());
    try {
      // Create form data with only the expected fields
      const formData = new URLSearchParams();

      const expectedFields = [
        'current_password', 'password', 'password_confirmation'
      ];

      expectedFields.forEach(field => {
        if (passwordData[field] !== undefined && passwordData[field] !== null) {
          formData.append(field, passwordData[field]);
        }
      });

      const response = await apiClient.post('/api/auth/password/change', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${usetoken}`
        },
      });

      if (response.data.success) {
        dispatch(changePasswordSuccess({
          message: response.data.message,
        }));
        toast.success(response.data.message || 'Password changed successfully');
        return { success: true };
      } else {
        dispatch(changePasswordFailure(response.data.message || 'Password change failed'));
        toast.error(response.data.message || 'Password change failed');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      const fieldErrors = error.response?.data?.errors || {};
      dispatch(changePasswordFailure({ message: errorMessage, fieldErrors }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage, fieldErrors };
    }
  };

  // Forgot Password
  const forgotPassword = async (email, role = 'customer') => {
    dispatch(forgotPasswordStart());
    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('role', role);

      const response = await apiClient.post('/api/auth/password/reset-request', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.success) {
        dispatch(forgotPasswordSuccess({
          message: response.data.message,
        }));
        toast.success(response.data.message || 'Reset link sent');
        return { success: true };
      } else {
        dispatch(forgotPasswordFailure({ message: response.data.message || 'Request failed' }));
        toast.error(response.data.message || 'Request failed');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      const fieldErrors = error.response?.data?.errors || {};
      dispatch(forgotPasswordFailure({ message: errorMessage, fieldErrors }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage, fieldErrors };
    }
  };

  // Reset Password
  const resetPassword = async (data) => {
    dispatch(resetPasswordStart());
    try {
      const formData = new URLSearchParams();
      formData.append('token', data.token);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('password_confirmation', data.password_confirmation);

      const response = await apiClient.post('/api/auth/password/reset', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.success) {
        dispatch(resetPasswordSuccess({
          message: response.data.message,
        }));
        toast.success(response.data.message || 'Password reset successful');
        return { success: true };
      } else {
        dispatch(resetPasswordFailure({ message: response.data.message || 'Reset failed' }));
        toast.error(response.data.message || 'Reset failed');
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Reset failed';
      const fieldErrors = error.response?.data?.errors || {};
      dispatch(resetPasswordFailure({ message: errorMessage, fieldErrors }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage, fieldErrors };
    }
  };

  // Existing login method (unchanged)
  const login = async (email, password, role = 'customer') => {
    dispatch(loginStart());
    try {
      const response = await apiClient.post(`/api/auth/login`, {
        email,
        password,
        role,
      });

      if (response.data.success) {
        const userData = {
          ...response.data.data.user,
          role: response.data.data.user.role || role
        };

        dispatch(loginSuccess({
          user: userData,
          token: response.data.data.token,
          message: response.data.message,
        }));
        toast.success(response.data.message || 'Login successful');
        closeAuth();

        setTimeout(() => {
          const intendedPath = sessionStorage.getItem('intendedPath');
          if (intendedPath) {
            sessionStorage.removeItem('intendedPath');
            navigate(intendedPath, { replace: true });
            return;
          }
          switch (userData.role) {
            case 'admin':
            case 'subadmin':
              navigate('/admin/dashboard', { replace: true });
              break;
            case 'rider':
            case 'dispatch':
              navigate('/dispatch/dashboard', { replace: true });
              break;
            case 'customer':
            default:
              navigate('/', { replace: true });
              break;
          }
        }, 100);
      } else {
        dispatch(loginFailure(response.data.message || 'Login failed'));
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Login failed';
      const fieldErrors = error.response?.data?.errors || {};
      dispatch(loginFailure({ message: errorMessage, fieldErrors }));
      toast.error(errorMessage);
    }
  };

  // Existing register method (unchanged)
  const register = async (formData) => {
    dispatch(registerStart());
    try {
      const response = await apiClient.post(`/api/auth/register`, {
        name: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      if (response.data.success) {
        const userData = {
          ...response.data.data.user,
          role: response.data.data.user.role || 'customer'
        };

        dispatch(registerSuccess({
          user: userData,
          token: response.data.data.token,
          message: response.data.message,
        }));
        toast.success(response.data.message || 'Customer registered successfully');
        closeAuth();

        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        dispatch(registerFailure(response.data.message || 'Registration failed'));
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      const fieldErrors = error.response?.data?.errors || {};
      dispatch(registerFailure({ message: errorMessage, fieldErrors }));
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const clearAuthSuccess = () => {
    dispatch(clearSuccess());
  };

  return (
    <AuthContext.Provider value={{
      authModal,
      openAuth,
      closeAuth,
      login,
      register,
      updateProfile,
      changePassword,

      forgotPassword,
      resetPassword,
      logout: handleLogout,
      clearError: clearAuthError,
      clearSuccess: clearAuthSuccess,
      isAuthenticated,
      user,
      token,
      loading,
      error,
      fieldErrors,
      success,
    }}>
      {children}
    </AuthContext.Provider>
  );
};