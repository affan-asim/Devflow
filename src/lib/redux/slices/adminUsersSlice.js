import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error || error.message || fallback;

/** Admin: Fetch users with optional search, filters, and pagination. */
export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetchAdminUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/users", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch users"));
    }
  }
);

/** Admin: Fetch a user's details and profile. */
export const fetchAdminUserById = createAsyncThunk(
  "adminUsers/fetchAdminUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch user details")
      );
    }
  }
);

/** Admin: Activate or deactivate a user account. */
export const updateAdminUserStatus = createAsyncThunk(
  "adminUsers/updateAdminUserStatus",
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/users/${userId}/status`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update user status")
      );
    }
  }
);

const initialState = {
  users: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },
  currentUser: null,

  loadingList: false,
  loadingDetail: false,
  submitting: false,

  errorList: null,
  errorDetail: null,
  submitError: null,
};

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    clearCurrentAdminUser: (state) => {
      state.currentUser = null;
      state.errorDetail = null;
    },
    clearAdminUsersErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
    clearAdminUsers: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loadingList = false;
        state.users = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      .addCase(fetchAdminUserById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchAdminUserById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentUser = action.payload.data;
      })
      .addCase(fetchAdminUserById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      .addCase(updateAdminUserStatus.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateAdminUserStatus.fulfilled, (state, action) => {
        state.submitting = false;
        const updatedUser = action.payload.data;
        if (!updatedUser) return;

        state.users = state.users.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        );
        if (state.currentUser?.id === updatedUser.id) {
          state.currentUser = { ...state.currentUser, ...updatedUser };
        }
      })
      .addCase(updateAdminUserStatus.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const {
  clearCurrentAdminUser,
  clearAdminUsersErrors,
  clearAdminUsers,
} = adminUsersSlice.actions;

export default adminUsersSlice.reducer;
