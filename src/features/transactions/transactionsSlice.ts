/**
 * AUTO-FILE-COMMENT: src/features/transactions/transactionsSlice.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type Transaction = {
  _id: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: string;
};

type TransactionsState = {
  items: Transaction[];
  loading: boolean;
  error: string | null;
};

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "transactions/fetch",
  async () => {
    const res = await fetch("/api/transactions");
    const json = await res.json();
    return json.transactions ?? [];
  }
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load transactions";
      });
  },
});

export default transactionsSlice.reducer;
