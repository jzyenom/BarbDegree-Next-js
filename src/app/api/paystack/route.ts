import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Paystack } from "paystack-sdk";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import User from "@/models/User";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolveAppUrl(req: NextRequest) {
  const configuredAppUrl =
    process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (configuredAppUrl) {
    return configuredAppUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return new URL(req.url).origin;
  }

  return "";
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Record<string, unknown>;
  const bookingId =
    typeof body.bookingId === "string" ? body.bookingId.trim() : "";
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Payment provider is not configured" },
      { status: 500 }
    );
  }
  const paystack = new Paystack(secretKey);

  const booking = await Booking.findById(bookingId);

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.paymentStatus === "paid") {
    return NextResponse.json({ error: "Booking is already paid" }, { status: 400 });
  }

  const bookingClientId = booking.clientId?.toString?.() ?? "";
  if (bookingClientId !== user.id && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const appUrl = resolveAppUrl(req);
  if (!appUrl) {
    return NextResponse.json(
      { error: "Public app URL is not configured" },
      { status: 500 }
    );
  }

  const amount = Number(booking.estimatedPrice || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Booking amount is invalid for payment" },
      { status: 400 }
    );
  }
  const amountInKobo = Math.round(amount * 100);
  if (!Number.isInteger(amountInKobo) || amountInKobo <= 0) {
    return NextResponse.json(
      { error: "Booking amount is invalid for payment" },
      { status: 400 }
    );
  }

  let payerEmail = booking.email?.trim().toLowerCase();
  if (!payerEmail && booking.clientId) {
    const clientUser = await User.findById(booking.clientId).select("email");
    payerEmail = clientUser?.email?.trim()?.toLowerCase();
  }
  if (!payerEmail) {
    payerEmail = user.email?.trim()?.toLowerCase() || undefined;
  }
  if (!payerEmail || !EMAIL_PATTERN.test(payerEmail)) {
    return NextResponse.json({ error: "No payer email found" }, { status: 400 });
  }

  const response = await paystack.transaction.initialize({
    amount: String(amountInKobo),
    email: payerEmail,
    callback_url: `${appUrl}/payment/verify`,
    metadata: {
      bookingId: booking._id.toString(),
      userId: user.id,
    },
  });
  const responseData = response.data;
  if (!responseData) {
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 502 }
    );
  }

  try {
    await Transaction.create({
      userId: bookingClientId || user.id,
      bookingId,
      amount,
      reference: responseData.reference,
      status: "pending",
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === 11000
    ) {
      // Treat duplicate reference as idempotent.
    } else {
      throw error;
    }
  }

  await Booking.findByIdAndUpdate(bookingId, {
    paymentReference: responseData.reference,
  });

  return NextResponse.json({
    authUrl: responseData.authorization_url,
    reference: responseData.reference,
  });
}
