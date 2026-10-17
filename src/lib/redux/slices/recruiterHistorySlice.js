import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Fetch paginated recruiter employment history items with optional filters
 */
export const fetchRecruiterHistory = createAsyncThunk(
  "recruiterHistory/fetchHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/recruiter-history", { params });
      return response.data; // Expects { success: true, data: { employments, metadata } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch recruiter history"
      );
    }
  }
);

/**
 * Fetch detailed single recruiter history record by ID
 */
export const fetchRecruiterHistoryDetail = createAsyncThunk(
  "recruiterHistory/fetchHistoryDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/recruiter-history/${id}`);
      return response.data; // Expects { success: true, data: historyRecord }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch history details"
      );
    }
  }
);

/**
 * Update recruiter employment history entry
 */
export const updateRecruiterEmploymentHistory = createAsyncThunk(
  "recruiterHistory/updateHistory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/recruiter-history/${id}`, data);
      return response.data; // Expects { success: true, data: updatedRecord }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update recruiter history"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  employments: [],
  selectedHistory: null,
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },

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

const recruiterHistorySlice = createSlice({
  name: "recruiterHistory",
  initialState,
  reducers: {
    clearSelectedHistory: (state) => {
      state.selectedHistory = null;
    },
    clearRecruiterHistoryErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch History List ---
      .addCase(fetchRecruiterHistory.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchRecruiterHistory.fulfilled, (state, action) => {
        state.loadingList = false;
        state.employments = action.payload.data?.employments || [];
        state.metadata = action.payload.data?.metadata || initialState.metadata;
      })
      .addCase(fetchRecruiterHistory.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch History Detail ---
      .addCase(fetchRecruiterHistoryDetail.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchRecruiterHistoryDetail.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedHistory = action.payload.data;
      })
      .addCase(fetchRecruiterHistoryDetail.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // --- Update History ---
      .addCase(updateRecruiterEmploymentHistory.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateRecruiterEmploymentHistory.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        state.employments = state.employments.map((item) =>
          item.id === updated.id ? updated : item
        );
        if (state.selectedHistory?.id === updated.id) {
          state.selectedHistory = { ...state.selectedHistory, ...updated };
        }
      })
      .addCase(updateRecruiterEmploymentHistory.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearSelectedHistory, clearRecruiterHistoryErrors } =
  recruiterHistorySlice.actions;

export default recruiterHistorySlice.reducer;