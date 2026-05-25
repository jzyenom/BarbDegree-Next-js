import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import { initializeSubscription, PaystackApiError } from "@/lib/paystack";
import { ensureDefaultSubscriptionPlans } from "@/lib/subscription-helpers";
import Barber from "@/models/Barber";
import Plan from "@/models/Plan";
import Subscription from "@/models/Subscription";
import Transaction from "@/models/Transaction";
import { enforceRateLimit, rateLimitProfiles } from "@/server/security/rateLimit";

function resolveAppUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}

function makeReference(barberId: string) {
  return `sub_${barberId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, rateLimitProfiles.payment);
  if (limited) return limited;

  await connectToDatabase();
  await ensureDefaultSubscriptionPlans();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "barber") {
    return NextResponse.json({ error: "Only barbers can subscribe" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const planId = typeof body.planId === "string" ? body.planId.trim() : "";
  if (!mongoose.Types.ObjectId.isValid(planId)) {
    return NextResponse.json({ error: "Invalid plan id" }, { status: 400 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "Authenticated user email is required" }, { status: 400 });
  }

  const barber = await Barber.findOne({ userId: user.id }).select("_id");
  if (!barber) return NextResponse.json({ error: "Barber profile not found" }, { status: 404 });

  const plan = await Plan.findOne({ _id: planId, isActive: true });
  if (!plan) return NextResponse.json({ error: "Plan is not available" }, { status: 404 });

  const reference = makeReference(barber._id.toString());
  const callbackUrl = `${resolveAppUrl(req)}/dashboard/barber?subscription=verify&reference=${encodeURIComponent(reference)}`;
  const session = await mongoose.startSession();

  try {
    let subscriptionId: mongoose.Types.ObjectId | undefined;
    await session.withTransaction(async () => {
      const [subscription] = await Subscription.create(
        [
          {
            barberId: barber._id,
            planId: plan._id,
            amount: plan.amount,
            reference,
            status: "pending",
            paystackPlanCode: plan.paystackPlanCode,
          },
        ],
        { session }
      );
      subscriptionId = subscription._id;

      await Transaction.create(
        [
          {
            userId: user.id,
            subscriptionId: subscription._id,
            amount: plan.amount,
            reference,
            status: "pending",
            type: "barber_subscription",
          },
        ],
        { session }
      );
    });

    const initResponse = await initializeSubscription({
      email: user.email,
      plan: plan.paystackPlanCode,
      reference,
      amount: Math.round(plan.amount * 100),
      callback_url: callbackUrl,
      metadata: {
        barberId: barber._id.toString(),
        planId: plan._id.toString(),
        subscriptionType: "barber_subscription",
      },
    });

    return NextResponse.json(
      {
        authorization_url: initResponse.data?.authorization_url,
        authorizationUrl: initResponse.data?.authorization_url,
        reference,
        subscriptionId: subscriptionId?.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscription initialize error:", error);
    if (error instanceof PaystackApiError) {
      return NextResponse.json(
        { error: error.providerMessage },
        { status: error.statusCode >= 400 && error.statusCode < 500 ? 400 : 502 }
      );
    }

    return NextResponse.json({ error: "Failed to initialize subscription" }, { status: 500 });
  } finally {
    await session.endSession();
  }
}
