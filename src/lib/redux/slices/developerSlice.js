import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Fetch list of developer profiles with filters
 */
export const fetchDevelopers = createAsyncThunk(
  "developers/fetchDevelopers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/profile/developer", { params });
      return response.data; // Expects { success: true, data: [...developers], metadata: {...} }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch developers"
      );
    }
  }
);

/**
 * Fetch single developer profile by userId
 */
export const fetchDeveloperProfile = createAsyncThunk(
  "developers/fetchDeveloperProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/profile/developer/${userId}`);
      return response.data; // Expects { success: true, data: { ...profile } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch developer profile"
      );
    }
  }
);

/**
 * Fetch Developer Dashboard Data (Completeness, Analytics, Stats, Recommendations)
 */
export const fetchDeveloperDashboard = createAsyncThunk(
  "developers/fetchDeveloperDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/profile/developer/dashboard");
      return response.data; // Expects { success: true, data: { profile, stats, applicationAnalytics, recommendedJobs, ... } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch dashboard metrics"
      );
    }
  }
);

/**
 * Developer: Create profile
 */
export const createDeveloperProfile = createAsyncThunk(
  "developers/createDeveloperProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/profile/developer", profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create developer profile"
      );
    }
  }
);

/**
 * Developer: Update owned profile
 */
export const updateDeveloperProfile = createAsyncThunk(
  "developers/updateDeveloperProfile",
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await api.patch("/api/profile/developer", updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update developer profile"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  developers: [],
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentDeveloper: null,

  // Dashboard Data
  dashboard: {
    profile: null,
    stats: {
      totalApplications: 0,
      pendingApplications: 0,
      reviewApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,
    },
    applicationAnalytics: {
      statusDistribution: {
        pending: 0,
        review: 0,
        accepted: 0,
        rejected: 0,
      },
      activity: [],
    },
    recommendedJobs: [],
    recentApplications: [],
    recentNotifications: [],
  },

  // Loading states
  loadingList: false,
  loadingDetail: false,
  loadingDashboard: false,
  submitting: false,

  // Error states
  errorList: null,
  errorDetail: null,
  errorDashboard: null,
  submitError: null,
};

// ==========================================
// SLICE
// ==========================================

const developerSlice = createSlice({
  name: "developers",
  initialState,
  reducers: {
    clearCurrentDeveloper: (state) => {
      state.currentDeveloper = null;
      state.errorDetail = null;
    },
    clearDeveloperErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.errorDashboard = null;
      state.submitError = null;
    },
    clearDevelopers: (state) => {
      state.developers = [];
      state.metadata = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      state.errorList = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Developers List ---
      .addCase(fetchDevelopers.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchDevelopers.fulfilled, (state, action) => {
        state.loadingList = false;
        state.developers = action.payload.data || [];

        state.metadata =
        action.payload?.metadata || state.metadata;
      })
      .addCase(fetchDevelopers.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Single Developer Profile ---
      .addCase(fetchDeveloperProfile.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchDeveloperProfile.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentDeveloper = action.payload.data;
      })
      .addCase(fetchDeveloperProfile.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // --- Fetch Developer Dashboard ---
      .addCase(fetchDeveloperDashboard.pending, (state) => {
        state.loadingDashboard = true;
        state.errorDashboard = null;
      })
      .addCase(fetchDeveloperDashboard.fulfilled, (state, action) => {
        state.loadingDashboard = false;
        if (action.payload.data) {
          state.dashboard = action.payload.data;
        }
      })
      .addCase(fetchDeveloperDashboard.rejected, (state, action) => {
        state.loadingDashboard = false;
        state.errorDashboard = action.payload;
      })

      // --- Create Developer Profile ---
      .addCase(createDeveloperProfile.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createDeveloperProfile.fulfilled, (state, action) => {
        state.submitting = false;
        const created = action.payload.data;
        if (created) {
          state.developers.unshift(created);
          state.currentDeveloper = created;
        }
      })
      .addCase(createDeveloperProfile.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Update Developer Profile ---
      .addCase(updateDeveloperProfile.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateDeveloperProfile.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        if (updated) {
          state.developers = state.developers.map((d) =>
            d.id === updated.id ? updated : d
          );
          if (state.currentDeveloper?.id === updated.id) {
            state.currentDeveloper = { ...state.currentDeveloper, ...updated };
          }
          if (state.dashboard.profile) {
            state.dashboard.profile = { ...state.dashboard.profile, ...updated };
          }
        }
      })
      .addCase(updateDeveloperProfile.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearCurrentDeveloper, clearDeveloperErrors, clearDevelopers } = developerSlice.actions;
export default developerSlice.reducer;
