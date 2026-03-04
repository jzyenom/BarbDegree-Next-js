import { NextRequest, NextResponse } from "next/server";
import { Paystack } from "paystack-sdk";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

type UpdatedBookingRef = {
  _id?: { toString(): string } | string;
} | null;

async function verifyReference(reference: string) {
  await connectToDatabase();

  const verify = await paystack.transaction.verify({ reference });

  const status = verify.data.status === "success" ? "success" : "failed";

  await Transaction.findOneAndUpdate(
    { reference },
    {
      status,
      providerResponse: verify.data,
    }
  );

  let updatedBooking: UpdatedBookingRef = null;
  if (status === "success") {
    updatedBooking = await Booking.findOneAndUpdate(
      { paymentReference: reference },
      {
        paymentStatus: "paid",
        amountPaid: verify.data.amount / 100,
        status: "confirmed",
      },
      { new: true }
    ).lean();
  } else {
    updatedBooking = await Booking.findOneAndUpdate(
      { paymentReference: reference },
      {
        paymentStatus: "failed",
      },
      { new: true }
    ).lean();
  }

  return {
    ok: status === "success",
    status,
    reference,
    bookingId:
      updatedBooking?._id == null
        ? null
        : typeof updatedBooking._id === "string"
        ? updatedBooking._id
        : updatedBooking._id.toString(),
    transaction: verify.data,
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    const result = await verifyReference(reference);
    const redirectFlag = url.searchParams.get("redirect");
    const shouldRedirect = redirectFlag !== "false" && redirectFlag !== "0";

    if (!shouldRedirect) {
      return NextResponse.json(result);
    }

    const origin = url.origin;
    const redirectTarget = new URL("/transactions", origin);
    redirectTarget.searchParams.set("payment", result.status);
    redirectTarget.searchParams.set("reference", result.reference);
    if (result.bookingId) {
      redirectTarget.searchParams.set("bookingId", result.bookingId);
    }

    return NextResponse.redirect(redirectTarget);
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const reference = body?.reference;

    if (!reference || typeof reference !== "string") {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const result = await verifyReference(reference);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
