import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/** Admin: Fetch user analytics with an optional date range */
export const fetchAdminUserAnalytics = createAsyncThunk(
  "adminAnalytics/fetchAdminUserAnalytics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/analytics/users", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          (typeof error === "string" ? error : error.message) ||
          "Failed to fetch user analytics"
      );
    }
  }
);

/** Admin: Fetch job analytics with an optional date range */
export const fetchAdminJobAnalytics = createAsyncThunk(
  "adminAnalytics/fetchAdminJobAnalytics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/analytics/jobs", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          (typeof error === "string" ? error : error.message) ||
          "Failed to fetch job analytics"
      );
    }
  }
);

/** Admin: Fetch application analytics with an optional date range */
export const fetchAdminApplicationAnalytics = createAsyncThunk(
  "adminAnalytics/fetchAdminApplicationAnalytics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/analytics/applications", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          (typeof error === "string" ? error : error.message) ||
          "Failed to fetch application analytics"
      );
    }
  }
);

/** Admin: Fetch company analytics with an optional date range */
export const fetchAdminCompanyAnalytics = createAsyncThunk(
  "adminAnalytics/fetchAdminCompanyAnalytics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/analytics/companies", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          (typeof error === "string" ? error : error.message) ||
          "Failed to fetch company analytics"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  users: null,
  jobs: null,
  applications: null,
  companies: null,

  // Loading states
  loadingUsers: false,
  loadingJobs: false,
  loadingApplications: false,
  loadingCompanies: false,

  // Error states
  errorUsers: null,
  errorJobs: null,
  errorApplications: null,
  errorCompanies: null,
};

// ==========================================
// SLICE
// ==========================================

const adminAnalyticsSlice = createSlice({
  name: "adminAnalytics",
  initialState,
  reducers: {
    clearAdminAnalyticsErrors: (state) => {
      state.errorUsers = null;
      state.errorJobs = null;
      state.errorApplications = null;
      state.errorCompanies = null;
    },
    clearAdminAnalytics: (state) => {
      state.users = null;
      state.jobs = null;
      state.applications = null;
      state.companies = null;
      state.errorUsers = null;
      state.errorJobs = null;
      state.errorApplications = null;
      state.errorCompanies = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch User Analytics ---
      .addCase(fetchAdminUserAnalytics.pending, (state) => {
        state.loadingUsers = true;
        state.errorUsers = null;
      })
      .addCase(fetchAdminUserAnalytics.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = action.payload.data;
      })
      .addCase(fetchAdminUserAnalytics.rejected, (state, action) => {
        state.loadingUsers = false;
        state.errorUsers = action.payload;
      })

      // --- Fetch Job Analytics ---
      .addCase(fetchAdminJobAnalytics.pending, (state) => {
        state.loadingJobs = true;
        state.errorJobs = null;
      })
      .addCase(fetchAdminJobAnalytics.fulfilled, (state, action) => {
        state.loadingJobs = false;
        state.jobs = action.payload.data;
      })
      .addCase(fetchAdminJobAnalytics.rejected, (state, action) => {
        state.loadingJobs = false;
        state.errorJobs = action.payload;
      })

      // --- Fetch Application Analytics ---
      .addCase(fetchAdminApplicationAnalytics.pending, (state) => {
        state.loadingApplications = true;
        state.errorApplications = null;
      })
      .addCase(fetchAdminApplicationAnalytics.fulfilled, (state, action) => {
        state.loadingApplications = false;
        state.applications = action.payload.data;
      })
      .addCase(fetchAdminApplicationAnalytics.rejected, (state, action) => {
        state.loadingApplications = false;
        state.errorApplications = action.payload;
      })

      // --- Fetch Company Analytics ---
      .addCase(fetchAdminCompanyAnalytics.pending, (state) => {
        state.loadingCompanies = true;
        state.errorCompanies = null;
      })
      .addCase(fetchAdminCompanyAnalytics.fulfilled, (state, action) => {
        state.loadingCompanies = false;
        state.companies = action.payload.data;
      })
      .addCase(fetchAdminCompanyAnalytics.rejected, (state, action) => {
        state.loadingCompanies = false;
        state.errorCompanies = action.payload;
      });
  },
});

export const { clearAdminAnalyticsErrors, clearAdminAnalytics } =
  adminAnalyticsSlice.actions;
export default adminAnalyticsSlice.reducer;
