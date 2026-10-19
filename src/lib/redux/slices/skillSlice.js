import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Public: Fetch active skills list with optional filters (name, category, sort, page, limit)
 */
export const fetchSkills = createAsyncThunk(
  "skills/fetchSkills",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/skills", { params });
      return response.data; // Expects { success: true, data: { skills: [], metadata: {} } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch skills"
      );
    }
  }
);

/**
 * Public: Fetch a single active skill by ID
 */
export const fetchSkillById = createAsyncThunk(
  "skills/fetchSkillById",
  async (skillId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/skills/${skillId}`);
      return response.data; // Expects { success: true, data: { ...skill } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch skill details"
      );
    }
  }
);

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return error.message || fallback;

  if (Array.isArray(data.details) && data.details.length > 0) {
    return data.details.map((d) => d.message || `${d.field}: invalid`).join(", ");
  }

  return data.error || data.message || error.message || fallback;
};

/**
 * Admin: Create a new skill catalog item
 */
export const createSkill = createAsyncThunk(
  "skills/createSkill",
  async (skillData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/skills/admin", skillData);
      return response.data; // Expects { success: true, data: { ...newSkill } }
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to create skill")
      );
    }
  }
);

/**
 * Admin: Update an existing skill catalog item
 */
export const updateSkill = createAsyncThunk(
  "skills/updateSkill",
  async ({ id, name, category }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/skills/admin/${id}`, { name, category });
      return response.data; // Expects { success: true, data: { ...updatedSkill } }
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update skill")
      );
    }
  }
);

/**
 * Admin: Soft delete/deactivate a skill by ID
 */
export const deleteSkill = createAsyncThunk(
  "skills/deleteSkill",
  async (skillId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/skills/admin/${skillId}`);
      return { id: skillId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to delete skill")
      );
    }
  }
);


/**
 * Admin: Fetch the full skill catalog, including inactive skills.
 * Expected response: { success: true, data: { skills: [], metadata: {} } }
 */
export const fetchAdminSkills = createAsyncThunk(
  "skills/fetchAdminSkills",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/skills/admin", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch admin skills")
      );
    }
  }
);

/**
 * Admin: Fetch one skill, including inactive records and usage information.
 */
export const fetchAdminSkillById = createAsyncThunk(
  "skills/fetchAdminSkillById",
  async (skillId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/api/skills/admin/${encodeURIComponent(skillId)}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch skill details")
      );
    }
  }
);


// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  skills: [],
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentSkill: null,

  // Loading states
  loadingList: false,
  loadingDetail: false,
  submitting: false,

  // Error states
  errorList: null,
  errorDetail: null,
  submitError: null,
};

// ==========================================
// SLICE
// ==========================================

const skillSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {
    clearCurrentSkill: (state) => {
      state.currentSkill = null;
      state.errorDetail = null;
    },
    clearSkillErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Skills List ---
      .addCase(fetchSkills.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loadingList = false;
        state.skills = action.payload.data?.skills || action.payload.skills || [];
        state.metadata = action.payload.data?.metadata || state.metadata;
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })


      .addCase(fetchAdminSkills.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchAdminSkills.fulfilled, (state, action) => {
        state.loadingList = false;
        state.skills =
          action.payload?.data?.skills ??
          action.payload?.skills ??
          [];
        state.metadata =
          action.payload?.data?.metadata ??
          action.payload?.metadata ??
          state.metadata;
      })
      .addCase(fetchAdminSkills.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload || action.error?.message;
      })
      .addCase(fetchAdminSkillById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
        state.currentSkill = null;
      })
      .addCase(fetchAdminSkillById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentSkill =
          action.payload?.data?.skill ??
          action.payload?.data ??
          action.payload?.skill ??
          null;
      })
      .addCase(fetchAdminSkillById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.currentSkill = null;
        state.errorDetail = action.payload || action.error?.message;
      })


      // --- Fetch Single Skill Detail ---
      .addCase(fetchSkillById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchSkillById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentSkill = action.payload.data;
      })
      .addCase(fetchSkillById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // --- Admin: Create Skill ---
      .addCase(createSkill.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createSkill.fulfilled, (state, action) => {
        state.submitting = false;
        const created = action.payload.data;
        if (created) {
          state.skills.unshift(created);
        }
      })
      .addCase(createSkill.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Admin: Update Skill ---
      .addCase(updateSkill.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(updateSkill.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        if (updated) {
          state.skills = state.skills.map((s) =>
            s.id === updated.id ? updated : s
          );
          if (state.currentSkill?.id === updated.id) {
            state.currentSkill = updated;
          }
        }
      })
      .addCase(updateSkill.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      // --- Admin: Delete Skill ---
      .addCase(deleteSkill.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })

      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.submitting = false;
        const deletedId = action.payload.id;
        const updated = action.payload.data?.data ?? action.payload.data?.skill ?? action.payload.data;

        if (updated && typeof updated === "object" && updated.id) {
          state.skills = state.skills.map((skill) =>
            skill.id === updated.id ? updated : skill
          );

          if (state.currentSkill?.id === updated.id) {
            state.currentSkill = updated;
          }
        } else {
          state.skills = state.skills.filter((skill) => skill.id !== deletedId);
        }
      })

      .addCase(deleteSkill.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearCurrentSkill, clearSkillErrors } = skillSlice.actions;
export default skillSlice.reducer;