
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export const fetchAdminHealthMetrics = createAsyncThunk(
  "adminHealth/fetchMetrics",
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await api.get("/api/admin/health", {
        signal,
        timeout: 10000,
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 503,
      });

      const metrics = response.data?.data;

      if (
        !metrics ||
        typeof metrics !== "object" ||
        !metrics.services ||
        !["HEALTHY", "DEGRADED"].includes(metrics.status)
      ) {
        return rejectWithValue("The health endpoint returned invalid metrics.");
      }

      return metrics;
    } catch (error) {
      if (error?.code === "ERR_CANCELED") {
        throw error;
      }

      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch system health metrics")
      );
    }
  }
);

const initialState = {
  metrics: null,
  loading: false,
  error: null,
  lastFetchedAt: null,
  requestId: null,
};

const adminHealthSlice = createSlice({
  name: "adminHealth",
  initialState,
  reducers: {
    clearAdminHealthError(state) {
      state.error = null;
    },
    resetAdminHealth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminHealthMetrics.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchAdminHealthMetrics.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;

        state.metrics = action.payload;
        state.lastFetchedAt = new Date().toISOString();
        state.loading = false;
        state.error = null;
        state.requestId = null;
      })
      .addCase(fetchAdminHealthMetrics.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;

        state.loading = false;
        state.requestId = null;

        if (action.meta.aborted) return;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch system health metrics";
      });
  },
});

export const { clearAdminHealthError, resetAdminHealth } =
  adminHealthSlice.actions;

export default adminHealthSlice.reducer;