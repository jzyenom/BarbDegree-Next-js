export const runtime = "nodejs";

import { PassThrough, Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import Booking from "@/models/Booking";
import "@/models/Barber";
import "@/models/User";

type PopulatedId =
  | string
  | {
      _id?: { toString(): string };
      email?: string;
      name?: string;
      userId?:
        | string
        | {
            _id?: { toString(): string };
            email?: string;
            name?: string;
          };
    };

type BookingReceipt = {
  _id: { toString(): string };
  clientId?: PopulatedId;
  barberId?: PopulatedId;
  name?: string;
  email?: string;
  service: string;
  services?: { name: string }[];
  dateTime: Date | string;
  estimatedPrice?: number;
  amountPaid?: number;
  paymentReference?: string;
  paymentStatus?: string;
  status?: string;
};

function toObjectIdString(value: PopulatedId | undefined) {
  if (!value || typeof value === "string") {
    return value ?? "";
  }

  return value._id?.toString() ?? "";
}

function toBarberUserId(value: PopulatedId | undefined) {
  if (!value || typeof value === "string") {
    return "";
  }

  if (!value.userId) {
    return "";
  }

  if (typeof value.userId === "string") {
    return value.userId;
  }

  return value.userId._id?.toString() ?? "";
}

function toBarberName(value: PopulatedId | undefined) {
  if (!value || typeof value === "string") {
    return "Barber";
  }

  if (!value.userId || typeof value.userId === "string") {
    return value.name || "Barber";
  }

  return value.userId.name || value.userId.email || value.name || "Barber";
}

function toClientName(booking: BookingReceipt) {
  if (booking.name) {
    return booking.name;
  }

  if (!booking.clientId || typeof booking.clientId === "string") {
    return "Client";
  }

  return booking.clientId.name || booking.clientId.email || "Client";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, unauthorized } = await requireAuth(req);
    if (unauthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
    }
    const booking = (await Booking.findById(id)
      .populate("clientId")
      .populate({ path: "barberId", populate: { path: "userId" } })
      .lean()) as BookingReceipt | null;

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isClientOwner = toObjectIdString(booking.clientId) === user.id;
    const isBarberOwner = toBarberUserId(booking.barberId) === user.id;

    if (!isClientOwner && !isBarberOwner && !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = new PassThrough();
    doc.pipe(stream);

    const servicesLabel =
      booking.services?.length && booking.services.length > 0
        ? booking.services.map((service) => service.name).join(", ")
        : booking.service;
    const estimatedAmount = booking.estimatedPrice ?? 0;
    const amountPaid = booking.amountPaid ?? estimatedAmount;

    doc.fontSize(22).text("BarbDegree Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Receipt ID: ${booking._id.toString()}`);
    doc.text(`Client: ${toClientName(booking)} (${booking.email || "-"})`);
    doc.text(`Barber: ${toBarberName(booking.barberId)}`);
    doc.text(`Service: ${servicesLabel}`);
    doc.text(`Date: ${new Date(booking.dateTime).toLocaleString()}`);
    doc.text(`Estimated Price: NGN ${estimatedAmount}`);
    doc.text(`Amount Paid: NGN ${amountPaid}`);
    doc.text(`Payment Status: ${booking.paymentStatus || "pending"}`);
    doc.text(`Booking Status: ${booking.status || "pending"}`);
    doc.text(`Payment Reference: ${booking.paymentReference || "-"}`);
    doc.moveDown();
    doc.text("Thank you for using BarbDegree.", { align: "center" });
    doc.end();

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      `attachment; filename=receipt_${booking._id.toString()}.pdf`
    );

    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Receipt error:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
