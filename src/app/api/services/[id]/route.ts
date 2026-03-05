import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Service from "@/models/Service";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import { parseServicePayload } from "@/lib/servicePayload";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { data, error } = parseServicePayload(body, { partial: true });
  if (error || !data) {
    return NextResponse.json(
      { error: error ?? "Invalid service payload" },
      { status: 400 }
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid service id" }, { status: 400 });
  }

  try {
    if (isAdminRole(user.role)) {
      const service = await Service.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ service });
    }

    if (user.role !== "barber") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const barber = await Barber.findOne({ userId: user.id });
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    const service = await Service.findOneAndUpdate(
      { _id: id, barberId: barber._id },
      data,
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (updateError) {
    if (
      typeof updateError === "object" &&
      updateError &&
      "code" in updateError &&
      updateError.code === 11000
    ) {
      return NextResponse.json(
        { error: "You already added a service with that name" },
        { status: 409 }
      );
    }

    throw updateError;
  }
}

export async function DELETE(
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
    return NextResponse.json({ error: "Invalid service id" }, { status: 400 });
  }

  if (isAdminRole(user.role)) {
    await Service.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  }

  if (user.role !== "barber") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const barber = await Barber.findOne({ userId: user.id });
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const deleted = await Service.findOneAndDelete({
    _id: id,
    barberId: barber._id,
  });

  if (!deleted) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
