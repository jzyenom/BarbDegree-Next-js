"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
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

type BarberSummary = {
  _id?: string;
  userId?: UserSummary;
  address?: string;
  state?: string;
  country?: string;
};

type AdminBooking = {
  _id: string;
  service: string;
  dateTime?: string;
  status?: string;
  paymentStatus?: string;
  estimatedPrice?: number;
  amountPaid?: number;
  name?: string;
  email?: string;
  paymentReference?: string;
  clientId?: UserSummary | string | null;
  barberId?: BarberSummary | string | null;
};

type BookingsResponse = {
  bookings?: AdminBooking[];
  error?: string;
};

function displayUser(user?: UserSummary | string | null) {
  if (!user) return "Unknown";
  if (typeof user === "string") return user;
  return user.name || user.email || "Unknown";
}

function displayBarber(barber?: BarberSummary | string | null) {
  if (!barber) return "Unknown";
  if (typeof barber === "string") return barber;
  return barber.userId?.name || barber.userId?.email || "Unknown";
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (status) query.set("status", status);
    if (paymentStatus) query.set("paymentStatus", paymentStatus);
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    query.set("limit", "300");

    try {
      const res = await fetch(`/api/admin/bookings?${query.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as BookingsResponse;
      if (!res.ok) throw new Error(json.error || "Failed to load bookings");
      setBookings(json.bookings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [from, paymentStatus, search, status, to]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadBookings();
  }

  return (
    <AdminPageShell
      title="Bookings"
      subtitle="Review platform bookings across clients, barbers, status, payment state, and service."
    >
      <section className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_160px_160px_150px_150px_auto]"
        >
          {/* show an input field */}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search service, client, reference"
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
            <option value="confirmed">Confirmed</option>
            {/* show one choice */}
            <option value="completed">Completed</option>
            {/* show one choice */}
            <option value="declined">Declined</option>
          </select>
          <select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            {/* show one choice */}
            <option value="">All payments</option>
            {/* show one choice */}
            <option value="pending">Pending</option>
            {/* show one choice */}
            <option value="paid">Paid</option>
            {/* show one choice */}
            <option value="failed">Failed</option>
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
          <p className="text-sm text-slate-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <AdminEmptyState>No bookings found.</AdminEmptyState>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                {/* show table headings */}
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Booking</th>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Barber</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                {/* show table rows */}
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="align-top">
                      <td className="px-4 py-3">
                        {/* show text */}
                        <p className="font-medium text-slate-950">
                          {booking.service || "Booking"}
                        </p>
                        {/* show text */}
                        <p className="mt-1 break-all text-xs text-slate-500">
                          {booking.paymentReference || booking._id}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {displayUser(booking.clientId) || booking.name || booking.email}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {displayBarber(booking.barberId)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatAdminDate(booking.dateTime)}
                      </td>
                      <td className="space-y-1 px-4 py-3">
                        <AdminStatusBadge value={booking.status || "pending"} />
                        <AdminStatusBadge value={booking.paymentStatus || "pending"} />
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatNaira(booking.amountPaid || booking.estimatedPrice || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/bookings/${booking._id}`}
                          className="text-sm font-semibold text-[#f2800d]"
                        >
                          Open
                        </Link>
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
