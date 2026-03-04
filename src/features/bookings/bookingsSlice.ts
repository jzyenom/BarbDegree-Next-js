import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type Booking = {
  _id: string;
  service: string;
  services?: { name: string; price?: number; durationMinutes?: number }[];
  dateTime: string;
  status?: string;
  paymentStatus?: string;
  estimatedPrice?: number;
  amountPaid?: number;
  barberId?: any;
};

type BookingsState = {
  items: Booking[];
  loading: boolean;
  error: string | null;
};

const initialState: BookingsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  "bookings/fetch",
  async (params?: { service?: string; from?: string; to?: string }) => {
    const query = new URLSearchParams();
    if (params?.service) query.set("service", params.service);
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);

    const url = query.toString() ? `/api/bookings?${query}` : "/api/bookings";
    const res = await fetch(url);
    const json = await res.json();
    return json.bookings ?? [];
  }
);

export const updateBooking = createAsyncThunk(
  "bookings/update",
  async ({ id, data }: { id: string; data: Partial<Booking> }) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.booking as Booking;
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load bookings";
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        const index = state.items.findIndex((b) => b._id === action.payload._id);
        if (index >= 0) state.items[index] = action.payload;
      });
  },
});

export default bookingsSlice.reducer;
