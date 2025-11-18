import connectToDatabase from "@/database/dbConnect";
import Booking from "@/models/Booking";
import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const id = params.id;
    const booking = await Booking.findById(id).populate("barberId").populate("clientId").lean();
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Create PDF and stream it back
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = doc.pipe(new (require("stream").PassThrough)());

    doc.fontSize(20).text("Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Receipt for booking: ${booking._id}`);
    doc.text(`Client: ${booking.name} (${booking.email})`);
    if (booking.clientId && (booking as any).clientId.name) doc.text(`Client name (profile): ${(booking as any).clientId.name}`);
    doc.text(`Barber: ${(booking as any).barberId?.name || booking.barberId}`);
    doc.text(`Service: ${booking.service}`);
    doc.text(`Date: ${new Date(booking.dateTime).toLocaleString()}`);
    doc.text(`Estimated Price: ${booking.estimatedPrice ? `₦${booking.estimatedPrice}` : "-"}`);
    doc.text(`Amount Paid: ${booking.amountPaid ? `₦${booking.amountPaid}` : "-"}`);
    doc.text(`Payment Reference: ${booking.paymentReference || "-"}`);
    doc.moveDown();
    doc.text("Thank you for using BarbDegree.", { align: "center" });

    doc.end();

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename=receipt_${id}.pdf`);

    return new Response(stream, { status: 200, headers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 });
  }
}
