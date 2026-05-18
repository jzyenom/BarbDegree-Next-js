/**
 * AUTO-FILE-COMMENT: src/app/api/barber/subscription/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Subscription from "@/models/Subscription";
import { requireAuth } from "@/lib/authGuard";
import { hasActiveSubscription } from "@/lib/subscription-helpers";

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
