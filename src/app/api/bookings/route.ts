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

type ServiceSummary = {
  _id: { toString(): string };
  name: string;
  price: number;
  durationMinutes?: number;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SERVICE_FILTER_LENGTH = 120;
const MAX_NAME_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 300;
const MAX_NOTE_LENGTH = 1000;

function parseDayStart(day: string) {
  return new Date(`${day}T00:00:00.000`);
}

function parseDayEnd(day: string) {
  return new Date(`${day}T23:59:59.999`);
}

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

function parseOptionalText(value: unknown, field: string, maxLength: number) {
  if (value == null) return { ok: true as const, value: undefined as string | undefined };
  if (typeof value !== "string") {
    return { ok: false as const, error: `${field} must be a string` };
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    return { ok: false as const, error: `${field} is too long` };
  }

  return { ok: true as const, value: normalized || undefined };
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date")?.trim() || "";
  const service = url.searchParams.get("service")?.trim() || "";
  const from = url.searchParams.get("from")?.trim() || "";
  const to = url.searchParams.get("to")?.trim() || "";

  if (date && !DATE_ONLY_PATTERN.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }
  if (from && !DATE_ONLY_PATTERN.test(from)) {
    return NextResponse.json({ error: "Invalid from date format" }, { status: 400 });
  }
  if (to && !DATE_ONLY_PATTERN.test(to)) {
    return NextResponse.json({ error: "Invalid to date format" }, { status: 400 });
  }
  if (service.length > MAX_SERVICE_FILTER_LENGTH) {
    return NextResponse.json({ error: "Service filter is too long" }, { status: 400 });
  }
  if (from && to) {
    const fromDate = parseDayStart(from);
    const toDate = parseDayEnd(to);
    if (fromDate.getTime() > toDate.getTime()) {
      return NextResponse.json(
        { error: "From date cannot be after to date" },
        { status: 400 }
      );
    }
  }

  const filter: BookingFilter = {};

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id }).select("_id");
    if (!barber) {
      return NextResponse.json({ bookings: [] });
    }
    filter.barberId = barber._id;
  } else if (!isAdminRole(user.role)) {
    filter.clientId = user.id;
  }

  if (date) {
    filter.dateTime = {
      $gte: parseDayStart(date),
      $lte: parseDayEnd(date),
    };
  }
  if (service) {
    filter.service = service;
  }
  if (from || to) {
    filter.dateTime = {
      ...(filter.dateTime || {}),
      ...(from ? { $gte: parseDayStart(from) } : {}),
      ...(to ? { $lte: parseDayEnd(to) } : {}),
    };
  }

  const requestedLimit = Number(url.searchParams.get("limit") || 100);
  const normalizedLimit = Number.isFinite(requestedLimit)
    ? Math.floor(requestedLimit)
    : 100;
  const maxLimit = isAdminRole(user.role) ? 500 : 200;
  const limit = Math.min(Math.max(normalizedLimit, 1), maxLimit);

  const bookings = await Booking.find(filter)
    .sort({ dateTime: -1, _id: -1 })
    .limit(limit)
    .populate({ path: "clientId", select: "name email avatar role" })
    .populate({
      path: "barberId",
      select: "userId address state country avatar charge",
      populate: { path: "userId", select: "name email avatar role" },
    });

  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Record<string, unknown>;

  const bookingNameInput =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : user.name || "Client";
  if (!bookingNameInput || bookingNameInput.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Invalid booking name" }, { status: 400 });
  }

  const bookingEmailInput =
    typeof body.email === "string" && body.email.trim()
      ? body.email.trim().toLowerCase()
      : user.email?.trim()?.toLowerCase();
  if (!bookingEmailInput || !EMAIL_PATTERN.test(bookingEmailInput)) {
    return NextResponse.json(
      { error: "A valid booking email is required" },
      { status: 400 }
    );
  }

  const barberId =
    typeof body.barberId === "string" ? body.barberId.trim() : "";
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
  }

  const barber = await Barber.findById(barberId).select("_id userId isSubscribed");
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }
  if (!barber.isSubscribed) {
    return NextResponse.json(
      { error: "Barber is not subscribed" },
      { status: 403 }
    );
  }

  const requestedServiceIds = collectServiceIds(body);
  if (requestedServiceIds.length === 0) {
    return NextResponse.json(
      { error: "Select at least one service offered by this barber" },
      { status: 400 }
    );
  }

  const services = (await Service.find({
    _id: { $in: requestedServiceIds },
    barberId: barber._id,
    isActive: true,
  })
    .select("_id name price durationMinutes")
    .lean()) as unknown as ServiceSummary[];

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
    .filter((service): service is ServiceSummary => Boolean(service));

  const dateTime =
    typeof body.dateTime === "string" ? new Date(body.dateTime) : null;
  if (!dateTime || Number.isNaN(dateTime.getTime())) {
    return NextResponse.json(
      { error: "A valid booking date and time is required" },
      { status: 400 }
    );
  }
  const now = Date.now();
  if (dateTime.getTime() < now - 60 * 1000) {
    return NextResponse.json(
      { error: "Booking time cannot be in the past" },
      { status: 400 }
    );
  }
  if (dateTime.getTime() > now + 365 * 24 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "Booking time is too far in the future" },
      { status: 400 }
    );
  }

  const parsedAddress = parseOptionalText(body.address, "Address", MAX_ADDRESS_LENGTH);
  if (!parsedAddress.ok) {
    return NextResponse.json({ error: parsedAddress.error }, { status: 400 });
  }
  const parsedNote = parseOptionalText(body.note, "Note", MAX_NOTE_LENGTH);
  if (!parsedNote.ok) {
    return NextResponse.json({ error: parsedNote.error }, { status: 400 });
  }

  const existingBooking = await Booking.findOne({
    barberId: barber._id,
    dateTime,
    status: { $in: ["pending", "confirmed"] },
  }).select("_id");
  if (existingBooking) {
    return NextResponse.json(
      { error: "Selected timeslot is no longer available" },
      { status: 409 }
    );
  }

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
    name: bookingNameInput,
    email: bookingEmailInput,
    address: parsedAddress.value,
    note: parsedNote.value,
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
