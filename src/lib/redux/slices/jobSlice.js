import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Public: Fetch job listings with search/filters (location, experienceLevel, employmentType, status, isFeatured, companyId, search, sort, page, limit)
 */
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/jobs", { params });
      return response.data; // Expects { success: true, data: { jobs: [], metadata: {} } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || error|| "Failed to fetch jobs"
      );
    }
  }
);

export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || error|| "Failed to fetch job details"
      );
    }
  }
);

/** Admin: Fetch job details, including the admin-only application stats. */
export const fetchJobByAdmin = createAsyncThunk(
  "jobs/fetchJobByAdmin",
  async (jobId, { rejectWithValue, signal }) => {
    try {
      const response = await api.get(`/api/admin/jobs/${jobId}`, { signal });
      return response.data;
    } catch (error) {
      if (error?.name === "CanceledError" || error?.name === "AbortError") {
        throw error;
      }
      return rejectWithValue(
        error?.response?.data?.error ||
          (typeof error === "string" ? error : "Failed to fetch job details")
      );
    }
  }
);

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/jobs", jobData);
      return response.data;
    } catch (error) {
      console.log(error)
      return rejectWithValue(
        error.response?.data?.error || error.message || error || "Failed to create job posting"
      );
    }
  }
);
export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ id, ...jobData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || error || "Failed to update job posting"
      );
    }
  }
);

/**
 * Recruiter: Update job status (DRAFT -> ACTIVE, ACTIVE -> CLOSED/EXPIRED)
 */
export const updateJobStatus = createAsyncThunk(
  "jobs/updateJobStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/jobs/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || error || "Failed to update job status"
      );
    }
  }
);

/**
 * Recruiter: Delete job posting
 */
export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/jobs/${jobId}`);
      return { id: jobId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || error|| "Failed to delete job"
      );
    }
  }
);

/**
 * Admin: Toggle featured status
 */
export const updateJobFeaturedStatus = createAsyncThunk(
  "jobs/updateJobFeaturedStatus",
  async ({ jobId, isFeatured }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/jobs/${jobId}/featured`, { isFeatured });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || error|| "Failed to update featured status"
      );
    }
  }
);

/**
 * Admin: Force delete job posting
 */
export const deleteJobByAdmin = createAsyncThunk(
  "jobs/deleteJobByAdmin",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/admin/jobs/${jobId}`);
      return { id: jobId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || error|| "Failed to delete job by admin"
      );
    }
  }
);

export const fetchAdminJobs = createAsyncThunk(
  "jobs/fetchAdminJobs",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const response = await api.get("/api/admin/jobs", {
        params,
        signal,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || error|| "Failed to fetch admin jobs"
      );
    }
  }
);


// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  jobs: [],
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentJob: null,

  // Loading states
  loadingList: false,
  loadingDetail: false,
  submitting: false,

  // Error states
  errorList: null,
  errorDetail: null,
  submitError: null,

  adminStats: {
    totalJobs: 0,
    featuredCount: 0,
    activeCount: 0,
    draftCount: 0,
  },
};

// ==========================================
// SLICE
// ==========================================

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
      state.errorDetail = null;
    },
    clearJobErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Jobs List ---
      .addCase(fetchJobs.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loadingList = false;
        state.jobs = action.payload.data?.jobs || action.payload.jobs || [];
        state.metadata = action.payload.data?.metadata || state.metadata;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Single Job Detail ---
      .addCase(fetchJobById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentJob = action.payload.data;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // --- Admin: Fetch Single Job Detail ---
      .addCase(fetchJobByAdmin.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchJobByAdmin.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentJob = action.payload.data || null;
      })
      .addCase(fetchJobByAdmin.rejected, (state, action) => {
        state.loadingDetail = false;
        if (!action.meta?.aborted) {
          state.errorDetail = action.payload;
        }
      })

      // --- Create Job ---
      .addCase(createJob.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.submitting = false;
        const created = action.payload.data;
        if (created) {
          state.jobs.unshift(created);
        }
      })
      .addCase(createJob.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Update Job ---
      .addCase(updateJob.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        if (updated) {
          state.jobs = state.jobs.map((j) => (j.id === updated.id ? updated : j));
          if (state.currentJob?.id === updated.id) {
            state.currentJob = { ...state.currentJob, ...updated };
          }
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Update Job Status ---
      .addCase(updateJobStatus.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        state.submitting = false;
      
        const updated = action.payload.data;
      
        if (updated) {
          state.jobs = state.jobs.map((job) =>
            job.id === updated.id
              ? {
                  ...job,
                  status: updated.status,
                }
              : job
          );
      
          if (state.currentJob?.id === updated.id) {
            state.currentJob = {
              ...state.currentJob,
              status: updated.status,
            };
          }
        }
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Delete Job (Recruiter) ---
      .addCase(deleteJob.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.submitting = false;
      
        const deletedId = action.payload.id;
      
        state.jobs = state.jobs.filter(
          (job) => job.id !== deletedId
        );
      
        if (state.currentJob?.id === deletedId) {
          state.currentJob = null;
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Admin: Toggle Featured ---
      .addCase(updateJobFeaturedStatus.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateJobFeaturedStatus.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        if (updated) {
          state.jobs = state.jobs.map((j) =>
            j.id === updated.id ? { ...j, isFeatured: updated.isFeatured } : j
          );
          if (state.currentJob?.id === updated.id) {
            state.currentJob.isFeatured = updated.isFeatured;
          }
        }
      })
      .addCase(updateJobFeaturedStatus.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Admin: Delete Job ---
      .addCase(deleteJobByAdmin.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(deleteJobByAdmin.fulfilled, (state, action) => {
        state.submitting = false;
        const deletedId = action.payload.id;
        state.jobs = state.jobs.filter((j) => j.id !== deletedId);
        if (state.currentJob?.id === deletedId) {
          state.currentJob = null;
        }
      })
      .addCase(deleteJobByAdmin.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      .addCase(fetchAdminJobs.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchAdminJobs.fulfilled, (state, action) => {
        state.loadingList = false;
      
        const result = action.payload?.data || {};
      
        state.jobs = result.jobs || [];
        state.metadata = result.metadata || state.metadata;
        state.adminStats = result.stats || state.adminStats;
      })
      .addCase(fetchAdminJobs.rejected, (state, action) => {
        state.loadingList = false;
        if (!action.meta.aborted) {
          state.errorList = action.payload || action.error.message;
        }
      })
  },
});

export const { clearCurrentJob, clearJobErrors } = jobSlice.actions;
export default jobSlice.reducer;
