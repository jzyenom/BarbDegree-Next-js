import { NextRequest, NextResponse } from "next/server";
import { Paystack } from "paystack-sdk";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import User from "@/models/User";

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId } = await req.json();
  const booking = await Booking.findById(bookingId);

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.paymentStatus === "paid") {
    return NextResponse.json({ error: "Booking is already paid" }, { status: 400 });
  }

  const bookingClientId = booking.clientId?.toString?.() ?? "";
  if (bookingClientId !== user.id && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const origin = new URL(req.url).origin;
  const appUrl =
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    origin;

  const amount = Number(booking.estimatedPrice || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Booking amount is invalid for payment" },
      { status: 400 }
    );
  }

  let payerEmail = booking.email;
  if (!payerEmail && booking.clientId) {
    const clientUser = await User.findById(booking.clientId).select("email");
    payerEmail = clientUser?.email;
  }
  if (!payerEmail) {
    payerEmail = user.email || undefined;
  }
  if (!payerEmail) {
    return NextResponse.json({ error: "No payer email found" }, { status: 400 });
  }

  const response = await paystack.transaction.initialize({
    amount: amount * 100,
    email: payerEmail,
    callback_url: `${appUrl}/payment/verify`,
    metadata: {
      bookingId: booking._id.toString(),
      userId: user.id,
    },
  });

  await Transaction.create({
    userId: user.id,
    bookingId,
    amount,
    reference: response.data.reference,
    status: "pending",
  });

  await Booking.findByIdAndUpdate(bookingId, {
    paymentReference: response.data.reference,
  });

  return NextResponse.json({
    authUrl: response.data.authorization_url,
    reference: response.data.reference,
  });
}
