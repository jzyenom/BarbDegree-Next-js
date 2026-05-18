import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import { requireAuth } from "@/lib/authGuard";

type PaidAcceptedBooking = {
  _id: mongoose.Types.ObjectId;
  service: string;
  services?: { name: string; price?: number; durationMinutes?: number }[];
  dateTime: Date;
  status?: string;
  estimatedPrice?: number;
  amountPaid?: number;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ eligible: false, bookings: [] }, { status: 401 });
  }
  if (user.role !== "client") {
    return NextResponse.json({ eligible: false, bookings: [] });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
  }

  const barber = await Barber.findById(id).select("_id");
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const paidAcceptedBookings = (await Booking.find({
    barberId: barber._id,
    clientId: user.id,
    paymentStatus: "paid",
    status: { $in: ["confirmed", "completed"] },
  })
    .sort({ dateTime: -1 })
    .select("_id service services dateTime status estimatedPrice amountPaid")
    .lean()) as unknown as PaidAcceptedBooking[];

  if (paidAcceptedBookings.length === 0) {
    return NextResponse.json({ eligible: false, bookings: [] });
  }

  const bookingIds = paidAcceptedBookings.map((booking) => booking._id);
  const reviewedRows = await Review.find({ bookingId: { $in: bookingIds } })
    .select("bookingId")
    .lean();
  const reviewedBookingIds = new Set(
    reviewedRows.map((review) => review.bookingId?.toString()).filter(Boolean)
  );
  const eligibleBookings = paidAcceptedBookings
    .filter((booking) => !reviewedBookingIds.has(booking._id.toString()))
    .map((booking) => ({
      _id: booking._id.toString(),
      service: booking.service,
      services: booking.services,
      dateTime: booking.dateTime,
      status: booking.status,
      estimatedPrice: booking.estimatedPrice,
      amountPaid: booking.amountPaid,
    }));

  return NextResponse.json({
    eligible: eligibleBookings.length > 0,
    bookings: eligibleBookings,
  });
}
