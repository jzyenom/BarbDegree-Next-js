"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AdminPageShell, {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/AdminPageShell";

type AdminBarber = {
  _id: string;
  userId?: { _id?: string; email?: string; name?: string };
  mobile?: string;
  whatsapp?: string;
  country?: string;
  state?: string;
  address?: string;
  subscriptionStatus?: string;
  subscriptionActive?: boolean;
  adminSubscriptionOverride?: boolean;
  adminForcedSubscriptionStatus?: boolean;
  servicesCount?: number;
  bookingsCount?: number;
  paidBookings?: number;
  reviewsCount?: number;
  averageRating?: number | null;
};

type BarbersResponse = {
  barbers?: AdminBarber[];
  error?: string;
};

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBarbers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/barbers", { cache: "no-store" });
      const json = (await res.json()) as BarbersResponse;
      if (!res.ok) throw new Error(json.error || "Failed to load barbers");
      setBarbers(json.barbers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load barbers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBarbers();
  }, [loadBarbers]);

  const visibleBarbers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return barbers;

    return barbers.filter((barber) => {
      const haystack = [
        barber.userId?.name,
        barber.userId?.email,
        barber.mobile,
        barber.whatsapp,
        barber.state,
        barber.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [barbers, search]);

  async function toggleOverride(barber: AdminBarber) {
    setSavingId(barber._id);
    setError(null);

    try {
      const nextForcedStatus = !barber.adminForcedSubscriptionStatus;
      const res = await fetch("/api/admin/subscriptions/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: barber._id,
          enabled: true,
          forcedStatus: nextForcedStatus,
        }),
      });
      const json = (await res.json()) as { barber?: AdminBarber; error?: string };
      if (!res.ok || !json.barber) {
        throw new Error(json.error || "Failed to update subscription override");
      }
      await loadBarbers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update subscription override"
      );
    } finally {
      setSavingId(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <AdminPageShell
      title="Barbers"
      subtitle="Review barber profiles, booking activity, services, ratings, and admin subscription overrides."
    >
      <section className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          {/* show an input field */}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search barbers"
            className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#f2800d]"
          />
        </form>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          // show text
          <p className="text-sm text-slate-500">Loading barbers...</p>
        ) : visibleBarbers.length === 0 ? (
          <AdminEmptyState>No barbers found.</AdminEmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleBarbers.map((barber) => (
              // show article
              <article
                key={barber._id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-all text-base font-semibold">
                      {barber.userId?.name || barber.userId?.email || "Barber"}
                    </h2>
                    {/* show text */}
                    <p className="mt-1 break-all text-sm text-slate-600">
                      {barber.userId?.email || "No email"}
                    </p>
                    {/* show text */}
                    <p className="mt-1 text-sm text-slate-600">
                      {[barber.address, barber.state, barber.country]
                        .filter(Boolean)
                        .join(", ") || "No location"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AdminStatusBadge value={barber.subscriptionStatus || "inactive"} />
                    <AdminStatusBadge
                      value={
                        barber.adminSubscriptionOverride
                          ? barber.adminForcedSubscriptionStatus
                            ? "override active"
                            : "override blocked"
                          : "no override"
                      }
                    />
                  </div>
                </div>

                {/* show dl */}
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    {/* show dt */}
                    <dt className="text-slate-500">Services</dt>
                    {/* show dd */}
                    <dd className="font-semibold">{barber.servicesCount ?? 0}</dd>
                  </div>
                  <div>
                    {/* show dt */}
                    <dt className="text-slate-500">Bookings</dt>
                    {/* show dd */}
                    <dd className="font-semibold">{barber.bookingsCount ?? 0}</dd>
                  </div>
                  <div>
                    {/* show dt */}
                    <dt className="text-slate-500">Paid</dt>
                    {/* show dd */}
                    <dd className="font-semibold">{barber.paidBookings ?? 0}</dd>
                  </div>
                  <div>
                    {/* show dt */}
                    <dt className="text-slate-500">Rating</dt>
                    {/* show dd */}
                    <dd className="font-semibold">
                      {barber.averageRating ?? "-"} ({barber.reviewsCount ?? 0})
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => void toggleOverride(barber)}
                    disabled={savingId === barber._id}
                    className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:bg-slate-300"
                  >
                    {savingId === barber._id
                      ? "Saving..."
                      : barber.adminForcedSubscriptionStatus
                        ? "Disable Override"
                        : "Enable Override"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
