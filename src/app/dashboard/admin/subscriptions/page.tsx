"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminPageShell, {
  AdminEmptyState,
  AdminStatusBadge,
  formatAdminDate,
} from "@/components/admin/AdminPageShell";
import { formatNaira } from "@/lib/format";

type UserSummary = {
  name?: string;
  email?: string;
};

type AdminBarber = {
  _id: string;
  userId?: UserSummary;
  subscriptionStatus?: string;
  subscriptionActive?: boolean;
  adminSubscriptionOverride?: boolean;
  adminForcedSubscriptionStatus?: boolean;
  subscriptionExpiresAt?: string;
};

type SubscriptionPlan = {
  name?: string;
  interval?: string;
  amount?: number;
};

type AdminSubscription = {
  _id: string;
  amount?: number;
  reference?: string;
  status?: string;
  createdAt?: string;
  paidAt?: string;
  nextPaymentDate?: string;
  barberId?: AdminBarber | string | null;
  planId?: SubscriptionPlan | string | null;
};

type BarbersResponse = {
  barbers?: AdminBarber[];
  error?: string;
};

type SubscriptionsResponse = {
  subscriptions?: AdminSubscription[];
  error?: string;
};

function barberName(barber?: AdminBarber | string | null) {
  if (!barber) return "Unknown barber";
  if (typeof barber === "string") return barber;
  return barber.userId?.name || barber.userId?.email || "Unknown barber";
}

function planName(plan?: SubscriptionPlan | string | null) {
  if (!plan) return "Unknown plan";
  if (typeof plan === "string") return plan;
  return plan.name || "Unknown plan";
}

export default function AdminSubscriptionsPage() {
  const [barbers, setBarbers] = useState<AdminBarber[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (status) query.set("status", status);
    query.set("limit", "200");

    try {
      const [barbersRes, subscriptionsRes] = await Promise.all([
        fetch("/api/admin/barbers", { cache: "no-store" }),
        fetch(`/api/admin/subscriptions?${query.toString()}`, { cache: "no-store" }),
      ]);
      const barbersJson = (await barbersRes.json()) as BarbersResponse;
      const subscriptionsJson =
        (await subscriptionsRes.json()) as SubscriptionsResponse;

      if (!barbersRes.ok) {
        throw new Error(barbersJson.error || "Failed to load barber subscriptions");
      }
      if (!subscriptionsRes.ok) {
        throw new Error(subscriptionsJson.error || "Failed to load subscriptions");
      }

      setBarbers(barbersJson.barbers ?? []);
      setSubscriptions(subscriptionsJson.subscriptions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to update override");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update override");
    } finally {
      setSavingId(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadData();
  }

  return (
    <AdminPageShell
      title="Subscriptions"
      subtitle="Control barber booking access overrides and audit subscription payment history."
    >
      <section className="space-y-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Barber Access Overrides</h2>
            {/* show text */}
            <p className="text-sm text-slate-600">
              Admin overrides can force booking access on or off without changing payment history.
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            // show text
            <p className="text-sm text-slate-500">Loading subscriptions...</p>
          ) : barbers.length === 0 ? (
            <AdminEmptyState>No barber profiles found.</AdminEmptyState>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {barbers.map((barber) => (
                // show article
                <article
                  key={barber._id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="break-all font-semibold">{barberName(barber)}</h3>
                      {/* show text */}
                      <p className="mt-1 text-sm text-slate-600">
                        Expires {formatAdminDate(barber.subscriptionExpiresAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
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
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Subscription History</h2>
              {/* show text */}
              <p className="text-sm text-slate-600">
                Paystack subscription records connected to barber profiles.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
              >
                {/* show one choice */}
                <option value="">All statuses</option>
                {/* show one choice */}
                <option value="pending">Pending</option>
                {/* show one choice */}
                <option value="success">Success</option>
                {/* show one choice */}
                <option value="failed">Failed</option>
                {/* show one choice */}
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold">
                Apply
              </button>
            </form>
          </div>

          {loading ? null : subscriptions.length === 0 ? (
            <AdminEmptyState>No subscription records found.</AdminEmptyState>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  {/* show table headings */}
                  <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Barber</th>
                      <th className="px-4 py-3 font-semibold">Plan</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Reference</th>
                      <th className="px-4 py-3 font-semibold">Created</th>
                    </tr>
                  </thead>
                  {/* show table rows */}
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription._id} className="align-top">
                        <td className="px-4 py-3">{barberName(subscription.barberId)}</td>
                        <td className="px-4 py-3">{planName(subscription.planId)}</td>
                        <td className="px-4 py-3">
                          <AdminStatusBadge value={subscription.status || "pending"} />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatNaira(subscription.amount ?? 0)}
                        </td>
                        <td className="break-all px-4 py-3 text-slate-700">
                          {subscription.reference || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatAdminDate(subscription.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </AdminPageShell>
  );
}
