import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Fetch list of companies with search/filters (industry, country, name, sort, page, limit)
 */
export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/company", { params });
      return response.data; // Expects { success: true, data: { comapanies: [], metadata: {} } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch companies"
      );
    }
  }
);

/**
 * Fetch single company details by ID
 */
export const fetchCompanyById = createAsyncThunk(
  "companies/fetchCompanyById",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/company/${companyId}`);
      return response.data; // Expects { success: true, data: { ...companyDetails } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch company details"
      );
    }
  }
);

/**
 * Recruiter: Create a new company
 */
export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/company", companyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create company"
      );
    }
  }
);

/**
 * Recruiter (Owner): Update owned company details
 */
export const updateCompany = createAsyncThunk(
  "companies/updateCompany",
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await api.patch("/api/company", companyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update company"
      );
    }
  }
);

/**
 * Admin: Update verification status of a company
 */
export const updateCompanyVerification = createAsyncThunk(
  "companies/updateCompanyVerification",
  async ({ companyId, isVerified }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/company/${companyId}/verification`, {
        isVerified,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update company verification"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  companies: [],
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentCompany: null,

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

const companySlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    clearCurrentCompany: (state) => {
      state.currentCompany = null;
      state.errorDetail = null;
    },
    clearCompanyErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Companies List ---
      .addCase(fetchCompanies.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loadingList = false;
        // Handles backend response key 'comapanies' and normalizes to state.companies
        const rawCompanies = action.payload.data?.comapanies || action.payload.data?.companies || [];
        state.companies = rawCompanies;
        state.metadata = action.payload.data?.metadata || state.metadata;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Single Company Detail ---
      .addCase(fetchCompanyById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentCompany = action.payload.data;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // --- Create Company ---
      .addCase(createCompany.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.submitting = false;
        const created = action.payload.data?.companyCreated || action.payload.data;
        if (created) {
          state.companies.unshift(created);
          state.currentCompany = created;
        }
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Update Company ---
      .addCase(updateCompany.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        if (updated) {
          state.companies = state.companies.map((c) =>
            c.id === updated.id ? updated : c
          );
          if (state.currentCompany?.id === updated.id) {
            state.currentCompany = { ...state.currentCompany, ...updated };
          }
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Admin Verification Update ---
      .addCase(updateCompanyVerification.fulfilled, (state, action) => {
        const updated = action.payload.data;
        if (updated) {
          state.companies = state.companies.map((c) =>
            c.id === updated.id ? { ...c, isVerified: updated.isVerified } : c
          );
          if (state.currentCompany?.id === updated.id) {
            state.currentCompany.isVerified = updated.isVerified;
          }
        }
      });
  },
});

export const { clearCurrentCompany, clearCompanyErrors } = companySlice.actions;
export default companySlice.reducer;