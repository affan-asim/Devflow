import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api/axios';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Registration failed'
      );
    }
  }
);

export const verifyEmailOtp = createAsyncThunk(
  'auth/verifyEmailOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/email-verify', { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Verification failed'
      );
    }
  }
);

export const resendVerificationOtp = createAsyncThunk(
  'auth/resendVerificationOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to resend OTP'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      await dispatch(fetchCurrentUser());
      return response.data;
    } catch (error) {
      // The API interceptor rejects with the response message as a string.
      // Keep useful auth errors (invalid credentials, unverified email), but
      // replace server internals and network details with a clear sign-in error.
      const message = typeof error === 'string'
        ? error
        : error.response?.data?.error || error.message;

      return rejectWithValue(
        message && message !== 'Internal Server Error'
          ? message
          : 'Unable to sign in right now. Please try again.'
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch user'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await api.patch('/api/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to change password'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Logout failed'
      );
    }
  }
);

export const updateAccount = createAsyncThunk(
  "auth/updateAccount",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        "/api/auth/me",
        data
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.message ||
          "Failed to update account"
      );
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
  unverifiedEmail: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setUnverifiedEmail: (state, action) => {
      state.unverifiedEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.unverifiedEmail = action.meta.arg.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP
      .addCase(verifyEmailOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state) => {
        state.loading = false;
        state.unverifiedEmail = null;
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Resend OTP
      .addCase(resendVerificationOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendVerificationOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.role = action.payload.role
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Current User (/api/auth/me)
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
      
        if (action.payload.data) {
          state.user = {
            ...state.user,
            ...action.payload.data,
          };
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.role = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Clear client auth state even if the server session already expired.
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.role = null;
      });
  },
});

export const { clearAuthError, setUnverifiedEmail } = authSlice.actions;
export default authSlice.reducer;
