import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Notification = {
  _id: string;
  title: string;
  message: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
};

type NotificationsState = {
  items: Notification[];
  loading: boolean;
  error: string | null;
};

const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    const res = await fetch("/api/notifications");
    const json = await res.json();
    return json.notifications ?? [];
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id: string) => {
    const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error ?? "Failed to mark notification as read");
    }
    return json.notification as Notification;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load notifications";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        if (!action.payload?._id) return;
        const index = state.items.findIndex((n) => n._id === action.payload._id);
        if (index >= 0) state.items[index] = action.payload;
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
