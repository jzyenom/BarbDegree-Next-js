import { NextRequest, NextResponse } from "next/server";
import { Paystack } from "paystack-sdk";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

const REFERENCE_PATTERN = /^[A-Za-z0-9._:-]{6,120}$/;

type UpdatedBookingRef = {
  _id: { toString(): string } | string;
} | null;

type VerifyResult = {
  ok: boolean;
  status: "success" | "failed";
  reference: string;
  bookingId: string | null;
};

type IdLike = { toString(): string } | string | null | undefined;

function toIdString(value: IdLike) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

function isValidReference(reference: string) {
  return REFERENCE_PATTERN.test(reference);
}

async function verifyReference(reference: string): Promise<VerifyResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  await connectToDatabase();

  const paystack = new Paystack(secretKey);
  const verify = await paystack.transaction.verify(reference);
  const verifyData = verify.data;
  if (!verifyData) {
    throw new Error("Empty verification response");
  }
  if (
    typeof verifyData.reference === "string" &&
    verifyData.reference !== reference
  ) {
    throw new Error("Mismatched payment reference");
  }

  const status: "success" | "failed" =
    verifyData.status === "success" ? "success" : "failed";

  await Transaction.findOneAndUpdate(
    { reference },
    {
      status,
      providerResponse: verifyData,
    }
  );

  let updatedBooking: UpdatedBookingRef = null;
  if (status === "success") {
    updatedBooking = await Booking.findOneAndUpdate(
      { paymentReference: reference },
      {
        paymentStatus: "paid",
        amountPaid:
          typeof verifyData.amount === "number" ? verifyData.amount / 100 : 0,
        status: "confirmed",
      },
      { new: true }
    ).lean<UpdatedBookingRef>();
  } else {
    updatedBooking = await Booking.findOneAndUpdate(
      { paymentReference: reference },
      {
        paymentStatus: "failed",
      },
      { new: true }
    ).lean<UpdatedBookingRef>();
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
  };
}

async function resolveReferenceOwner(reference: string) {
  await connectToDatabase();

  const transaction = await Transaction.findOne({ reference })
    .select("userId bookingId")
    .lean<{ userId?: IdLike; bookingId?: IdLike } | null>();

  if (transaction?.userId) {
    return {
      ownerId: toIdString(transaction.userId),
      bookingId: toIdString(transaction.bookingId) || null,
    };
  }

  const booking = await Booking.findOne({ paymentReference: reference })
    .select("_id clientId")
    .lean<{ _id: IdLike; clientId?: IdLike } | null>();

  if (!booking?.clientId) {
    return null;
  }

  return {
    ownerId: toIdString(booking.clientId),
    bookingId: toIdString(booking._id) || null,
  };
}

export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const reference = (url.searchParams.get("reference") || "").trim();

  if (!isValidReference(reference)) {
    return NextResponse.json(
      { error: "Missing or invalid reference" },
      { status: 400 }
    );
  }

  try {
    const owner = await resolveReferenceOwner(reference);
    if (!owner) {
      return NextResponse.json(
        { error: "Reference not found" },
        { status: 404 }
      );
    }

    if (owner.ownerId !== user.id && !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await verifyReference(reference);
    const redirectFlag = url.searchParams.get("redirect");
    const shouldRedirect = redirectFlag !== "false" && redirectFlag !== "0";

    if (!shouldRedirect) {
      return NextResponse.json(result);
    }

    const redirectBase =
      process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;
    const redirectTarget = new URL("/transactions", redirectBase);
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
  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const reference =
      typeof body.reference === "string" ? body.reference.trim() : "";

    if (!isValidReference(reference)) {
      return NextResponse.json(
        { error: "Missing or invalid reference" },
        { status: 400 }
      );
    }

    const owner = await resolveReferenceOwner(reference);
    if (!owner) {
      return NextResponse.json(
        { error: "Reference not found" },
        { status: 404 }
      );
    }

    if (owner.ownerId !== user.id && !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await verifyReference(reference);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
