import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

/** Developer: submit a resignation for a current employment record. */
export const submitEmploymentResignation = createAsyncThunk(
  "employmentEvents/submitResignation",
  async ({ historyId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/employment-history/${historyId}/cancellation`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to submit resignation"
      );
    }
  }
);

/** Company recruiter: accept or reject a developer's pending resignation. */
export const updateDeveloperEmploymentEventStatus = createAsyncThunk(
  "employmentEvents/updateDeveloperEventStatus",
  async ({ eventId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/api/employment-history/events/${eventId}`,
        { status }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update employment event status"
      );
    }
  }
);

export const terminateEmployee = createAsyncThunk(
  "employmentEvents/terminateEmployee",
  async ({ historyId, reason, letterUrl }, { rejectWithValue }) => {
      try {
          const response = await api.post(
              `/api/employment-history/${historyId}/cancellation`,
              {
                  reason,
                  letterUrl: letterUrl || null,
                  status: "ACCEPTED",
              }
          );

          return response.data;
      } catch (error) {
          return rejectWithValue(
              error.response?.data?.error ||
                  "Failed to terminate employee"
          );
      }
  }
);

const initialState = {
  lastProcessedEvent: null,

  submittingResignation: false,
  updatingEventStatus: false,
  terminatingEmployee: false,

  resignationError: null,
  statusError: null,
  terminationError: null,
};;

const employmentEventsSlice = createSlice({
  name: "employmentEvents",
  initialState,
  reducers: {
    clearEmploymentEventErrors: (state) => {
      state.resignationError = null;
      state.statusError = null;
    },
    resetLastProcessedEmploymentEvent: (state) => {
      state.lastProcessedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitEmploymentResignation.pending, (state) => {
        state.submittingResignation = true;
        state.resignationError = null;
      })
      .addCase(submitEmploymentResignation.fulfilled, (state, action) => {
        state.submittingResignation = false;
        state.lastProcessedEvent = action.payload.data;
      })
      .addCase(submitEmploymentResignation.rejected, (state, action) => {
        state.submittingResignation = false;
        state.resignationError = action.payload;
      })
      .addCase(updateDeveloperEmploymentEventStatus.pending, (state) => {
        state.updatingEventStatus = true;
        state.statusError = null;
      })
      .addCase(updateDeveloperEmploymentEventStatus.fulfilled, (state, action) => {
        state.updatingEventStatus = false;
        state.lastProcessedEvent = action.payload.data;
      })
      .addCase(updateDeveloperEmploymentEventStatus.rejected, (state, action) => {
        state.updatingEventStatus = false;
        state.statusError = action.payload;
      })

      .addCase(terminateEmployee.pending, (state) => {
        state.terminatingEmployee = true;
        state.terminationError = null;
    })
    
    .addCase(terminateEmployee.fulfilled, (state, action) => {
        state.terminatingEmployee = false;
        state.lastProcessedEvent = action.payload.data;
    })
    
    .addCase(terminateEmployee.rejected, (state, action) => {
        state.terminatingEmployee = false;
        state.terminationError = action.payload;
    })
  },
});

export const {
  clearEmploymentEventErrors,
  resetLastProcessedEmploymentEvent,
} = employmentEventsSlice.actions;

export default employmentEventsSlice.reducer;
