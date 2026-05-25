import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAdminApi } from "@/lib/adminApi";
import { parseLimit } from "@/lib/adminQuery";
import Subscription from "@/models/Subscription";

const SUBSCRIPTION_STATUSES = new Set(["pending", "success", "failed", "cancelled"]);

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const access = await requireAdminApi(req);
  if (access.response) return access.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status")?.trim() || "";
  const limit = parseLimit(req, 100, 500);
  const filter: Record<string, unknown> = {};

  if (SUBSCRIPTION_STATUSES.has(status)) {
    filter.status = status;
  }

  const subscriptions = await Subscription.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .populate({ path: "planId", select: "name interval amount paystackPlanCode isActive" })
    .populate({
      path: "barberId",
      select:
        "userId subscriptionStatus subscriptionActive adminSubscriptionOverride adminForcedSubscriptionStatus subscriptionExpiresAt",
      populate: { path: "userId", select: "name email avatar role" },
    })
    .lean();

  return NextResponse.json({ subscriptions });
}
