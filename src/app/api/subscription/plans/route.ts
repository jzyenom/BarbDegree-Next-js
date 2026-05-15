import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Plan from "@/models/Plan";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

const INTERVALS = new Set(["daily", "weekly", "monthly", "quarterly", "biannually", "annually"]);

function getPaystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET || "";
}

export async function GET() {
  await connectToDatabase();
  const plans = await Plan.find({ isActive: true }).sort({ amount: 1, name: 1 });
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const interval = typeof body.interval === "string" ? body.interval.trim() : "";
  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Plan name is required" }, { status: 400 });
  }
  if (!INTERVALS.has(interval)) {
    return NextResponse.json({ error: "Invalid plan interval" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Plan amount must be greater than zero" }, { status: 400 });
  }

  const secret = getPaystackSecret();
  if (!secret) {
    return NextResponse.json({ error: "Payment provider is not configured" }, { status: 500 });
  }

  const response = await fetch("https://api.paystack.co/plan", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      interval,
      amount: Math.round(amount * 100),
    }),
  });
  const paystackResponse = await response.json();
  if (!response.ok || !paystackResponse?.status || !paystackResponse?.data?.plan_code) {
    return NextResponse.json(
      { error: paystackResponse?.message || "Failed to create Paystack plan" },
      { status: response.ok ? 502 : response.status }
    );
  }

  const plan = await Plan.findOneAndUpdate(
    { name },
    {
      name,
      interval,
      amount,
      paystackPlanCode: paystackResponse.data.plan_code,
      isActive: true,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ plan, paystackResponse }, { status: 201 });
}
