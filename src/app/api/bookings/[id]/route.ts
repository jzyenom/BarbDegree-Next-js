import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import Barber from "@/models/Barber";
import { requireAuth } from "@/lib/authGuard";
import { notifyUser } from "@/lib/notify";
import { isAdminRole } from "@/lib/roles";

const STATUS_OPTIONS = new Set(["pending", "confirmed", "completed", "declined"]);

function getId(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value && value._id) {
    const doc = value as { _id: { toString(): string } };
    return doc._id.toString();
  }
  if (typeof value === "object" && "toString" in value) {
    const maybeId = value as { toString(): string };
    return maybeId.toString();
  }
  return "";
}

function parseOptionalText(value: unknown, label: string, maxLength: number) {
  if (value == null) return { ok: true as const, value: undefined as string | undefined };
  if (typeof value !== "string") {
    return { ok: false as const, error: `${label} must be a string` };
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    return { ok: false as const, error: `${label} is too long` };
  }

  return { ok: true as const, value: normalized || undefined };
}

async function loadBookingForResponse(id: string) {
  return Booking.findById(id)
    .populate({ path: "clientId", select: "name email avatar role" })
    .populate({
      path: "barberId",
      select: "userId address state country avatar charge",
      populate: { path: "userId", select: "name email avatar role" },
    });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await loadBookingForResponse(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isOwner = getId(booking.clientId) === user.id;
  let isBarberOwner = false;

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id }).select("_id");
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
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isOwner = getId(booking.clientId) === user.id;
  let isBarberOwner = false;

  if (user.role === "barber") {
    const barber = await Barber.findOne({ userId: user.id }).select("_id");
    isBarberOwner = barber ? getId(booking.barberId) === barber._id.toString() : false;
  }

  const isAdmin = isAdminRole(user.role);
  if (!isOwner && !isBarberOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const previousDate = booking.dateTime?.toISOString();
  let nextStatus: string | undefined;
  let dateChanged = false;
  let hasChanges = false;

  if ("status" in body) {
    if (!isBarberOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only the barber can update booking status" },
        { status: 403 }
      );
    }

    if (typeof body.status !== "string" || !STATUS_OPTIONS.has(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    nextStatus = body.status;
    booking.status = nextStatus as "pending" | "confirmed" | "completed" | "declined";
    hasChanges = true;
  }

  if ("service" in body) {
    if (!isBarberOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Only the barber can update service details" },
        { status: 403 }
      );
    }

    if (typeof body.service !== "string" || !body.service.trim()) {
      return NextResponse.json({ error: "Service must be a string" }, { status: 400 });
    }
    const service = body.service.trim();
    if (service.length > 200) {
      return NextResponse.json({ error: "Service is too long" }, { status: 400 });
    }
    booking.service = service;
    hasChanges = true;
  }

  if ("address" in body) {
    const parsedAddress = parseOptionalText(body.address, "Address", 300);
    if (!parsedAddress.ok) {
      return NextResponse.json({ error: parsedAddress.error }, { status: 400 });
    }
    booking.address = parsedAddress.value;
    hasChanges = true;
  }

  if ("note" in body) {
    const parsedNote = parseOptionalText(body.note, "Note", 1000);
    if (!parsedNote.ok) {
      return NextResponse.json({ error: parsedNote.error }, { status: 400 });
    }
    booking.note = parsedNote.value;
    hasChanges = true;
  }

  if ("dateTime" in body) {
    if (typeof body.dateTime !== "string") {
      return NextResponse.json(
        { error: "dateTime must be a valid datetime string" },
        { status: 400 }
      );
    }
    const parsedDate = new Date(body.dateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "dateTime must be a valid datetime string" },
        { status: 400 }
      );
    }

    booking.dateTime = parsedDate;
    dateChanged = previousDate !== booking.dateTime.toISOString();
    hasChanges = true;

    if (dateChanged) {
      const conflictingBooking = await Booking.findOne({
        _id: { $ne: booking._id },
        barberId: booking.barberId,
        dateTime: parsedDate,
        status: { $in: ["pending", "confirmed"] },
      }).select("_id");

      if (conflictingBooking) {
        return NextResponse.json(
          { error: "Selected timeslot is no longer available" },
          { status: 409 }
        );
      }
    }
  }

  if (!hasChanges) {
    return NextResponse.json(
      { error: "No updatable fields were provided" },
      { status: 400 }
    );
  }

  await booking.save();

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
    const barber = await Barber.findById(booking.barberId).select("userId");
    const targetUserIds = new Set<string>();

    if (isBarberOwner) {
      targetUserIds.add(booking.clientId.toString());
    } else if (isOwner) {
      if (barber?.userId) {
        targetUserIds.add(barber.userId.toString());
      }
    } else {
      targetUserIds.add(booking.clientId.toString());
      if (barber?.userId) {
        targetUserIds.add(barber.userId.toString());
      }
    }

    await Promise.all(
      Array.from(targetUserIds)
        .filter(Boolean)
        .map((targetUserId) =>
          notifyUser({
            userId: targetUserId,
            title: "Booking rescheduled",
            message: `${booking.service} moved to ${new Date(
              booking.dateTime
            ).toLocaleString()}`,
            type: "booking_rescheduled",
            data: { bookingId: booking._id.toString() },
          })
        )
    );
  }

  const bookingResponse = await loadBookingForResponse(booking._id.toString());
  return NextResponse.json({ booking: bookingResponse ?? booking });
}
