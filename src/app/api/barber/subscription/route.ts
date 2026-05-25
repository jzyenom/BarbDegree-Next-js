import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Subscription from "@/models/Subscription";
import { requireAuth } from "@/lib/authGuard";
import { hasActiveSubscription } from "@/lib/subscription-helpers";


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
    isSubscribed: hasActiveSubscription(barber),
    subscriptionActive: barber.subscriptionActive,
    subscriptionStatus: barber.subscriptionStatus,
    subscriptionExpiresAt: barber.subscriptionExpiresAt,
    adminSubscriptionOverride: barber.adminSubscriptionOverride,
    adminForcedSubscriptionStatus: barber.adminForcedSubscriptionStatus,
    subscription,
  });
}

export async function POST(req: NextRequest) {
  const { POST } = await import("@/app/api/subscriptions/initialize/route");
  return POST(req);
}
