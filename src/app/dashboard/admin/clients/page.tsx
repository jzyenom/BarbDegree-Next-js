"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminPageShell, {
  AdminEmptyState,
  formatAdminDate,
} from "@/components/admin/AdminPageShell";
import { formatNaira } from "@/lib/format";

type AdminClient = {
  _id: string;
  userId?: { _id?: string; email?: string; name?: string };
  whatsapp?: string;
  mobile?: string;
  country?: string;
  state?: string;
  address?: string;
  createdAt?: string;
  bookingsCount?: number;
  paidBookings?: number;
  totalSpent?: number;
};

type ClientsResponse = {
  clients?: AdminClient[];
  error?: string;
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    query.set("limit", "200");

    try {
      const res = await fetch(`/api/admin/clients?${query.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as ClientsResponse;
      if (!res.ok) throw new Error(json.error || "Failed to load clients");
      setClients(json.clients ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadClients();
  }

  return (
    <AdminPageShell
      title="Clients"
      subtitle="Inspect client profiles, contact details, booking activity, and paid spend."
    >
      <section className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto]"
        >
          {/* show an input field */}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clients"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#f2800d]"
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
          <p className="text-sm text-slate-500">Loading clients...</p>
        ) : clients.length === 0 ? (
          <AdminEmptyState>No clients found.</AdminEmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {clients.map((client) => (
              // show article
              <article
                key={client._id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-all text-base font-semibold">
                      {client.userId?.name || client.userId?.email || "Client"}
                    </h2>
                    {/* show text */}
                    <p className="mt-1 break-all text-sm text-slate-600">
                      {client.userId?.email || "No email"}
                    </p>
                    {/* show text */}
                    <p className="mt-1 text-sm text-slate-600">
                      {[client.address, client.state, client.country]
                        .filter(Boolean)
                        .join(", ") || "No location"}
                    </p>
                  </div>
                  {/* show text */}
                  <p className="text-xs text-slate-500">
                    Joined {formatAdminDate(client.createdAt)}
                  </p>
                </div>

                {/* show dl */}
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    {/* show dt */}
                    <dt className="text-slate-500">Bookings</dt>
                    {/* show dd */}
                    <dd className="font-semibold">{client.bookingsCount ?? 0}</dd>
                  </div>
                  <div>
                    {/* show dt */}
                    <dt className="text-slate-500">Paid</dt>
                    {/* show dd */}
                    <dd className="font-semibold">{client.paidBookings ?? 0}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    {/* show dt */}
                    <dt className="text-slate-500">Total spent</dt>
                    {/* show dd */}
                    <dd className="font-semibold">
                      {formatNaira(client.totalSpent ?? 0)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
