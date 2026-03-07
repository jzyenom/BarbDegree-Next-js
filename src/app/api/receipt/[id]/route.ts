/**
 * AUTO-FILE-COMMENT: src/app/api/receipt/[id]/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
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

/**
 * AUTO-FUNCTION-COMMENT: toObjectIdString
 * Purpose: Handles to object id string.
 * Line-by-line:
 * 1. Executes `if (!value || typeof value === "string") {`.
 * 2. Executes `return value ?? "";`.
 * 3. Executes `}`.
 * 4. Executes `return value._id?.toString() ?? "";`.
 */
function toObjectIdString(value: PopulatedId | undefined) {
  if (!value || typeof value === "string") {
    return value ?? "";
  }

  return value._id?.toString() ?? "";
}

/**
 * AUTO-FUNCTION-COMMENT: toBarberUserId
 * Purpose: Handles to barber user id.
 * Line-by-line:
 * 1. Executes `if (!value || typeof value === "string") {`.
 * 2. Executes `return "";`.
 * 3. Executes `}`.
 * 4. Executes `if (!value.userId) {`.
 * 5. Executes `return "";`.
 * 6. Executes `}`.
 * 7. Executes `if (typeof value.userId === "string") {`.
 * 8. Executes `return value.userId;`.
 * 9. Executes `}`.
 * 10. Executes `return value.userId._id?.toString() ?? "";`.
 */
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

/**
 * AUTO-FUNCTION-COMMENT: toBarberName
 * Purpose: Handles to barber name.
 * Line-by-line:
 * 1. Executes `if (!value || typeof value === "string") {`.
 * 2. Executes `return "Barber";`.
 * 3. Executes `}`.
 * 4. Executes `if (!value.userId || typeof value.userId === "string") {`.
 * 5. Executes `return value.name || "Barber";`.
 * 6. Executes `}`.
 * 7. Executes `return value.userId.name || value.userId.email || value.name || "Barber";`.
 */
function toBarberName(value: PopulatedId | undefined) {
  if (!value || typeof value === "string") {
    return "Barber";
  }

  if (!value.userId || typeof value.userId === "string") {
    return value.name || "Barber";
  }

  return value.userId.name || value.userId.email || value.name || "Barber";
}

/**
 * AUTO-FUNCTION-COMMENT: toClientName
 * Purpose: Handles to client name.
 * Line-by-line:
 * 1. Executes `if (booking.name) {`.
 * 2. Executes `return booking.name;`.
 * 3. Executes `}`.
 * 4. Executes `if (!booking.clientId || typeof booking.clientId === "string") {`.
 * 5. Executes `return "Client";`.
 * 6. Executes `}`.
 * 7. Executes `return booking.clientId.name || booking.clientId.email || "Client";`.
 */
function toClientName(booking: BookingReceipt) {
  if (booking.name) {
    return booking.name;
  }

  if (!booking.clientId || typeof booking.clientId === "string") {
    return "Client";
  }

  return booking.clientId.name || booking.clientId.email || "Client";
}

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `try {`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `await connectToDatabase();`.
 * 7. Executes `const { id } = await params;`.
 * 8. Executes `if (!mongoose.Types.ObjectId.isValid(id)) {`.
 * 9. Executes `return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });`.
 * 10. Executes `}`.
 * 11. Executes `const booking = (await Booking.findById(id)`.
 * 12. Executes `.populate("clientId")`.
 * 13. Executes `.populate({ path: "barberId", populate: { path: "userId" } })`.
 * 14. Executes `.lean()) as BookingReceipt | null;`.
 * 15. Executes `if (!booking) {`.
 * 16. Executes `return NextResponse.json({ error: "Booking not found" }, { status: 404 });`.
 * 17. Executes `}`.
 * 18. Executes `const isClientOwner = toObjectIdString(booking.clientId) === user.id;`.
 * 19. Executes `const isBarberOwner = toBarberUserId(booking.barberId) === user.id;`.
 * 20. Executes `if (!isClientOwner && !isBarberOwner && !isAdminRole(user.role)) {`.
 * 21. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 22. Executes `}`.
 * 23. Executes `const doc = new PDFDocument({ size: "A4", margin: 50 });`.
 * 24. Executes `const stream = new PassThrough();`.
 * 25. Executes `doc.pipe(stream);`.
 * 26. Executes `const servicesLabel =`.
 * 27. Executes `booking.services?.length && booking.services.length > 0`.
 * 28. Executes `? booking.services.map((service) => service.name).join(", ")`.
 * 29. Executes `: booking.service;`.
 * 30. Executes `const estimatedAmount = booking.estimatedPrice ?? 0;`.
 * 31. Executes `const amountPaid = booking.amountPaid ?? estimatedAmount;`.
 * 32. Executes `doc.fontSize(22).text("BarbDegree Receipt", { align: "center" });`.
 * 33. Executes `doc.moveDown();`.
 * 34. Executes `doc.fontSize(12).text(\`Receipt ID: ${booking._id.toString()}\`);`.
 * 35. Executes `doc.text(\`Client: ${toClientName(booking)} (${booking.email || "-"})\`);`.
 * 36. Executes `doc.text(\`Barber: ${toBarberName(booking.barberId)}\`);`.
 * 37. Executes `doc.text(\`Service: ${servicesLabel}\`);`.
 * 38. Executes `doc.text(\`Date: ${new Date(booking.dateTime).toLocaleString()}\`);`.
 * 39. Executes `doc.text(\`Estimated Price: NGN ${estimatedAmount}\`);`.
 * 40. Executes `doc.text(\`Amount Paid: NGN ${amountPaid}\`);`.
 * 41. Executes `doc.text(\`Payment Status: ${booking.paymentStatus || "pending"}\`);`.
 * 42. Executes `doc.text(\`Booking Status: ${booking.status || "pending"}\`);`.
 * 43. Executes `doc.text(\`Payment Reference: ${booking.paymentReference || "-"}\`);`.
 * 44. Executes `doc.moveDown();`.
 * 45. Executes `doc.text("Thank you for using BarbDegree.", { align: "center" });`.
 * 46. Executes `doc.end();`.
 * 47. Executes `const headers = new Headers();`.
 * 48. Executes `headers.set("Content-Type", "application/pdf");`.
 * 49. Executes `headers.set(`.
 * 50. Executes `"Content-Disposition",`.
 * 51. Executes `\`attachment; filename=receipt_${booking._id.toString()}.pdf\``.
 * 52. Executes `);`.
 * 53. Executes `return new Response(Readable.toWeb(stream) as ReadableStream, {`.
 * 54. Executes `status: 200,`.
 * 55. Executes `headers,`.
 * 56. Executes `});`.
 * 57. Executes `} catch (error) {`.
 * 58. Executes `console.error("Receipt error:", error);`.
 * 59. Executes `return NextResponse.json(`.
 * 60. Executes `{ error: "Failed to generate receipt" },`.
 * 61. Executes `{ status: 500 }`.
 * 62. Executes `);`.
 * 63. Executes `}`.
 */
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
