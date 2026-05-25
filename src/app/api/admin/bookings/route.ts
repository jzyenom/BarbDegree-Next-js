import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAdminApi } from "@/lib/adminApi";
import { escapeRegex, parseDateRange, parseLimit } from "@/lib/adminQuery";
import Booking from "@/models/Booking";

const BOOKING_STATUSES = new Set(["pending", "confirmed", "completed", "declined"]);
const PAYMENT_STATUSES = new Set(["pending", "paid", "failed"]);

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const access = await requireAdminApi(req);
  if (access.response) return access.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status")?.trim() || "";
  const paymentStatus = url.searchParams.get("paymentStatus")?.trim() || "";
  const search = url.searchParams.get("search")?.trim() || "";
  const limit = parseLimit(req, 100, 500);
  const filter: Record<string, unknown> = {};
  const dateRange = parseDateRange(req);

  if (dateRange.error) {
    return NextResponse.json({ error: dateRange.error }, { status: 400 });
  }

  if (BOOKING_STATUSES.has(status)) {
    filter.status = status;
  }

  if (PAYMENT_STATUSES.has(paymentStatus)) {
    filter.paymentStatus = paymentStatus;
  }

  if (dateRange.range && Object.keys(dateRange.range).length > 0) {
    filter.dateTime = dateRange.range;
  }

  if (search) {
    const safeSearch = escapeRegex(search.slice(0, 120));
    filter.$or = [
      { service: { $regex: safeSearch, $options: "i" } },
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { paymentReference: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const bookings = await Booking.find(filter)
    .sort({ dateTime: -1, _id: -1 })
    .limit(limit)
    .populate({ path: "clientId", select: "name email avatar role" })
    .populate({
      path: "barberId",
      select: "userId address state country avatar charge",
      populate: { path: "userId", select: "name email avatar role" },
    })
    .lean();

  return NextResponse.json({ bookings });
}
