import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/authGuard";
import { notifyUser } from "@/lib/notify";
import { isAdminRole } from "@/lib/roles";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const barber = await Barber.findOne({ userId: user.id }).select("_id");
  const isBarberOwner = barber?._id.toString() === booking.barberId.toString();
  if (!isBarberOwner && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  booking.status = "confirmed";
  await booking.save();

  await notifyUser({
    userId: booking.clientId.toString(),
    title: "Booking accepted",
    message: `Your booking for ${booking.service} was accepted`,
    type: "booking_accepted",
    data: {
      bookingId: booking._id.toString(),
      service: booking.service,
      dateTime: booking.dateTime,
    },
  });

  return NextResponse.json({ booking, message: "Booking accepted" });
}
