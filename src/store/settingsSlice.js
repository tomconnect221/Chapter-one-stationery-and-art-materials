
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch settings
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`);
      // console.log('seeeeee',response);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch settings');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'An unknown error occurred');
    }
  },
  {
    condition: (_, { getState }) => getState().settings.status !== 'loading',
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default settingsSlice.reducer;
