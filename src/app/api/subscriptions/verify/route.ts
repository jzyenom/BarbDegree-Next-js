import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import { verifyTransaction } from "@/lib/paystack";
import {
  activateBarberSubscription,
  deactivateBarberSubscription,
} from "@/lib/subscription-helpers";
import { isAdminRole } from "@/lib/roles";
import Barber from "@/models/Barber";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";
import { enforceRateLimit, rateLimitProfiles } from "@/server/security/rateLimit";

const REFERENCE_PATTERN = /^[A-Za-z0-9._:-]{6,160}$/;

function extractSubscriptionCode(data: Record<string, unknown>) {
  const value = data.subscription;
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "subscription_code" in value) {
    const code = (value as { subscription_code?: unknown }).subscription_code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

async function handleVerify(req: NextRequest, reference: string) {
  const limited = await enforceRateLimit(req, rateLimitProfiles.payment);
  if (limited) return limited;

  if (!REFERENCE_PATTERN.test(reference)) {
    return NextResponse.json({ error: "Missing or invalid reference" }, { status: 400 });
  }

  await connectToDatabase();
  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await Subscription.findOne({ reference });
  if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  const barber = await Barber.findById(subscription.barberId).select("userId subscriptionActive");
  if (!barber) return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  if (barber.userId?.toString() !== user.id && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (subscription.status === "success" && barber.subscriptionActive) {
    return NextResponse.json({ ok: true, status: "success", reference });
  }

  const paystack = await verifyTransaction(reference);
  const data = paystack.data;
  if (!data || data.reference !== reference) {
    return NextResponse.json({ error: "Mismatched transaction reference" }, { status: 400 });
  }

  const plan = await Plan.findById(subscription.planId).select("interval");
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (data.status === "success") {
        await activateBarberSubscription(
          {
            barberId: subscription.barberId,
            planId: subscription.planId,
            reference,
            interval: plan.interval,
            subscriptionCode: extractSubscriptionCode(data),
            customerCode: data.customer?.customer_code,
            paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
            providerResponse: data,
          },
          session
        );
      } else {
        await deactivateBarberSubscription(
          {
            barberId: subscription.barberId,
            reference,
            providerResponse: data,
          },
          session
        );
      }
    });
  } finally {
    await session.endSession();
  }

  const ok = data.status === "success";
  return NextResponse.json({ ok, status: ok ? "success" : "failed", reference }, { status: ok ? 200 : 400 });
}

export async function GET(req: NextRequest) {
  const reference = new URL(req.url).searchParams.get("reference")?.trim() || "";
  return handleVerify(req, reference);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  return handleVerify(req, reference);
}
