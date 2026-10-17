import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error || error.message || fallback;

/** Admin: fetch recruiter events with filters and pagination. */
export const fetchAdminRecruiterEvents = createAsyncThunk(
  "adminRecruiterEvents/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/recruiter-events", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch recruiter events")
      );
    }
  }
);

/** Admin: fetch one recruiter event by ID. */
export const fetchAdminRecruiterEventById = createAsyncThunk(
  "adminRecruiterEvents/fetchById",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/admin/recruiter-events/${encodeURIComponent(eventId)}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch recruiter event details")
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

const adminRecruiterEventsSlice = createSlice({
  name: "adminRecruiterEvents",
  initialState,
  reducers: {
    clearCurrentAdminRecruiterEvent: (state) => {
      state.currentEvent = null;
      state.errorDetail = null;
    },
    clearAdminRecruiterEventsErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
    },
    resetAdminRecruiterEvents: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminRecruiterEvents.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchAdminRecruiterEvents.fulfilled, (state, action) => {
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
      .addCase(fetchAdminRecruiterEvents.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload || action.error?.message;
      })
      .addCase(fetchAdminRecruiterEventById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
        state.currentEvent = null;
      })
      .addCase(fetchAdminRecruiterEventById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentEvent = action.payload?.data || null;
      })
      .addCase(fetchAdminRecruiterEventById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload || action.error?.message;
      });
  },
});

export const {
  clearCurrentAdminRecruiterEvent,
  clearAdminRecruiterEventsErrors,
  resetAdminRecruiterEvents,
} = adminRecruiterEventsSlice.actions;

export default adminRecruiterEventsSlice.reducer;
