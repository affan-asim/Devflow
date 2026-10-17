import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error || error.message || fallback;

/** Admin: Fetch employment events with filters and pagination. */
export const fetchAdminEmploymentEvents = createAsyncThunk(
  "adminEmploymentEvents/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/employment-events", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch employment events")
      );
    }
  }
);

/** Admin: Fetch a single employment event. */
export const fetchAdminEmploymentEventById = createAsyncThunk(
  "adminEmploymentEvents/fetchById",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/admin/employment-events/${encodeURIComponent(eventId)}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch employment event details")
      );
    }
  }
);

const initialState = {
  events: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentEvent: null,
  loadingList: false,
  loadingDetail: false,
  errorList: null,
  errorDetail: null,
};

const adminEmploymentEventsSlice = createSlice({
  name: "adminEmploymentEvents",
  initialState,
  reducers: {
    clearCurrentAdminEmploymentEvent: (state) => {
      state.currentEvent = null;
      state.errorDetail = null;
    },
    clearAdminEmploymentEventsErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
    },
    resetAdminEmploymentEvents: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminEmploymentEvents.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchAdminEmploymentEvents.fulfilled, (state, action) => {
        state.loadingList = false;
        state.events = Array.isArray(action.payload?.data)
          ? action.payload.data
          : action.payload?.data?.events || action.payload?.events || [];
        const pagination =
          action.payload?.pagination || action.payload?.data?.pagination;
        if (pagination) {
          const page = pagination.page ?? pagination.currentPage ?? 1;
          const totalPages = pagination.totalPages ?? 0;
          state.pagination = {
            total: pagination.total ?? pagination.totalCount ?? 0,
            page,
            limit: pagination.limit ?? pagination.pageSize ?? 20,
            totalPages,
            hasNextPage: pagination.hasNextPage ?? page < totalPages,
            hasPreviousPage: pagination.hasPreviousPage ?? page > 1,
          };
        }
      })
      .addCase(fetchAdminEmploymentEvents.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload || action.error?.message;
      })
      .addCase(fetchAdminEmploymentEventById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
        state.currentEvent = null;
      })
      .addCase(fetchAdminEmploymentEventById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentEvent = action.payload?.data || null;
      })
      .addCase(fetchAdminEmploymentEventById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload || action.error?.message;
      });
  },
});

export const {
  clearCurrentAdminEmploymentEvent,
  clearAdminEmploymentEventsErrors,
  resetAdminEmploymentEvents,
} = adminEmploymentEventsSlice.actions;

export default adminEmploymentEventsSlice.reducer;
