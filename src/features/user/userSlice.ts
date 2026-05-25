import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type UserProfile = {
  _id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
};

export type ClientProfile = {
  whatsapp?: string;
  mobile?: string;
  country?: string;
  state?: string;
  address?: string;
};

export type BarberService = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
  isActive?: boolean;
};

export type BarberProfile = {
  _id?: string;
  whatsapp?: string;
  mobile?: string;
  country?: string;
  state?: string;
  address?: string;
  bio?: string;
  exp?: string;
  charge?: string;
  avatar?: string;
  isSubscribed?: boolean;
  services?: BarberService[];
};

type UserState = {
  user: UserProfile | null;
  client: ClientProfile | null;
  barber: BarberProfile | null;
  loading: boolean;
  error: string | null;
};

const initialState: UserState = {
  user: null,
  client: null,
  barber: null,
  loading: false,
  error: null,
};

export const fetchMe = createAsyncThunk("user/fetchMe", async () => {
  const res = await fetch("/api/me");
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error ?? "Failed to load profile");
  }
  return json as { user: UserProfile; client: ClientProfile; barber: BarberProfile };
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.client = action.payload.client;
        state.barber = action.payload.barber;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load profile";
      });
  },
});

export default userSlice.reducer;
