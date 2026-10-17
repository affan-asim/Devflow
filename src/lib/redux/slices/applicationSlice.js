import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Developer: Submit job application
 */
export const createApplication = createAsyncThunk(
  "applications/createApplication",
  async (applicationData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/applications", applicationData);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to submit application"
      );
    }
  }
);

/**
 * Developer: Fetch applied job listings with status filter & pagination
 */
export const fetchDeveloperApplications = createAsyncThunk(
  "applications/fetchDeveloperApplications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/applications", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch developer applications"
      );
    }
  }
);

/**
 * Recruiter: Fetch job applications for verified company postings
 * FIXED: Pointed to /api/applications (handled via backend userRole check)
 */
export const fetchRecruiterApplications = createAsyncThunk(
  "applications/fetchRecruiterApplications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/applications", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch company applications"
      );
    }
  }
);

/**
 * Developer: Get single application details
 */
export const fetchDeveloperApplicationById = createAsyncThunk(
  "applications/fetchDeveloperApplicationById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/applications/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch application details"
      );
    }
  }
);

/**
 * Recruiter: Get single application details
 * FIXED: Pointed to /api/applications/${id} (handled via backend userRole check)
 */
export const fetchRecruiterApplicationById = createAsyncThunk(
  "applications/fetchRecruiterApplicationById",
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/applications/${id}`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch application details"
      );
    }
  }
);

/**
 * Developer: Update resume/cover letter on PENDING applications
 */
export const updateApplication = createAsyncThunk(
  "applications/updateApplication",
  async ({ id, resumeTempKey, coverLetterTempKey }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/applications/${id}`, {
        resumeTempKey,
        coverLetterTempKey,
      });
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to update application"
      );
    }
  }
);

/**
 * Developer: Withdraw/Delete a PENDING application
 */
export const deleteApplication = createAsyncThunk(
  "applications/deleteApplication",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/applications/${id}`);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to delete application"
      );
    }
  }
);

/**
 * Recruiter: Advance status (PENDING -> REVIEW -> ACCEPTED/REJECTED) & optionally pass hire details
 */
export const updateApplicationStatus = createAsyncThunk(
  "applications/updateApplicationStatus",
  async ({ id, ...statusData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/applications/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to update application status"
      );
    }
  }
);

/**
 * Admin: Fetch application management records with full filters
 * FIXED: Typo `/api/admin/applicationss` -> `/api/admin/applications`
 */
export const fetchAdminApplications = createAsyncThunk(
  "applications/fetchAdminApplications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/applications", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch admin applications"
      );
    }
  }
);

/**
 * Admin: Fetch complete application detail with attached keys & user verifications
 * FIXED: Typo `/api/admin/applicationss/${id}` -> `/api/admin/applications/${id}`
 */
export const fetchAdminApplicationById = createAsyncThunk(
  "applications/fetchAdminApplicationById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/applications/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to fetch admin application detail"
      );
    }
  }
);

// ==========================================
// INITIAL STATE & SLICE (Unchanged)
// ==========================================

const initialState = {
  applications: [],
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentApplication: null,

  loadingList: false,
  loadingDetail: false,
  submitting: false,

  errorList: null,
  errorDetail: null,
  submitError: null,
};

const applicationSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
      state.errorDetail = null;
    },
    clearApplicationErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Developer Applications ---
      .addCase(fetchDeveloperApplications.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchDeveloperApplications.fulfilled, (state, action) => {
        state.loadingList = false;
        state.applications = action.payload.data?.applications || action.payload.applications || [];
        state.metadata = action.payload.data?.metadata || state.metadata;
      })
      .addCase(fetchDeveloperApplications.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Recruiter Applications ---
      .addCase(fetchRecruiterApplications.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchRecruiterApplications.fulfilled, (state, action) => {
        state.loadingList = false;
        state.applications = action.payload.data?.applications || action.payload.applications || [];
        state.metadata = action.payload.data?.metadata || state.metadata;
      })
      .addCase(fetchRecruiterApplications.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Admin Applications ---
      .addCase(fetchAdminApplications.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchAdminApplications.fulfilled, (state, action) => {
        state.loadingList = false;
        // The admin route returns the array as `data` and pagination beside it.
        // Keep accepting the nested service shape for compatibility with callers
        // that return `{ data: { applications, pagination } }`.
        const responseData = action.payload?.data;
        state.applications = Array.isArray(responseData)
          ? responseData
          : responseData?.applications || action.payload?.applications || [];

        const pag =
          action.payload?.pagination ||
          responseData?.pagination ||
          action.payload?.applications?.pagination;
        if (pag) {
          state.metadata = {
            currentPage: pag.page ?? pag.currentPage,
            pageSize: pag.limit ?? pag.pageSize,
            totalCount: pag.total ?? pag.totalCount,
            totalPages: pag.totalPages,
            hasNextPage:
              pag.hasNextPage ??
              (pag.page ?? pag.currentPage) < pag.totalPages,
            hasPreviousPage:
              pag.hasPreviousPage ?? (pag.page ?? pag.currentPage) > 1,
          };
        }
      })
      .addCase(fetchAdminApplications.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Application Detail ---
      .addCase(fetchDeveloperApplicationById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchDeveloperApplicationById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentApplication = action.payload.data;
      })
      .addCase(fetchDeveloperApplicationById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })
      .addCase(fetchRecruiterApplicationById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchRecruiterApplicationById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentApplication = action.payload.data;
      })
      .addCase(fetchRecruiterApplicationById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      .addCase(fetchAdminApplicationById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
        state.currentApplication = null;
      })
      .addCase(fetchAdminApplicationById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentApplication = action.payload?.data ?? null;
      })
      .addCase(fetchAdminApplicationById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail =
          action.payload || action.error?.message || "Failed to load application";
        state.currentApplication = null;
      })
      

      // --- Submit Application ---
      .addCase(createApplication.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.submitting = false;
        const created = action.payload.data;
        if (created) {
          state.applications.unshift(created);
        }
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Update Application ---
      .addCase(updateApplication.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateApplication.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Delete Application ---
      .addCase(deleteApplication.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.submitting = false;
        const deletedId = action.payload.id;
        state.applications = state.applications.filter((app) => app.id !== deletedId);
        if (state.currentApplication?.id === deletedId) {
          state.currentApplication = null;
        }
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Update Application Status ---
      .addCase(updateApplicationStatus.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data?.updatedApplication;
        if (updated) {
          state.applications = state.applications.map((app) =>
            app.id === updated.id ? { ...app, ...updated } : app
          );
          if (state.currentApplication?.id === updated.id) {
            state.currentApplication = {
              ...state.currentApplication,
              ...updated,
            };
          }
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearCurrentApplication, clearApplicationErrors } =
  applicationSlice.actions;
export default applicationSlice.reducer;
