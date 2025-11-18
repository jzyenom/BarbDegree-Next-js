import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/authGuard";

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

  const filter: any = { clientId: user.id };

  if (date)
    filter.dateTime = {
      $gte: new Date(date + "T00:00"),
      $lte: new Date(date + "T23:59"),
    };
  if (service) filter.service = service;

  const bookings = await Booking.find(filter).populate("barberId");

  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const booking = await Booking.create({
    ...body,
    clientId: user.id,
  });

  return NextResponse.json({ booking }, { status: 201 });
}
