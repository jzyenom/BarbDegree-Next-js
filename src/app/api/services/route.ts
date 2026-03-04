import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Service from "@/models/Service";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import { parseServicePayload } from "@/lib/servicePayload";

type BarberWithServices = {
  services?: unknown[];
  toObject(options?: { virtuals?: boolean }): { services?: unknown[] };
};

function readVirtualServices(barber: BarberWithServices | null) {
  if (!barber) {
    return [];
  }

  const serialized = barber.toObject({ virtuals: true });
  return Array.isArray(serialized.services) ? serialized.services : [];
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const barberId = url.searchParams.get("barberId");

  if (barberId) {
    if (!mongoose.Types.ObjectId.isValid(barberId)) {
      return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
    }

    const barber = (await Barber.findById(barberId).populate({
      path: "services",
      match: { isActive: true },
      options: { sort: { price: 1, name: 1 } },
    })) as BarberWithServices | null;

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    return NextResponse.json({ services: readVirtualServices(barber) });
  }

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isAdminRole(user.role)) {
    const services = await Service.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ services });
  }

  if (user.role !== "barber") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const barber = (await Barber.findOne({ userId: user.id }).populate({
    path: "services",
    options: { sort: { createdAt: -1 } },
  })) as BarberWithServices | null;

  if (!barber) {
    return NextResponse.json({ services: [] });
  }

  return NextResponse.json({ services: readVirtualServices(barber) });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "barber") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const barber = await Barber.findOne({ userId: user.id });
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const body = await req.json();
  const { data, error } = parseServicePayload(body);
  if (error || !data) {
    return NextResponse.json(
      { error: error ?? "Invalid service payload" },
      { status: 400 }
    );
  }

  try {
    const service = await Service.create({
      barberId: barber._id,
      ...data,
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (createError) {
    if (
      typeof createError === "object" &&
      createError &&
      "code" in createError &&
      createError.code === 11000
    ) {
      return NextResponse.json(
        { error: "You already added a service with that name" },
        { status: 409 }
      );
    }

    throw createError;
  }
}
