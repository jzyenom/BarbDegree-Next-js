import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Paystack } from "paystack-sdk";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

const REFERENCE_PATTERN = /^[A-Za-z0-9._:-]{6,120}$/;

function isValidReference(reference: string) {
  return REFERENCE_PATTERN.test(reference);
}

function pickMetadataBookingId(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const metadata = value as Record<string, unknown>;
  return typeof metadata.bookingId === "string" ? metadata.bookingId : null;
}

export async function POST(req: Request) {
  try {
    const { user, unauthorized } = await requireAuth(req);
    if (unauthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const bookingId =
      typeof body.bookingId === "string" ? body.bookingId.trim() : "";
    const reference =
      typeof body.reference === "string" ? body.reference.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
    }
    if (!isValidReference(reference)) {
      return NextResponse.json(
        { error: "Invalid payment reference" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId).select(
      "_id clientId paymentReference paymentStatus"
    );
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isOwner = booking.clientId?.toString?.() === user.id;
    if (!isOwner && !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookingReference = booking.paymentReference?.trim?.() ?? "";
    if (!bookingReference || bookingReference !== reference) {
      return NextResponse.json(
        { error: "Reference does not match this booking" },
        { status: 400 }
      );
    }

    if (booking.paymentStatus === "paid") {
      return NextResponse.json({
        message: "Payment already verified",
        bookingId,
        reference,
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Payment provider is not configured" },
        { status: 500 }
      );
    }
    const paystack = new Paystack(secretKey);

    const verifyResult = await paystack.transaction.verify(reference);
    const verifyData = verifyResult.data;
    if (!verifyData) {
      return NextResponse.json(
        { error: "Invalid Paystack response" },
        { status: 502 }
      );
    }
    if (
      typeof verifyData.reference === "string" &&
      verifyData.reference !== reference
    ) {
      return NextResponse.json(
        { error: "Payment provider returned a mismatched reference" },
        { status: 502 }
      );
    }

    const paystackBookingId = pickMetadataBookingId(verifyData.metadata);
    if (paystackBookingId && paystackBookingId !== bookingId) {
      return NextResponse.json(
        { error: "Payment metadata does not match booking" },
        { status: 400 }
      );
    }

    const status = verifyData.status === "success" ? "success" : "failed";
    await Transaction.findOneAndUpdate(
      { reference },
      {
        status,
        providerResponse: verifyData,
      }
    );

    if (status === "success") {
      const amountPaid =
        typeof verifyData.amount === "number" ? verifyData.amount / 100 : 0;

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: "paid",
          amountPaid,
          paymentReference: reference,
          status: "confirmed",
        },
        { new: true }
      );

      return NextResponse.json({
        message: "Payment verified",
        booking: updatedBooking,
      });
    }

    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" });
    return NextResponse.json(
      { message: "Payment not successful" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Paystack verify error", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
