"use client";

import { useEffect, useMemo, useState } from "react";

type Plan = {
  _id: string;
  name: string;
  interval: "monthly" | "biannually" | "annually";
  amount: number;
};

type SubscriptionState = {
  isSubscribed: boolean;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  subscription?: {
    planId?: Plan;
    status?: string;
  };
};

const intervalLabel: Record<string, string> = {
  monthly: "Monthly",
  biannually: "Biannual",
  annually: "Annual",
};

const discountLabel: Record<string, string> = {
  monthly: "Basic",
  biannually: "Standard - discounted",
  annually: "Premium - highest discount",
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscriptionData() {
      const [plansRes, subRes] = await Promise.all([
        fetch("/api/subscription/plans"),
        fetch("/api/barber/subscription"),
      ]);
      const plansJson = await plansRes.json().catch(() => ({}));
      const subJson = await subRes.json().catch(() => ({}));
      if (plansRes.ok) setPlans(Array.isArray(plansJson.plans) ? plansJson.plans : []);
      if (subRes.ok) setSubscription(subJson);
    }

    loadSubscriptionData().catch(() => {
      setMessage("Could not load subscription plans.");
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (params.get("subscription") !== "verify" || !reference) return;

    async function verifySubscription() {
      setMessage("Verifying subscription payment...");
      const res = await fetch(`/api/subscriptions/verify?reference=${encodeURIComponent(reference!)}`);
      const json = await res.json().catch(() => ({}));
      setMessage(
        res.ok && json.status === "success"
          ? "Subscription activated."
          : json.error || "Subscription payment could not be verified."
      );
    }

    verifySubscription();
  }, []);

  const activePlanName = useMemo(() => {
    const plan = subscription?.subscription?.planId;
    return typeof plan === "object" ? plan.name : null;
  }, [subscription]);

  async function handleSubscribe(planId: string) {
    setLoadingPlanId(planId);
    setMessage(null);

    try {
      const res = await fetch("/api/subscriptions/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.authorization_url) {
        throw new Error(json.error || "Could not start subscription checkout.");
      }
      window.location.href = json.authorization_url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start checkout.");
      setLoadingPlanId(null);
    }
  }

  return (
    <section className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Subscription</h2>
          {subscription?.isSubscribed ? (
            // show text
            <p className="text-sm text-green-700">
              Active{activePlanName ? ` - ${activePlanName}` : ""}
              {subscription.subscriptionExpiresAt
                ? ` until ${new Date(subscription.subscriptionExpiresAt).toLocaleDateString()}`
                : ""}
            </p>
          ) : (
            // show text
            <p className="text-sm text-red-600">Inactive - your profile is not bookable.</p>
          )}
        </div>
        {/* show inline text */}
        <span className="rounded-full bg-[#f5f2f0] px-3 py-1 text-xs font-semibold">
          {subscription?.subscriptionStatus || "inactive"}
        </span>
      </div>

      {message && <p className="mb-3 text-sm text-[#8a7560]">{message}</p>}

      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan._id} className="rounded-lg border border-[#e6e0db] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold">{plan.name}</h3>
                {/* show text */}
                <p className="text-xs text-[#8a7560]">{discountLabel[plan.interval]}</p>
              </div>
              {/* show inline text */}
              <span className="rounded-full bg-[#fff4ea] px-2 py-1 text-xs font-semibold text-[#9a4b00]">
                {intervalLabel[plan.interval]}
              </span>
            </div>
            {/* show text */}
            <p className="mt-4 text-2xl font-bold">{formatNaira(plan.amount)}</p>
            <button
              type="button"
              onClick={() => handleSubscribe(plan._id)}
              disabled={loadingPlanId === plan._id}
              className="mt-4 h-10 w-full rounded-lg bg-[#f2800d] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlanId === plan._id ? "Redirecting..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
