"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminPageShell, {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/AdminPageShell";
import { formatNaira } from "@/lib/format";

type Plan = {
  _id: string;
  name: string;
  interval: string;
  amount: number;
  paystackPlanCode: string;
  isActive: boolean;
};

type PlansResponse = {
  plans?: Plan[];
  error?: string;
};

const intervals = ["daily", "weekly", "monthly", "quarterly", "biannually", "annually"];

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ name: "", interval: "monthly", amount: "" });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/plans", { cache: "no-store" });
      const json = (await res.json()) as PlansResponse;
      if (!res.ok) throw new Error(json.error || "Failed to load plans");
      setPlans(json.plans ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/subscription/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          interval: form.interval,
          amount: Number(form.amount),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to create plan");
      setForm({ name: "", interval: "monthly", amount: "" });
      setNotice("Plan created.");
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setCreating(false);
    }
  }

  async function togglePlan(plan: Plan) {
    setSavingId(plan._id);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/plans/${plan._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to update plan");
      setNotice("Plan updated.");
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminPageShell
      title="Plans"
      subtitle="Create Paystack-backed subscription plans and control which plans are available to barbers."
    >
      <section className="space-y-4">
        <form
          onSubmit={createPlan}
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_160px_auto]"
        >
          {/* show an input field */}
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Plan name"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#f2800d]"
            required
          />
          <select
            value={form.interval}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, interval: event.target.value }))
            }
            className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            {intervals.map((interval) => (
              // show one choice
              <option key={interval} value={interval}>
                {interval}
              </option>
            ))}
          </select>
          {/* show an input field */}
          <input
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            type="number"
            min="1"
            placeholder="Amount"
            className="h-11 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#f2800d]"
            required
          />
          <button
            disabled={creating}
            className="h-11 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:bg-slate-300"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        {loading ? (
          // show text
          <p className="text-sm text-slate-500">Loading plans...</p>
        ) : plans.length === 0 ? (
          <AdminEmptyState>No plans found.</AdminEmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {plans.map((plan) => (
              // show article
              <article
                key={plan._id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="break-all text-base font-semibold">{plan.name}</h2>
                    {/* show text */}
                    <p className="mt-1 break-all text-sm text-slate-600">
                      {plan.paystackPlanCode}
                    </p>
                  </div>
                  <AdminStatusBadge value={plan.isActive ? "active" : "inactive"} />
                </div>
                {/* show dl */}
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    {/* show dt */}
                    <dt className="text-slate-500">Amount</dt>
                    {/* show dd */}
                    <dd className="font-semibold">{formatNaira(plan.amount)}</dd>
                  </div>
                  <div>
                    {/* show dt */}
                    <dt className="text-slate-500">Interval</dt>
                    {/* show dd */}
                    <dd className="font-semibold">{plan.interval}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => void togglePlan(plan)}
                    disabled={savingId === plan._id}
                    className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 disabled:text-slate-400"
                  >
                    {plan.isActive ? "Deactivate" : "Activate"}
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
