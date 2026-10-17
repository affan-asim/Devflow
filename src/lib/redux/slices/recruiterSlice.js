import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Recruiter: Fetch current profile
 */
export const fetchRecruiterProfile = createAsyncThunk(
  "recruiter/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/profile/recruiter");
      return response.data; // Expects { success: true, data: { ...profile } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch recruiter profile"
      );
    }
  }
);

/**
 * Fetch recruiter profiles with optional search, filters, sorting, and pagination.
 */
export const fetchRecruiterProfiles = createAsyncThunk(
  "recruiter/fetchProfiles",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/profile/recruiter/general", { params });
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const apiMessage =
        error.response?.data?.error || error.response?.data?.message;

      return rejectWithValue(
        status === 500
          ? "Something went wrong while loading recruiters. Please try again."
          : apiMessage || "Failed to fetch recruiter profiles"
      );
    }
  }
);

export const fetchRecruiterProfileById = createAsyncThunk(
  "recruiter/fetchProfileById",
  async (profileId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/profile/recruiter/general/${profileId}`);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const apiMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        (typeof error === "string" ? error : error.message);

      return rejectWithValue(
        status === 500
          ? "Something went wrong while loading this recruiter profile. Please try again."
          : apiMessage || "Failed to fetch recruiter profile"
      );
    }
  }
);

/**
 * Recruiter: Create profile
 */
export const createRecruiterProfile = createAsyncThunk(
  "recruiter/createProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/profile/recruiter", profileData);
      return response.data; // Expects { success: true, data: { ...profile } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create recruiter profile"
      );
    }
  }
);

/**
 * Recruiter: Update profile
 */
export const updateRecruiterProfile = createAsyncThunk(
  "recruiter/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.patch("/api/profile/recruiter", profileData);
      return response.data; // Expects { success: true, data: { ...profile } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update recruiter profile"
      );
    }
  }
);

/**
 * Recruiter: Fetch recruiter dashboard metrics & analytics
 */
export const fetchRecruiterDashboard = createAsyncThunk(
  "recruiter/fetchDashboard",
  async (type, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/profile/recruiter/dashboard?type=${type}`);
      return response.data; // Expects { success: true, data: { stats, analytics, recentApplications, etc. } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch recruiter dashboard"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  profile: null,
  profiles: [],
  profilesMetadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentExploreProfile: null,
  loadingExploreProfile: false,
  errorExploreProfile: null,
  dashboard: null,

  // Loading states
  loadingProfile: false,
  loadingProfiles: false,
  loadingDashboard: false,
  submitting: false,

  // Error states
  errorProfile: null,
  errorProfiles: null,
  errorDashboard: null,
  submitError: null,
};

// ==========================================
// SLICE
// ==========================================

const recruiterSlice = createSlice({
  name: "recruiter",
  initialState,
  reducers: {
    clearRecruiterErrors: (state) => {
      state.errorProfile = null;
      state.errorProfiles = null;
      state.errorExploreProfile = null;
      state.errorDashboard = null;
      state.submitError = null;
    },
    clearRecruiterExploreProfile: (state) => {
      state.currentExploreProfile = null;
      state.errorExploreProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Profile ---
      .addCase(fetchRecruiterProfile.pending, (state) => {
        state.loadingProfile = true;
        state.errorProfile = null;
      })
      .addCase(fetchRecruiterProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.profile = action.payload.data;
      })
      .addCase(fetchRecruiterProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        state.errorProfile = action.payload;
      })

      // --- Fetch Recruiter Profiles List ---
      .addCase(fetchRecruiterProfiles.pending, (state) => {
        state.loadingProfiles = true;
        state.errorProfiles = null;
      })
      .addCase(fetchRecruiterProfiles.fulfilled, (state, action) => {
        state.loadingProfiles = false;
        state.profiles = action.payload.data?.profiles || [];
        state.profilesMetadata = action.payload.data?.metadata || state.profilesMetadata;
      })
      .addCase(fetchRecruiterProfiles.rejected, (state, action) => {
        state.loadingProfiles = false;
        state.errorProfiles = action.payload;
      })

      .addCase(fetchRecruiterProfileById.pending, (state) => {
        state.loadingExploreProfile = true;
        state.errorExploreProfile = null;
      })
      .addCase(fetchRecruiterProfileById.fulfilled, (state, action) => {
        state.loadingExploreProfile = false;
        state.currentExploreProfile = action.payload.data;
      })
      .addCase(fetchRecruiterProfileById.rejected, (state, action) => {
        state.loadingExploreProfile = false;
        state.errorExploreProfile = action.payload;
      })

      // --- Create Profile ---
      .addCase(createRecruiterProfile.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createRecruiterProfile.fulfilled, (state, action) => {
        state.submitting = false;
        state.profile = action.payload.data;
      })
      .addCase(createRecruiterProfile.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Update Profile ---
      .addCase(updateRecruiterProfile.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateRecruiterProfile.fulfilled, (state, action) => {
        state.submitting = false;
        state.profile = { ...state.profile, ...action.payload.data };
      })
      .addCase(updateRecruiterProfile.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Fetch Dashboard ---
      .addCase(fetchRecruiterDashboard.pending, (state) => {
        state.loadingDashboard = true;
        state.errorDashboard = null;
      })
      .addCase(fetchRecruiterDashboard.fulfilled, (state, action) => {
        state.loadingDashboard = false;
        state.dashboard = action.payload.data;
      })
      .addCase(fetchRecruiterDashboard.rejected, (state, action) => {
        state.loadingDashboard = false;
        state.errorDashboard = action.payload;
      });
  },
});

export const { clearRecruiterErrors,clearRecruiterExploreProfile } = recruiterSlice.actions;
export default recruiterSlice.reducer;
