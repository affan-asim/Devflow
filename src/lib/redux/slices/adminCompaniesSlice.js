import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error || error.message || fallback;

/** Admin: Fetch companies with optional search, filters, and pagination. */
export const fetchAdminCompanies = createAsyncThunk(
  "adminCompanies/fetchAdminCompanies",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/company", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch companies"));
    }
  }
);

/** Admin: Fetch a company's details. */
export const fetchAdminCompanyById = createAsyncThunk(
  "adminCompanies/fetchAdminCompanyById",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/company/${companyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch company details")
      );
    }
  }
);

/** Admin: Update a company's verification status. */
export const updateAdminCompanyVerification = createAsyncThunk(
  "adminCompanies/updateAdminCompanyVerification",
  async ({ companyId, isVerified }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/api/admin/company/${companyId}/verification`,
        { isVerified }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update company verification")
      );
    }
  }
);

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
  loadingList: false,
  loadingDetail: false,
  submitting: false,
  errorList: null,
  errorDetail: null,
  submitError: null,
};

const adminCompaniesSlice = createSlice({
  name: "adminCompanies",
  initialState,
  reducers: {
    clearCurrentAdminCompany: (state) => {
      state.currentCompany = null;
      state.errorDetail = null;
    },
    clearAdminCompaniesErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
    clearAdminCompanies: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminCompanies.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchAdminCompanies.fulfilled, (state, action) => {
        state.loadingList = false;
        const data = action.payload.data || {};
        state.companies = data.companies || data.comapanies || [];
        state.metadata = data.metadata || state.metadata;
      })
      .addCase(fetchAdminCompanies.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      .addCase(fetchAdminCompanyById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchAdminCompanyById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentCompany = action.payload.data;
      })
      .addCase(fetchAdminCompanyById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      .addCase(updateAdminCompanyVerification.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateAdminCompanyVerification.fulfilled, (state, action) => {
        state.submitting = false;
        const updatedCompany = action.payload.data;
        if (!updatedCompany) return;

        state.companies = state.companies.map((company) =>
          company.id === updatedCompany.id
            ? { ...company, ...updatedCompany }
            : company
        );
        if (state.currentCompany?.id === updatedCompany.id) {
          state.currentCompany = { ...state.currentCompany, ...updatedCompany };
        }
      })
      .addCase(updateAdminCompanyVerification.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const {
  clearCurrentAdminCompany,
  clearAdminCompaniesErrors,
  clearAdminCompanies,
} = adminCompaniesSlice.actions;

export default adminCompaniesSlice.reducer;
