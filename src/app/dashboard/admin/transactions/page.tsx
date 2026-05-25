"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AdminPageShell, {
  AdminEmptyState,
  AdminStatusBadge,
  formatAdminDate,
} from "@/components/admin/AdminPageShell";
import { formatNaira } from "@/lib/format";

type UserSummary = {
  _id?: string;
  name?: string;
  email?: string;
};

type TransactionBooking = {
  _id?: string;
  service?: string;
  dateTime?: string;
};

type AdminTransaction = {
  _id: string;
  amount?: number;
  currency?: string;
  reference?: string;
  status?: string;
  provider?: string;
  type?: string;
  createdAt?: string;
  userId?: UserSummary | string | null;
  bookingId?: TransactionBooking | string | null;
};

type TransactionsResponse = {
  transactions?: AdminTransaction[];
  error?: string;
};

function displayUser(user?: UserSummary | string | null) {
  if (!user) return "Unknown";
  if (typeof user === "string") return user;
  return user.name || user.email || "Unknown";
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (status) query.set("status", status);
    if (type) query.set("type", type);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    query.set("limit", "300");

    try {
      const res = await fetch(`/api/admin/transactions?${query.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as TransactionsResponse;
      if (!res.ok) throw new Error(json.error || "Failed to load transactions");
      setTransactions(json.transactions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [from, search, status, to, type]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const successfulRevenue = useMemo(
    () =>
      transactions.reduce(
        (sum, tx) => sum + (tx.status === "success" ? tx.amount ?? 0 : 0),
        0
      ),
    [transactions]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadTransactions();
  }

  return (
    <AdminPageShell
      title="Transactions"
      subtitle="Audit Paystack booking payments and barber subscription transactions."
    >
      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            {/* show text */}
            <p className="text-sm text-slate-500">Loaded transactions</p>
            {/* show text */}
            <p className="mt-2 text-2xl font-bold">{transactions.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            {/* show text */}
            <p className="text-sm text-slate-500">Successful revenue</p>
            {/* show text */}
            <p className="mt-2 text-2xl font-bold">{formatNaira(successfulRevenue)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            {/* show text */}
            <p className="text-sm text-slate-500">Pending</p>
            {/* show text */}
            <p className="mt-2 text-2xl font-bold">
              {transactions.filter((tx) => tx.status === "pending").length}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_160px_190px_150px_150px_auto]"
        >
          {/* show an input field */}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reference or user"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#f2800d]"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            {/* show one choice */}
            <option value="">All statuses</option>
            {/* show one choice */}
            <option value="pending">Pending</option>
            {/* show one choice */}
            <option value="success">Success</option>
            {/* show one choice */}
            <option value="failed">Failed</option>
          </select>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            {/* show one choice */}
            <option value="">All types</option>
            {/* show one choice */}
            <option value="booking_payment">Booking payment</option>
            {/* show one choice */}
            <option value="barber_subscription">Barber subscription</option>
          </select>
          {/* show an input field */}
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm"
          />
          {/* show an input field */}
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm"
          />
          <button className="h-11 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white">
            Apply
          </button>
        </form>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          // show text
          <p className="text-sm text-slate-500">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <AdminEmptyState>No transactions found.</AdminEmptyState>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                {/* show table headings */}
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Reference</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                {/* show table rows */}
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="align-top">
                      <td className="px-4 py-3">
                        {/* show text */}
                        <p className="break-all font-medium">
                          {tx.reference || tx._id}
                        </p>
                        {/* show text */}
                        <p className="mt-1 text-xs text-slate-500">
                          {tx.provider || "paystack"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {displayUser(tx.userId)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {tx.type || "booking_payment"}
                      </td>
                      <td className="px-4 py-3">
                        <AdminStatusBadge value={tx.status || "pending"} />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatNaira(tx.amount ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatAdminDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
