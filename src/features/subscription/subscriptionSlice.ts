import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type SubscriptionState = {
  isSubscribed: boolean | null;
  loading: boolean;
  error: string | null;
};

const initialState: SubscriptionState = {
  isSubscribed: null,
  loading: false,
  error: null,
};

export const fetchSubscription = createAsyncThunk(
  "subscription/fetch",
  async () => {
    const res = await fetch("/api/barber/subscription");
    const json = await res.json();
    return json.isSubscribed as boolean;
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.isSubscribed = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load subscription";
      });
  },
});

export default subscriptionSlice.reducer;
