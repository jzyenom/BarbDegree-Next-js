/**
 * AUTO-FILE-COMMENT: src/features/services/servicesSlice.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type Service = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
  isActive?: boolean;
};

type ServicesState = {
  items: Service[];
  loading: boolean;
  error: string | null;
};

const initialState: ServicesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  "services/fetch",
  async (barberId?: string) => {
    const url = barberId ? `/api/services?barberId=${barberId}` : "/api/services";
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to load services");
    }

    const services = Array.isArray(json.services) ? json.services : [];
    return services.filter(
      (service: unknown): service is Service =>
        Boolean(
          service &&
            typeof service === "object" &&
            "_id" in service &&
            service._id
        )
    );
  }
);

export const createService = createAsyncThunk(
  "services/create",
  async (payload: Omit<Service, "_id">) => {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.service) {
      throw new Error(json.error ?? "Failed to create service");
    }

    return json.service as Service;
  }
);

export const updateService = createAsyncThunk(
  "services/update",
  async ({ id, data }: { id: string; data: Partial<Service> }) => {
    const res = await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.service) {
      throw new Error(json.error ?? "Failed to update service");
    }

    return json.service as Service;
  }
);

export const deleteService = createAsyncThunk(
  "services/delete",
  async (id: string) => {
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? "Failed to delete service");
    }

    return id;
  }
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load services";
      })
      .addCase(createService.pending, (state) => {
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        if (action.payload?._id) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createService.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to create service";
      })
      .addCase(updateService.pending, (state) => {
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        if (!action.payload?._id) return;
        const index = state.items.findIndex((s) => s._id === action.payload._id);
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to update service";
      })
      .addCase(deleteService.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to delete service";
      });
  },
});

export default servicesSlice.reducer;
