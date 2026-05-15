/**
 * AUTO-FILE-COMMENT: src/app/api/barber/subscription/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";
import { requireAuth } from "@/lib/authGuard";

function getPaystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET || "";
}

function resolveAppUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized)`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `if (user.role !== "barber") {`.
 * 6. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 7. Executes `}`.
 * 8. Executes `const barber = await Barber.findOne({ userId: user.id });`.
 * 9. Executes `if (!barber) return NextResponse.json({ error: "Barber not found" }, { status: 404 });`.
 * 10. Executes `return NextResponse.json({ isSubscribed: barber.isSubscribed });`.
 */
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "barber") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const barber = await Barber.findOne({ userId: user.id });
  if (!barber) return NextResponse.json({ error: "Barber not found" }, { status: 404 });

  const subscription = await Subscription.findOne({ barberId: barber._id })
    .sort({ createdAt: -1 })
    .populate("planId");

  return NextResponse.json({
    isSubscribed: barber.isSubscribed,
    subscription,
  });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "barber") {
    return NextResponse.json({ error: "Only barbers can subscribe" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const planId = typeof body.planId === "string" ? body.planId.trim() : "";
  const callbackUrl =
    typeof body.callbackUrl === "string" && body.callbackUrl.trim()
      ? body.callbackUrl.trim()
      : `${resolveAppUrl(req)}/api/barber/subscription/verify`;

  if (!mongoose.Types.ObjectId.isValid(planId)) {
    return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
  }

  const secret = getPaystackSecret();
  if (!secret) {
    return NextResponse.json({ error: "Payment provider is not configured" }, { status: 500 });
  }

  const barber = await Barber.findOne({ userId: user.id }).select("_id");
  if (!barber) return NextResponse.json({ error: "Barber profile not found" }, { status: 404 });

  const plan = await Plan.findOne({ _id: planId, isActive: true });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      amount: Math.round(plan.amount * 100),
      plan: plan.paystackPlanCode,
      callback_url: callbackUrl,
      metadata: {
        barberId: barber._id.toString(),
        userId: user.id,
        planId: plan._id.toString(),
        purpose: "barber_subscription",
      },
    }),
  });
  const initResponse = await response.json();
  if (!response.ok || !initResponse?.status || !initResponse?.data?.reference) {
    return NextResponse.json(
      { error: initResponse?.message || "Failed to initialize subscription payment" },
      { status: response.ok ? 502 : response.status }
    );
  }

  const subscription = await Subscription.create({
    barberId: barber._id,
    planId: plan._id,
    amount: plan.amount,
    reference: initResponse.data.reference,
    status: "pending",
    paystackPlanCode: plan.paystackPlanCode,
  });

  return NextResponse.json(
    {
      subscription,
      authorizationUrl: initResponse.data.authorization_url,
      reference: initResponse.data.reference,
    },
    { status: 201 }
  );
}
