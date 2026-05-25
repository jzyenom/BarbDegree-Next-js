import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAdminApi } from "@/lib/adminApi";
import { ensureDefaultSubscriptionPlans } from "@/lib/subscription-helpers";
import Plan from "@/models/Plan";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const access = await requireAdminApi(req);
  if (access.response) return access.response;

  await ensureDefaultSubscriptionPlans();

  const plans = await Plan.find({}).sort({ amount: 1, name: 1 }).lean();

  return NextResponse.json({ plans });
}
