import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAdminApi } from "@/lib/adminApi";
import { escapeRegex, parseDateRange, parseLimit } from "@/lib/adminQuery";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

const TRANSACTION_STATUSES = new Set(["pending", "success", "failed"]);
const TRANSACTION_TYPES = new Set(["booking_payment", "barber_subscription"]);

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const access = await requireAdminApi(req);
  if (access.response) return access.response;

  const url = new URL(req.url);
  const status = url.searchParams.get("status")?.trim() || "";
  const type = url.searchParams.get("type")?.trim() || "";
  const search = url.searchParams.get("search")?.trim() || "";
  const limit = parseLimit(req, 100, 500);
  const filter: Record<string, unknown> = {};
  const dateRange = parseDateRange(req);

  if (dateRange.error) {
    return NextResponse.json({ error: dateRange.error }, { status: 400 });
  }

  if (TRANSACTION_STATUSES.has(status)) {
    filter.status = status;
  }

  if (TRANSACTION_TYPES.has(type)) {
    filter.type = type;
  }

  if (dateRange.range && Object.keys(dateRange.range).length > 0) {
    filter.createdAt = dateRange.range;
  }

  if (search) {
    const safeSearch = escapeRegex(search.slice(0, 120));
    const users = await User.find({
      $or: [
        { email: { $regex: safeSearch, $options: "i" } },
        { name: { $regex: safeSearch, $options: "i" } },
      ],
    }).select("_id");

    filter.$or = [
      { reference: { $regex: safeSearch, $options: "i" } },
      { userId: { $in: users.map((user) => user._id) } },
    ];
  }

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .populate({ path: "userId", select: "name email avatar role" })
    .populate({ path: "bookingId", select: "service dateTime paymentStatus status" })
    .populate({ path: "subscriptionId", select: "reference status amount" })
    .lean();

  return NextResponse.json({ transactions });
}
