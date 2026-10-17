import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api/axios";

// ==========================================
// THUNKS
// ==========================================

/**
 * Fetch paginated notifications for the current user (with optional isRead filter & sort)
 */
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/notifications", { params });
      return response.data; // Expects { success: true, data: { notifications: [], metadata: {} } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch notifications"
      );
    }
  }
);

/**
 * Fetch single notification detail
 */
export const fetchNotificationById = createAsyncThunk(
  "notifications/fetchNotificationById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/notifications/${id}`);
      return response.data; // Expects { success: true, data: { ...notification } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch notification details"
      );
    }
  }
);

/**
 * Mark single notification as read
 */
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/notifications/${id}/read`);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to mark notification as read"
      );
    }
  }
);

/**
 * Mark all notifications as read for current user
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch("/api/notifications/read-all");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to mark all notifications as read"
      );
    }
  }
);

/**
 * Create or upsert a new notification record
 */
export const createNotification = createAsyncThunk(
  "notifications/createNotification",
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/notifications", notificationData);
      return response.data; // Expects { success: true, data: { ...notification } }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create notification"
      );
    }
  }
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  notifications: [],
  unreadCount: 0,
  metadata: {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentNotification: null,

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

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearCurrentNotification: (state) => {
      state.currentNotification = null;
      state.errorDetail = null;
    },
    clearNotificationErrors: (state) => {
      state.errorList = null;
      state.errorDetail = null;
      state.submitError = null;
    },
    // Optional helper to push real-time notifications (e.g., via WebSockets or SSE)
    addNotificationRealtime: (state, action) => {
      if (action.payload) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Notifications ---
      .addCase(fetchNotifications.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loadingList = false;
        const list = action.payload.data?.notifications || action.payload.notifications || [];
        state.notifications = list;
        state.metadata = action.payload.data?.metadata || state.metadata;
        state.unreadCount = list.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      })

      // --- Fetch Single Notification Detail ---
      .addCase(fetchNotificationById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchNotificationById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentNotification = action.payload.data;
      })
      .addCase(fetchNotificationById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // --- Mark Single Notification as Read ---
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload.id;
        const existing = state.notifications.find((n) => n.id === id);
        if (existing && !existing.isRead) {
          existing.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        if (state.currentNotification?.id === id) {
          state.currentNotification.isRead = true;
        }
      })

      // --- Mark All Notifications as Read ---
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
        if (state.currentNotification) {
          state.currentNotification.isRead = true;
        }
      })

      // --- Create Notification ---
      .addCase(createNotification.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.submitting = false;
        const created = action.payload.data;
        if (created) {
          state.notifications.unshift(created);
          if (!created.isRead) {
            state.unreadCount += 1;
          }
        }
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const {
  clearCurrentNotification,
  clearNotificationErrors,
  addNotificationRealtime,
} = notificationSlice.actions;

export default notificationSlice.reducer;