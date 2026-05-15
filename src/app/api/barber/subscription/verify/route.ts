import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Subscription from "@/models/Subscription";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

const REFERENCE_PATTERN = /^[A-Za-z0-9._:-]{6,120}$/;

function getPaystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET || "";
}

async function verifySubscriptionReference(reference: string) {
  const secret = getPaystackSecret();
  if (!secret) throw new Error("Payment provider is not configured");

  await connectToDatabase();
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const paystackResponse = await response.json();
  if (!response.ok || !paystackResponse?.status || !paystackResponse?.data) {
    throw new Error(paystackResponse?.message || "Subscription verification failed");
  }

  const status = paystackResponse.data.status === "success" ? "success" : "failed";
  const subscription = await Subscription.findOneAndUpdate(
    { reference },
    {
      status,
      providerResponse: paystackResponse.data,
    },
    { new: true }
  );
  if (!subscription) {
    return { ok: false, status: "failed", error: "Subscription not found" };
  }

  await Barber.findByIdAndUpdate(subscription.barberId, {
    isSubscribed: status === "success",
  });

  return {
    ok: status === "success",
    status,
    subscription,
  };
}

async function handleVerify(req: NextRequest, reference: string) {
  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!REFERENCE_PATTERN.test(reference)) {
    return NextResponse.json({ error: "Missing or invalid reference" }, { status: 400 });
  }

  await connectToDatabase();
  const subscription = await Subscription.findOne({ reference }).select("barberId");
  if (!subscription) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

  const barber = await Barber.findById(subscription.barberId).select("userId");
  if (barber?.userId?.toString() !== user.id && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await verifySubscriptionReference(reference);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

export async function GET(req: NextRequest) {
  const reference = new URL(req.url).searchParams.get("reference")?.trim() || "";
  return handleVerify(req, reference);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  return handleVerify(req, reference);
}
