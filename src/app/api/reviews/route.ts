import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import { requireAuth } from "@/lib/authGuard";

const MAX_COMMENT_LENGTH = 1000;

function normalizeComment(value: unknown) {
  if (typeof value !== "string") {
    return { ok: false as const, error: "Comment is required" };
  }

  const comment = value.trim();
  if (!comment) return { ok: false as const, error: "Comment is required" };
  if (comment.length > MAX_COMMENT_LENGTH) {
    return { ok: false as const, error: "Comment is too long" };
  }

  return { ok: true as const, value: comment };
}

function normalizeRate(value: unknown) {
  const rate = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(rate) || rate < 1 || rate > 5) {
    return { ok: false as const, error: "Rate must be a whole number from 1 to 5" };
  }

  return { ok: true as const, value: rate };
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const barberId = url.searchParams.get("barberId")?.trim() || "";
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
  }

  const limitParam = Number(url.searchParams.get("limit") || 50);
  const limit = Math.min(Math.max(Number.isFinite(limitParam) ? Math.floor(limitParam) : 50, 1), 100);

  const [reviews, stats] = await Promise.all([
    Review.find({ barberId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "userId", select: "name avatar" }),
    Review.aggregate([
      { $match: { barberId: new mongoose.Types.ObjectId(barberId) } },
      { $group: { _id: "$barberId", rating: { $avg: "$rate" }, reviews: { $sum: 1 } } },
    ]),
  ]);

  return NextResponse.json({
    reviews,
    rating: stats[0]?.rating ? Number(stats[0].rating.toFixed(1)) : null,
    reviewCount: stats[0]?.reviews ?? 0,
  });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "client") {
    return NextResponse.json({ error: "Only clients can review barbers" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const barberId = typeof body.barberId === "string" ? body.barberId.trim() : "";
  const bookingId = typeof body.bookingId === "string" ? body.bookingId.trim() : "";
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
  }
  if (bookingId && !mongoose.Types.ObjectId.isValid(bookingId)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const comment = normalizeComment(body.comment);
  if (!comment.ok) {
    return NextResponse.json({ error: comment.error }, { status: 400 });
  }
  const rate = normalizeRate(body.rate);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.error }, { status: 400 });
  }

  const barber = await Barber.findById(barberId).select("_id userId");
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }
  if (barber.userId?.toString() === user.id) {
    return NextResponse.json({ error: "You cannot review your own barber profile" }, { status: 400 });
  }

  const bookingFilter: Record<string, unknown> = {
    clientId: user.id,
    barberId,
    status: { $in: ["confirmed", "completed"] },
  };
  if (bookingId) bookingFilter._id = bookingId;
  const booking = await Booking.findOne(bookingFilter).select("_id");
  if (!booking) {
    return NextResponse.json(
      { error: "A confirmed or completed booking is required before reviewing this barber" },
      { status: 403 }
    );
  }

  try {
    const review = await Review.findOneAndUpdate(
      { userId: user.id, barberId },
      {
        userId: user.id,
        barberId,
        bookingId: booking._id,
        comment: comment.value,
        rate: rate.value,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "This booking has already been reviewed" }, { status: 409 });
    }
    throw error;
  }
}
