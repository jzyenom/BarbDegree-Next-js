/**
 * AUTO-FILE-COMMENT: src/features/admin/adminBarbersSlice.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type AdminBarber = {
  _id: string;
  isSubscribed: boolean;
  subscriptionActive?: boolean;
  subscriptionStatus?: "inactive" | "active" | "cancelled";
  adminSubscriptionOverride?: boolean;
  adminForcedSubscriptionStatus?: boolean;
  userId?: { _id?: string; email?: string; name?: string };
};

type AdminBarbersState = {
  items: AdminBarber[];
  loading: boolean;
  error: string | null;
};

const initialState: AdminBarbersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAdminBarbers = createAsyncThunk(
  "adminBarbers/fetch",
  async () => {
    const res = await fetch("/api/admin/barbers");
    const json = await res.json();
    return json.barbers ?? [];
  }
);

export const updateAdminBarberSubscription = createAsyncThunk(
  "adminBarbers/updateSubscription",
  async ({ barberId, isSubscribed }: { barberId: string; isSubscribed: boolean }) => {
    const res = await fetch("/api/admin/subscriptions/toggle-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barberId,
        enabled: true,
        forcedStatus: isSubscribed,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update subscription");
    return json.barber as AdminBarber;
  }
);

const adminBarbersSlice = createSlice({
  name: "adminBarbers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminBarbers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBarbers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminBarbers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load barbers";
      })
      .addCase(updateAdminBarberSubscription.fulfilled, (state, action) => {
        const index = state.items.findIndex((b) => b._id === action.payload._id);
        if (index >= 0) state.items[index] = action.payload;
      });
  },
});

export default adminBarbersSlice.reducer;
