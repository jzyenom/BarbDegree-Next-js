"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminPageShell, {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/AdminPageShell";
import { formatNaira } from "@/lib/format";

type AdminService = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
  isActive?: boolean;
  barberId?: {
    _id?: string;
    userId?: { name?: string; email?: string };
    address?: string;
    state?: string;
    country?: string;
  } | null;
};

type ServicesResponse = {
  services?: AdminService[];
  error?: string;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (active) query.set("active", active);
    query.set("limit", "300");

    try {
      const res = await fetch(`/api/admin/services?${query.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as ServicesResponse;
      if (!res.ok) throw new Error(json.error || "Failed to load services");
      setServices(json.services ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [active, search]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  async function toggleService(service: AdminService) {
    setSavingId(service._id);
    setError(null);

    try {
      const res = await fetch(`/api/services/${service._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to update service");
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service");
    } finally {
      setSavingId(null);
    }
  }

  async function removeService(service: AdminService) {
    if (!window.confirm(`Delete ${service.name}?`)) return;
    setSavingId(service._id);
    setError(null);

    try {
      const res = await fetch(`/api/services/${service._id}`, {
        method: "DELETE",
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to delete service");
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service");
    } finally {
      setSavingId(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadServices();
  }

  return (
    <AdminPageShell
      title="Services"
      subtitle="View and moderate services created under barber profiles."
    >
      <section className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]"
        >
          {/* show an input field */}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#f2800d]"
          />
          <select
            value={active}
            onChange={(event) => setActive(event.target.value)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            {/* show one choice */}
            <option value="">All states</option>
            {/* show one choice */}
            <option value="true">Active</option>
            {/* show one choice */}
            <option value="false">Inactive</option>
          </select>
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
          <p className="text-sm text-slate-500">Loading services...</p>
        ) : services.length === 0 ? (
          <AdminEmptyState>No services found.</AdminEmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {services.map((service) => {
              const barberName =
                service.barberId?.userId?.name ||
                service.barberId?.userId?.email ||
                "Unknown barber";

              return (
                // show article
                <article
                  key={service._id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h2 className="break-all text-base font-semibold">
                        {service.name}
                      </h2>
                      {/* show text */}
                      <p className="mt-1 text-sm text-slate-600">
                        {service.description || "No description"}
                      </p>
                      {/* show text */}
                      <p className="mt-2 text-sm text-slate-600">
                        {barberName}
                      </p>
                    </div>
                    <AdminStatusBadge value={service.isActive ? "active" : "inactive"} />
                  </div>

                  {/* show dl */}
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      {/* show dt */}
                      <dt className="text-slate-500">Price</dt>
                      {/* show dd */}
                      <dd className="font-semibold">{formatNaira(service.price)}</dd>
                    </div>
                    <div>
                      {/* show dt */}
                      <dt className="text-slate-500">Duration</dt>
                      {/* show dd */}
                      <dd className="font-semibold">
                        {service.durationMinutes ?? 30} min
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => void toggleService(service)}
                      disabled={savingId === service._id}
                      className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 disabled:text-slate-400"
                    >
                      {service.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => void removeService(service)}
                      disabled={savingId === service._id}
                      className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white disabled:bg-slate-300"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
