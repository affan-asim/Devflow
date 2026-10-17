
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.message ||
  fallback;

export const fetchAdminFiles = createAsyncThunk(
  "adminFiles/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/files", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch files")
      );
    }
  }
);

export const deleteAdminFile = createAsyncThunk(
  "adminFiles/delete",
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/api/admin/files/${encodeURIComponent(fileId)}`
      );

      return { fileId, response: response.data };
    } catch (error) {
      return rejectWithValue({
        fileId,
        message: getErrorMessage(error, "Failed to delete file"),
      });
    }
  }
);

const initialState = {
  files: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  loadingList: false,
  deletingFileIds: [],
  errorList: null,
  deleteErrors: {},
  requestId: null,
};

const adminFilesSlice = createSlice({
  name: "adminFiles",
  initialState,
  reducers: {
    clearAdminFilesErrors(state) {
      state.errorList = null;
      state.deleteErrors = {};
    },
    clearAdminFileDeleteError(state, action) {
      delete state.deleteErrors[action.payload];
    },
    resetAdminFiles: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminFiles.pending, (state, action) => {
        state.loadingList = true;
        state.errorList = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchAdminFiles.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;

        state.loadingList = false;
        state.requestId = null;

        // The route returns { data: File[], pagination }, while supporting
        // object-shaped envelopes keeps this slice compatible with wrappers.
        const payload = action.payload;
        const body = payload?.data ?? payload;

        state.files = Array.isArray(body)
          ? body
          : Array.isArray(body?.files)
            ? body.files
            : Array.isArray(body?.data)
              ? body.data
              : Array.isArray(payload?.files)
                ? payload.files
                : [];

        const pagination =
          (Array.isArray(body) ? null : body?.pagination) ??
          payload?.pagination;

        if (pagination) {
          const page = Number(pagination.page ?? 1);
          const limit = Number(pagination.limit ?? 20);
          const total = Number(pagination.total ?? 0);
          const totalPages = Number(
            pagination.totalPages ??
              Math.ceil(total / Math.max(1, limit))
          );

          state.pagination = {
            total,
            page,
            limit,
            totalPages,
            hasNextPage:
              pagination.hasNextPage ?? page < totalPages,
            hasPreviousPage:
              pagination.hasPreviousPage ?? page > 1,
          };
        } else {
          state.pagination = {
            ...state.pagination,
            total: state.files.length,
            totalPages: state.files.length ? 1 : 0,
          };
        }
      })
      .addCase(fetchAdminFiles.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;

        state.loadingList = false;
        state.requestId = null;
        state.errorList =
          action.payload || action.error?.message || "Failed to fetch files";
      })
      .addCase(deleteAdminFile.pending, (state, action) => {
        const fileId = action.meta.arg;

        if (!state.deletingFileIds.includes(fileId)) {
          state.deletingFileIds.push(fileId);
        }

        delete state.deleteErrors[fileId];
      })
      .addCase(deleteAdminFile.fulfilled, (state, action) => {
        const { fileId } = action.payload;

        state.deletingFileIds = state.deletingFileIds.filter(
          (id) => id !== fileId
        );

        state.files = state.files.filter((file) => file.id !== fileId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);

        state.pagination.totalPages = Math.ceil(
          state.pagination.total / Math.max(1, state.pagination.limit)
        );

        // Keep page 1 when the result set becomes empty.
        if (
          state.pagination.page > state.pagination.totalPages &&
          state.pagination.totalPages > 0
        ) {
          state.pagination.page = state.pagination.totalPages;
        } else if (state.pagination.totalPages === 0) {
          state.pagination.page = 1;
        }
      })
      .addCase(deleteAdminFile.rejected, (state, action) => {
        const fileId = action.meta.arg;

        state.deletingFileIds = state.deletingFileIds.filter(
          (id) => id !== fileId
        );

        state.deleteErrors[fileId] =
          action.payload?.message ||
          action.error?.message ||
          "Failed to delete file";
      });
  },
});

export const {
  clearAdminFilesErrors,
  clearAdminFileDeleteError,
  resetAdminFiles,
} = adminFilesSlice.actions;

export default adminFilesSlice.reducer;
