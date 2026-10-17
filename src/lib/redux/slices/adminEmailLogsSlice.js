
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.message ||
  fallback;

function normalizeListResponse(payload, previousPagination) {
  // Supports { logs, pagination }, { data: { logs, pagination } },
  // and legacy { data: [...], pagination } responses.
  const root =
    payload?.data && !Array.isArray(payload.data)
      ? payload.data
      : payload;

  const logs = Array.isArray(root?.logs)
    ? root.logs
    : Array.isArray(root?.data)
      ? root.data
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  const incoming = root?.pagination ?? payload?.pagination ?? {};
  const page = Number(incoming.page ?? previousPagination.page ?? 1);
  const limit = Number(incoming.limit ?? previousPagination.limit ?? 20);
  const total = Number(incoming.total ?? previousPagination.total ?? logs.length);
  const totalPages = Number(
    incoming.totalPages ??
      Math.ceil(total / Math.max(1, limit))
  );

  return {
    logs,
    pagination: {
      total: Number.isFinite(total) ? total : 0,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
      totalPages:
        Number.isFinite(totalPages) && totalPages >= 0 ? totalPages : 0,
      hasNextPage:
        incoming.hasNextPage ?? page < totalPages,
      hasPreviousPage:
        incoming.hasPreviousPage ?? page > 1,
    },
  };
}

export const fetchAdminEmailLogs = createAsyncThunk(
  "adminEmailLogs/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/email-logs", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch email logs")
      );
    }
  }
);

export const deleteAdminEmailLog = createAsyncThunk(
  "adminEmailLogs/delete",
  async (emailLogId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/api/admin/email-logs/${encodeURIComponent(emailLogId)}`
      );

      return { emailLogId, response: response.data };
    } catch (error) {
      return rejectWithValue({
        emailLogId,
        message: getErrorMessage(error, "Failed to delete email log"),
      });
    }
  }
);

const initialState = {
  emailLogs: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  loadingList: false,
  deletingEmailLogIds: [],
  errorList: null,
  deleteErrors: {},
  requestId: null,
};

const adminEmailLogsSlice = createSlice({
  name: "adminEmailLogs",
  initialState,

  reducers: {
    clearAdminEmailLogsErrors(state) {
      state.errorList = null;
      state.deleteErrors = {};
    },

    clearAdminEmailLogDeleteError(state, action) {
      delete state.deleteErrors[action.payload];
    },

    resetAdminEmailLogs: () => ({
      ...initialState,
      emailLogs: [],
      pagination: { ...initialState.pagination },
      deletingEmailLogIds: [],
      deleteErrors: {},
    }),
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminEmailLogs.pending, (state, action) => {
        state.loadingList = true;
        state.errorList = null;
        state.requestId = action.meta.requestId;
      })

      .addCase(fetchAdminEmailLogs.fulfilled, (state, action) => {
        // Ignore an older request that completed after a newer one.
        if (state.requestId !== action.meta.requestId) return;

        state.loadingList = false;
        state.requestId = null;

        const normalized = normalizeListResponse(
          action.payload,
          state.pagination
        );

        state.emailLogs = normalized.logs;
        state.pagination = normalized.pagination;
      })

      .addCase(fetchAdminEmailLogs.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;

        state.loadingList = false;
        state.requestId = null;
        state.errorList =
          action.payload ||
          action.error?.message ||
          "Failed to fetch email logs";
      })

      .addCase(deleteAdminEmailLog.pending, (state, action) => {
        const id = action.meta.arg;

        if (!state.deletingEmailLogIds.includes(id)) {
          state.deletingEmailLogIds.push(id);
        }

        delete state.deleteErrors[id];
      })

      .addCase(deleteAdminEmailLog.fulfilled, (state, action) => {
        const { emailLogId } = action.payload;

        state.deletingEmailLogIds = state.deletingEmailLogIds.filter(
          (id) => id !== emailLogId
        );

        const existed = state.emailLogs.some(
          (log) => log.id === emailLogId
        );

        state.emailLogs = state.emailLogs.filter(
          (log) => log.id !== emailLogId
        );

        if (existed) {
          state.pagination.total = Math.max(
            0,
            state.pagination.total - 1
          );
        }

        state.pagination.totalPages = Math.ceil(
          state.pagination.total /
            Math.max(1, state.pagination.limit)
        );

        state.pagination.hasNextPage =
          state.pagination.page < state.pagination.totalPages;

        state.pagination.hasPreviousPage =
          state.pagination.page > 1;
      })

      .addCase(deleteAdminEmailLog.rejected, (state, action) => {
        const id = action.meta.arg;

        state.deletingEmailLogIds = state.deletingEmailLogIds.filter(
          (item) => item !== id
        );

        state.deleteErrors[id] =
          action.payload?.message ||
          action.error?.message ||
          "Failed to delete email log";
      });
  },
});

export const {
  clearAdminEmailLogsErrors,
  clearAdminEmailLogDeleteError,
  resetAdminEmailLogs,
} = adminEmailLogsSlice.actions;

export default adminEmailLogsSlice.reducer;