import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAdminApi } from "@/lib/adminApi";
import { escapeRegex, parseLimit } from "@/lib/adminQuery";
import Review from "@/models/Review";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const access = await requireAdminApi(req);
  if (access.response) return access.response;

  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const limit = parseLimit(req, 100, 500);
  const filter: Record<string, unknown> = {};

  if (search) {
    const safeSearch = escapeRegex(search.slice(0, 120));
    filter.comment = { $regex: safeSearch, $options: "i" };
  }

  const reviews = await Review.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .populate({ path: "userId", select: "name email avatar role" })
    .populate({
      path: "barberId",
      select: "userId",
      populate: { path: "userId", select: "name email avatar role" },
    })
    .populate({ path: "bookingId", select: "service dateTime status paymentStatus" })
    .lean();

  return NextResponse.json({ reviews });
}
