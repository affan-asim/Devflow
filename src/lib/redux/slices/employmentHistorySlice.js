import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Developer: Fetch personal employment history records with pagination & search
 */
export const fetchDeveloperEmploymentHistory = createAsyncThunk(
  "employmentHistory/fetchDeveloperList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/employment-history", { params });
      return response.data; // Expects { success: true, data: { employments: [], metadata: {} } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch employment history"
      );
    }
  }
);

/**
 * Developer: Fetch single employment history record details
 */
export const fetchDeveloperEmploymentHistoryById = createAsyncThunk(
  "employmentHistory/fetchDeveloperById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/employment-history/${id}`);
      return response.data; // Expects { success: true, data: { ...historyDetails } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch employment detail"
      );
    }
  }
);

/**
 * Recruiter: Fetch employment history records for verified company employees
 */
export const fetchRecruiterEmploymentHistory = createAsyncThunk(
  "employmentHistory/fetchRecruiterList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/employment-history", { params });
      return response.data; // Expects { success: true, data: { employments: [], metadata: {} } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch company employment records"
      );
    }
  }
);

/**
 * Recruiter: Fetch single employment history detail for company employee
 */
export const fetchRecruiterEmploymentHistoryById = createAsyncThunk(
  "employmentHistory/fetchRecruiterById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/employment-history/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch company employment detail"
      );
    }
  }
);

/**
 * Recruiter: Update current employment details (roleTitle, description, salary, currency, employmentType)
 */
export const updateEmploymentHistory = createAsyncThunk(
  "employmentHistory/updateEmploymentHistory",
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/employment-history/${id}`, updateData);
      return response.data; // Expects { success: true, data: { ...updatedRecord } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update employment record"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  employments: [],
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentEmployment: null,

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

const employmentHistorySlice = createSlice({
  name: "employmentHistory",
  initialState,
  reducers: {
    clearCurrentEmployment: (state) => {
      state.currentEmployment = null;
      state.errorDetail = null;
    },
    clearEmploymentErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Developer Employment History List ---
      .addCase(fetchDeveloperEmploymentHistory.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchDeveloperEmploymentHistory.fulfilled, (state, action) => {
        state.loadingList = false;
        state.employments = action.payload.data?.employments || action.payload.employments || [];
        state.metadata = action.payload.data?.metadata || state.metadata;
      })
      .addCase(fetchDeveloperEmploymentHistory.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Recruiter Employment History List ---
      .addCase(fetchRecruiterEmploymentHistory.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchRecruiterEmploymentHistory.fulfilled, (state, action) => {
        state.loadingList = false;
        state.employments = action.payload.data?.employments || action.payload.employments || [];
        state.metadata = action.payload.data?.metadata || state.metadata;
      })
      .addCase(fetchRecruiterEmploymentHistory.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Developer Employment Detail ---
      .addCase(fetchDeveloperEmploymentHistoryById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchDeveloperEmploymentHistoryById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentEmployment = action.payload.data;
      })
      .addCase(fetchDeveloperEmploymentHistoryById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // --- Fetch Recruiter Employment Detail ---
      .addCase(fetchRecruiterEmploymentHistoryById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchRecruiterEmploymentHistoryById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentEmployment = action.payload.data;
      })
      .addCase(fetchRecruiterEmploymentHistoryById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // --- Recruiter: Update Employment History ---
      .addCase(updateEmploymentHistory.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateEmploymentHistory.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        if (updated) {
          state.employments = state.employments.map((emp) =>
            emp.id === updated.id ? { ...emp, ...updated } : emp
          );
          if (state.currentEmployment?.id === updated.id) {
            state.currentEmployment = {
              ...state.currentEmployment,
              ...updated,
            };
          }
        }
      })
      .addCase(updateEmploymentHistory.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearCurrentEmployment, clearEmploymentErrors } =
  employmentHistorySlice.actions;
export default employmentHistorySlice.reducer;
