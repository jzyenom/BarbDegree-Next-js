import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/authGuard";
import Barber from "@/models/Barber";
import { notifyUser } from "@/lib/notify";
import { isAdminRole } from "@/lib/roles";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const service = url.searchParams.get("service");
  // const from = url.searchParams.get("from");
  // const to = url.searchParams.get("to");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const filter: Record<string, unknown> = {};

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id });
    if (!barber) return NextResponse.json({ bookings: [] });
    filter.barberId = barber._id;
  } else if (isAdminRole(user.role)) {
    // admin sees all
  } else {
    filter.clientId = user.id;
  }

  if (date)
    filter.dateTime = {
      $gte: new Date(date + "T00:00"),
      $lte: new Date(date + "T23:59"),
    };
  if (service) filter.service = service;
  if (from || to) {
    filter.dateTime = {
      ...(filter.dateTime || {}),
      ...(from ? { $gte: new Date(from + "T00:00") } : {}),
      ...(to ? { $lte: new Date(to + "T23:59") } : {}),
    };
  }

  const bookings = await Booking.find(filter)
    .populate("barberId")
    .populate("clientId");

  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const bookingName = body.name || user.name || "Client";
  const bookingEmail = body.email || user.email;

  if (!bookingEmail) {
    return NextResponse.json(
      { error: "Booking email is required" },
      { status: 400 }
    );
  }

  const barber = await Barber.findById(body.barberId);
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  if (!barber.isSubscribed) {
    return NextResponse.json(
      { error: "Barber is not subscribed" },
      { status: 403 }
    );
  }

  const booking = await Booking.create({
    ...body,
    name: bookingName,
    email: bookingEmail,
    clientId: user.id,
  });

  await notifyUser({
    userId: barber.userId.toString(),
    title: "New booking",
    message: `${booking.service} booked for ${new Date(
      booking.dateTime
    ).toLocaleString()}`,
    type: "booking_created",
    data: { bookingId: booking._id.toString() },
  });

  return NextResponse.json({ booking }, { status: 201 });
}
