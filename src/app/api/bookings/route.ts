import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Booking from "@/models/Booking";
import Service from "@/models/Service";
import { requireAuth } from "@/lib/authGuard";
import { notifyUser } from "@/lib/notify";
import { isAdminRole } from "@/lib/roles";

type BookingFilter = Record<string, unknown>;

type IncomingServiceRef = {
  _id?: string;
  id?: string;
  serviceId?: string;
};

function collectServiceIds(body: Record<string, unknown>) {
  const ids: string[] = [];

  if (typeof body.serviceId === "string") {
    ids.push(body.serviceId);
  }

  if (Array.isArray(body.serviceIds)) {
    body.serviceIds.forEach((value) => {
      if (typeof value === "string") {
        ids.push(value);
      }
    });
  }

  if (Array.isArray(body.services)) {
    body.services.forEach((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return;
      }

      const item = value as IncomingServiceRef;
      const id = item.serviceId ?? item._id ?? item.id;
      if (typeof id === "string") {
        ids.push(id);
      }
    });
  }

  const uniqueIds: string[] = [];
  ids.forEach((id) => {
    const normalizedId = id.trim();
    if (
      normalizedId &&
      mongoose.Types.ObjectId.isValid(normalizedId) &&
      !uniqueIds.includes(normalizedId)
    ) {
      uniqueIds.push(normalizedId);
    }
  });

  return uniqueIds;
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const service = url.searchParams.get("service");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const filter: BookingFilter = {};

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id });
    if (!barber) {
      return NextResponse.json({ bookings: [] });
    }
    filter.barberId = barber._id;
  } else if (!isAdminRole(user.role)) {
    filter.clientId = user.id;
  }

  if (date) {
    filter.dateTime = {
      $gte: new Date(`${date}T00:00`),
      $lte: new Date(`${date}T23:59`),
    };
  }
  if (service) {
    filter.service = service;
  }
  if (from || to) {
    filter.dateTime = {
      ...(filter.dateTime || {}),
      ...(from ? { $gte: new Date(`${from}T00:00`) } : {}),
      ...(to ? { $lte: new Date(`${to}T23:59`) } : {}),
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
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const bookingName =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : user.name || "Client";
  const bookingEmail =
    typeof body.email === "string" && body.email.trim()
      ? body.email.trim()
      : user.email;

  if (!bookingEmail) {
    return NextResponse.json(
      { error: "Booking email is required" },
      { status: 400 }
    );
  }

  const barberId =
    typeof body.barberId === "string" ? body.barberId.trim() : "";
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
  }

  const barber = await Barber.findById(barberId);
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const requestedServiceIds = collectServiceIds(body);
  if (requestedServiceIds.length === 0) {
    return NextResponse.json(
      { error: "Select at least one service offered by this barber" },
      { status: 400 }
    );
  }

  const services = await Service.find({
    _id: { $in: requestedServiceIds },
    barberId: barber._id,
    isActive: true,
  })
    .select("_id name price durationMinutes")
    .lean();

  if (services.length !== requestedServiceIds.length) {
    return NextResponse.json(
      { error: "One or more selected services are invalid for this barber" },
      { status: 400 }
    );
  }

  const servicesById = new Map(
    services.map((service) => [service._id.toString(), service])
  );
  const orderedServices = requestedServiceIds
    .map((id) => servicesById.get(id))
    .filter(
      (
        service
      ): service is {
        _id: { toString(): string };
        name: string;
        price: number;
        durationMinutes?: number;
      } => Boolean(service)
    );

  const dateTime =
    typeof body.dateTime === "string" ? new Date(body.dateTime) : null;
  if (!dateTime || Number.isNaN(dateTime.getTime())) {
    return NextResponse.json(
      { error: "A valid booking date and time is required" },
      { status: 400 }
    );
  }

  const address =
    typeof body.address === "string" ? body.address.trim() : undefined;
  const note = typeof body.note === "string" ? body.note.trim() : undefined;
  const selectedServices = orderedServices.map((service) => ({
    serviceId: service._id,
    name: service.name,
    price: service.price,
    durationMinutes: service.durationMinutes,
  }));
  const computedService = selectedServices.map((service) => service.name).join(", ");
  const computedPrice = selectedServices.reduce(
    (sum, service) => sum + (service.price || 0),
    0
  );

  const booking = await Booking.create({
    barberId: barber._id,
    clientId: user.id,
    name: bookingName,
    email: bookingEmail,
    address,
    note,
    dateTime,
    service: computedService,
    serviceIds: selectedServices.map((service) => service.serviceId),
    services: selectedServices,
    estimatedPrice: computedPrice,
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
