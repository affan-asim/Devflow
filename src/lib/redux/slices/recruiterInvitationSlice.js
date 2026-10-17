import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error || error.message || fallback;

// Company side: create an invitation and fetch the company's paginated list.
export const createRecruiterInvitation = createAsyncThunk(
  "recruiterInvitations/create",
  async (invitationData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/company/invite", invitationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create recruiter invitation"));
    }
  }
);

export const fetchRecruiterInvitations = createAsyncThunk(
  "recruiterInvitations/fetchList",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/company/invite?type=${data.type}`, { params: data.params });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch recruiter invitations"));
    }
  }
);

// Recruiter side: fetch one invitation, claim email invitations, and accept/reject.
export const fetchRecruiterInvitationById = createAsyncThunk(
  "recruiterInvitations/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/company/invite/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch recruiter invitation"));
    }
  }
);

export const claimRecruiterInvitations = createAsyncThunk(
  "recruiterInvitations/claim",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/company/invite/claim");
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to claim recruiter invitations"));
    }
  }
);

export const respondToRecruiterInvitation = createAsyncThunk(
  "recruiterInvitations/respond",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/company/invite/${id}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to respond to recruiter invitation"));
    }
  }
);

const initialState = {
  invitations: [],
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentInvitation: null,
  claimedInvitations: [],
  loadingList: false,
  loadingDetail: false,
  submitting: false,
  errorList: null,
  errorDetail: null,
  submitError: null,
};

const recruiterInvitationSlice = createSlice({
  name: "recruiterInvitations",
  initialState,
  reducers: {
    clearCurrentRecruiterInvitation: (state) => {
      state.currentInvitation = null;
      state.errorDetail = null;
    },
    clearRecruiterInvitationErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecruiterInvitations.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchRecruiterInvitations.fulfilled, (state, action) => {
        state.loadingList = false;
        state.invitations = action.payload.data?.invitations || [];
        state.metadata = action.payload.data?.metadata || initialState.metadata;
      })
      .addCase(fetchRecruiterInvitations.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })
      .addCase(fetchRecruiterInvitationById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchRecruiterInvitationById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentInvitation = action.payload.data;
      })
      .addCase(fetchRecruiterInvitationById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })
      .addCase(createRecruiterInvitation.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createRecruiterInvitation.fulfilled, (state, action) => {
        state.submitting = false;
        const created = action.payload.data;
        if (created && !state.invitations.some(({ id }) => id === created.id)) {
          state.invitations.unshift(created);
        }
      })
      .addCase(createRecruiterInvitation.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })
      .addCase(claimRecruiterInvitations.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(claimRecruiterInvitations.fulfilled, (state, action) => {
        state.submitting = false;
        state.claimedInvitations = action.payload.data || [];
        for (const invitation of state.claimedInvitations) {
          if (!state.invitations.some(({ id }) => id === invitation.id)) {
            state.invitations.unshift(invitation);
          }
        }
      })
      .addCase(claimRecruiterInvitations.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })
      .addCase(respondToRecruiterInvitation.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(respondToRecruiterInvitation.fulfilled, (state, action) => {
        state.submitting = false;
        const updated = action.payload.data;
        if (updated) {
          state.invitations = state.invitations.map((invitation) =>
            invitation.id === updated.id ? { ...invitation, ...updated } : invitation
          );
          if (state.currentInvitation?.id === updated.id) {
            state.currentInvitation = { ...state.currentInvitation, ...updated };
          }
        }
      })
      .addCase(respondToRecruiterInvitation.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearCurrentRecruiterInvitation, clearRecruiterInvitationErrors } =
  recruiterInvitationSlice.actions;

// Service-aligned names for callers that follow the recruiter history API names.
export {
  createRecruiterInvitation as createInvitation,
  fetchRecruiterInvitations as getCompanyRecruiterInvitations,
  fetchRecruiterInvitationById as getRecruiterInvitationDetail,
  claimRecruiterInvitations as claimExternalRecruiterInvitations,
  respondToRecruiterInvitation as recievedInvitation,
};

export default recruiterInvitationSlice.reducer;
