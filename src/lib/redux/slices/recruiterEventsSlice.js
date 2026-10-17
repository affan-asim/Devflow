import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Handle recruiter resignation or owner-initiated termination events
 */
export const processRecruiterEmploymentEvent = createAsyncThunk(
  "recruiterEvents/processRecruiterEmploymentEvent",
  async ({ historyId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/api/recruiter-history/${historyId}/cancellation`,
        data
      );
      return response.data; // Expects { success: true, data: { recruiterEvent, recruiterHistory, ... } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to process recruiter employment event"
      );
    }
  }
);

/**
 * Company Owner: Approve or reject pending recruiter resignation events
 */
export const updateRecruiterHistoryStatus = createAsyncThunk(
  "recruiterEvents/updateRecruiterHistoryStatus",
  async ({ eventId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/recruiter-history/events/${eventId}`, {
        status,
      });
      return response.data; // Expects { success: true, data: { recruiterEvent, recruiterHistory } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update recruiter event status"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  lastProcessedEvent: null,

  // Loading states
  submittingEvent: false,
  updatingStatus: false,

  // Error states
  eventError: null,
  statusError: null,
};

// ==========================================
// SLICE
// ==========================================

const recruiterEventsSlice = createSlice({
  name: "recruiterEvents",
  initialState,
  reducers: {
    clearRecruiterEventErrors: (state) => {
      state.eventError = null;
      state.statusError = null;
    },
    resetLastProcessedEvent: (state) => {
      state.lastProcessedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Process Recruiter Employment Event ---
      .addCase(processRecruiterEmploymentEvent.pending, (state) => {
        state.submittingEvent = true;
        state.eventError = null;
      })
      .addCase(processRecruiterEmploymentEvent.fulfilled, (state, action) => {
        state.submittingEvent = false;
        state.lastProcessedEvent = action.payload.data;
      })
      .addCase(processRecruiterEmploymentEvent.rejected, (state, action) => {
        state.submittingEvent = false;
        state.eventError = action.payload;
      })

      // --- Update Recruiter History Status ---
      .addCase(updateRecruiterHistoryStatus.pending, (state) => {
        state.updatingStatus = true;
        state.statusError = null;
      })
      .addCase(updateRecruiterHistoryStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        state.lastProcessedEvent = action.payload.data;
      })
      .addCase(updateRecruiterHistoryStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.statusError = action.payload;
      });
  },
});

export const { clearRecruiterEventErrors, resetLastProcessedEvent } =
  recruiterEventsSlice.actions;

export default recruiterEventsSlice.reducer;
