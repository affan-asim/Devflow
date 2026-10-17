import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error || (typeof error === "string" ? error : error.message) || fallback;

export const createCompanyJoinRequest = createAsyncThunk(
  "companyJoinRequests/create",
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/company-join-requests", requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create company join request."));
    }
  }
);

export const fetchCompanyJoinRequests = createAsyncThunk(
  "companyJoinRequests/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/company-join-requests", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch company join requests."));
    }
  }
);

export const fetchCompanyJoinRequestById = createAsyncThunk(
  "companyJoinRequests/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/company-join-requests/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch company join request."));
    }
  }
);

export const updateCompanyJoinRequest = createAsyncThunk(
  "companyJoinRequests/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/company-join-requests/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update company join request."));
    }
  }
);

export const updateCompanyJoinRequestStatus = createAsyncThunk(
  "companyJoinRequests/updateStatus",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/company-join-requests/${id}/status`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update company join request status."));
    }
  }
);

const initialState = {
  requests: [],
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  selectedRequest: null,
  loadingList: false,
  loadingDetail: false,
  submitting: false,
  errorList: null,
  errorDetail: null,
  submitError: null,
};

const companyJoinRequestSlice = createSlice({
  name: "companyJoinRequests",
  initialState,
  reducers: {
    clearSelectedCompanyJoinRequest: (state) => {
      state.selectedRequest = null;
      state.errorDetail = null;
    },
    clearCompanyJoinRequestErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyJoinRequests.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchCompanyJoinRequests.fulfilled, (state, action) => {
        state.loadingList = false;
        state.requests = action.payload.data?.requests || [];
        state.metadata = action.payload.data?.metadata || initialState.metadata;
      })
      .addCase(fetchCompanyJoinRequests.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })
      .addCase(fetchCompanyJoinRequestById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchCompanyJoinRequestById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedRequest = action.payload.data;
      })
      .addCase(fetchCompanyJoinRequestById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })
      .addMatcher(
        (action) => [createCompanyJoinRequest.pending.type, updateCompanyJoinRequest.pending.type, updateCompanyJoinRequestStatus.pending.type].includes(action.type),
        (state) => {
          state.submitting = true;
          state.submitError = null;
        }
      )
      .addMatcher(
        (action) => [createCompanyJoinRequest.fulfilled.type, updateCompanyJoinRequest.fulfilled.type, updateCompanyJoinRequestStatus.fulfilled.type].includes(action.type),
        (state, action) => {
          state.submitting = false;
          const updated = action.payload.data;
          if (!updated) return;
          const existingIndex = state.requests.findIndex((request) => request.id === updated.id);
          if (existingIndex >= 0) state.requests[existingIndex] = { ...state.requests[existingIndex], ...updated };
          else if (action.type === createCompanyJoinRequest.fulfilled.type) state.requests.unshift(updated);
          if (state.selectedRequest?.id === updated.id) {
            state.selectedRequest = { ...state.selectedRequest, ...updated };
          }
        }
      )
      .addMatcher(
        (action) => [createCompanyJoinRequest.rejected.type, updateCompanyJoinRequest.rejected.type, updateCompanyJoinRequestStatus.rejected.type].includes(action.type),
        (state, action) => {
          state.submitting = false;
          state.submitError = action.payload;
        }
      );
  },
});

export const { clearSelectedCompanyJoinRequest, clearCompanyJoinRequestErrors } = companyJoinRequestSlice.actions;

export default companyJoinRequestSlice.reducer;
