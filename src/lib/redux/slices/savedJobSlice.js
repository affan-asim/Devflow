import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Developer: Bookmark/Save a job posting
 */
export const saveJob = createAsyncThunk(
  "savedJobs/saveJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/savedJobs", jobId);
      return response.data; // Expects { success: true, data: { ...savedJob } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to save job"
      );
    }
  }
);

/**
 * Developer: Fetch paginated list of saved jobs with company and skill details
 */
export const fetchSavedJobs = createAsyncThunk(
  "savedJobs/fetchSavedJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/savedJobs", { params });
      return response.data; // Expects { success: true, data: { savedJobs: [], metadata: {} } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch saved jobs"
      );
    }
  }
);

/**
 * Developer: Fetch single saved job detail by savedJobId
 */
export const fetchSavedJobById = createAsyncThunk(
  "savedJobs/fetchSavedJobById",
  async (savedJobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/savedJobs/${savedJobId}`);
      return response.data; // Expects { success: true, data: { ...savedJob } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch saved job detail"
      );
    }
  }
);

/**
 * Developer: Remove/Unsave a job record by savedJobId
 */
export const deleteSavedJob = createAsyncThunk(
  "savedJobs/deleteSavedJob",
  async (savedJobId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/savedJobs/${savedJobId}`);
      return { savedJobId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to unsave job"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  savedJobs: [],
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentSavedJob: null,

  // Loading states
  loadingList: false,
  loadingDetail: false,
  submitting: false,

  // Error states
  errorList: null,
  errorDetail: null,
  submitError: null,
};

// ==========================================
// SLICE
// ==========================================

const savedJobSlice = createSlice({
  name: "savedJobs",
  initialState,
  reducers: {
    clearCurrentSavedJob: (state) => {
      state.currentSavedJob = null;
      state.errorDetail = null;
    },
    clearSavedJobErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Saved Jobs List ---
      .addCase(fetchSavedJobs.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.loadingList = false;
        state.savedJobs =
          action.payload.data || action.payload.savedJobs || [];
        state.metadata = action.payload.data?.metadata || action.payload.metadata;
      })
      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Saved Job Detail ---
      .addCase(fetchSavedJobById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchSavedJobById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentSavedJob = action.payload.data;
      })
      .addCase(fetchSavedJobById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // --- Save Job ---
      .addCase(saveJob.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(saveJob.fulfilled, (state, action) => {
        state.submitting = false;
        const created = action.payload.data;
        if (created) {
          state.savedJobs.unshift(created);
          state.metadata.totalCount += 1;
        }
      })
      .addCase(saveJob.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Unsave / Delete Saved Job ---
      .addCase(deleteSavedJob.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(deleteSavedJob.fulfilled, (state, action) => {
        state.submitting = false;
        const idToRemove = action.payload.savedJobId;
        state.savedJobs = state.savedJobs.filter((item) => item.id !== idToRemove);
        state.metadata.totalCount = Math.max(0, state.metadata.totalCount - 1);
        if (state.currentSavedJob?.id === idToRemove) {
          state.currentSavedJob = null;
        }
      })
      .addCase(deleteSavedJob.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearCurrentSavedJob, clearSavedJobErrors } =
  savedJobSlice.actions;

export default savedJobSlice.reducer;