import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Barber from "@/models/Barber";
import { requireAuth } from "@/lib/authGuard";
import { notifyUser } from "@/lib/notify";
import { isAdminRole } from "@/lib/roles";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await Booking.findById(id)
    .populate("clientId")
    .populate({ path: "barberId", populate: { path: "userId" } });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const getId = (value: any) =>
    typeof value === "string"
      ? value
      : value?._id
      ? value._id.toString()
      : value?.toString?.() ?? "";

  const isOwner = getId(booking.clientId) === user.id;
  let isBarberOwner = false;

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id });
    isBarberOwner = barber ? getId(booking.barberId) === barber._id.toString() : false;
  }

  if (!isOwner && !isBarberOwner && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ booking });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const getId = (value: any) =>
    typeof value === "string"
      ? value
      : value?._id
      ? value._id.toString()
      : value?.toString?.() ?? "";

  let isOwner = getId(booking.clientId) === user.id;
  let isBarberOwner = false;

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id });
    isBarberOwner = barber ? getId(booking.barberId) === barber._id.toString() : false;
  }

  if (!isOwner && !isBarberOwner && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const nextStatus = body.status;
  const nextDateTime = body.dateTime;

  if (nextStatus === "declined" && !isBarberOwner && !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Only the barber can decline" }, { status: 403 });
  }

  const previousDate = booking.dateTime?.toISOString();

  booking.service = body.service ?? booking.service;
  booking.address = body.address ?? booking.address;
  booking.note = body.note ?? booking.note;
  booking.dateTime = nextDateTime ?? booking.dateTime;
  booking.status = nextStatus ?? booking.status;

  await booking.save();

  const dateChanged =
    nextDateTime && previousDate !== new Date(nextDateTime).toISOString();

  if (nextStatus === "declined") {
    await notifyUser({
      userId: booking.clientId.toString(),
      title: "Booking declined",
      message: `Your booking for ${booking.service} was declined`,
      type: "booking_declined",
      data: {
        bookingId: booking._id.toString(),
        service: booking.service,
        dateTime: booking.dateTime,
      },
    });
  } else if (nextStatus === "confirmed") {
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
  } else if (dateChanged) {
    const barber = await Barber.findById(booking.barberId);
    const targetUserId = isBarberOwner
      ? booking.clientId.toString()
      : barber?.userId?.toString();

    if (targetUserId) {
      await notifyUser({
        userId: targetUserId,
        title: "Booking rescheduled",
        message: `${booking.service} moved to ${new Date(
          booking.dateTime
        ).toLocaleString()}`,
        type: "booking_rescheduled",
        data: { bookingId: booking._id.toString() },
      });
    }
  }

  return NextResponse.json({ booking });
}
