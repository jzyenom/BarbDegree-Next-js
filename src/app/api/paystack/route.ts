import { NextRequest, NextResponse } from "next/server";
import { Paystack } from "paystack-sdk";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId } = await req.json();
  const booking = await Booking.findById(bookingId);

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const response = await paystack.transaction.initialize({
    amount: booking.estimatedPrice * 100,
    email: booking.email,
    callback_url: `${process.env.NEXT_PUBLIC_URL}/payment/verify`,
  });

  await Transaction.create({
    userId: user.id,
    bookingId,
    amount: booking.estimatedPrice,
    reference: response.data.reference,
    status: "pending",
  });

  await Booking.findByIdAndUpdate(bookingId, {
    paymentReference: response.data.reference,
  });

  return NextResponse.json({ authUrl: response.data.authorization_url });
}
