import { NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";

const PAYSTACK_VERIFY_ENDPOINT = (reference: string) =>
  `https://api.paystack.co/transaction/verify/${reference}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference, bookingId } = body;
    if (!reference || !bookingId)
      return NextResponse.json(
        { error: "Missing reference or bookingId" },
        { status: 400 }
      );

    await connectToDatabase();

    const res = await fetch(PAYSTACK_VERIFY_ENDPOINT(reference), {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        Accept: "application/json",
      },
    });
    const payload = await res.json();

    if (!payload || !payload.data) {
      return NextResponse.json(
        { error: "Invalid Paystack response" },
        { status: 500 }
      );
    }

    const { status, amount, reference: ref } = payload.data;
    // Paystack returns amount in kobo (for NGN) e.g., 500000 => ₦5,000.00
    const amountPaid = typeof amount === "number" ? amount / 100 : undefined;

    if (status === "success") {
      const updated = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: "paid",
          amountPaid,
          paymentReference: ref,
          status: "confirmed",
        },
        { new: true }
      );
      return NextResponse.json({
        message: "Payment verified",
        booking: updated,
      });
    } else {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" });
      return NextResponse.json(
        { message: "Payment not successful", payload },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Paystack verify error", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
