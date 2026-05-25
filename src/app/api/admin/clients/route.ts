import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAdminApi } from "@/lib/adminApi";
import { escapeRegex, parseLimit } from "@/lib/adminQuery";
import Booking from "@/models/Booking";
import Client from "@/models/Client";
import User from "@/models/User";

type IdLike = { toString(): string } | string;

type ClientDoc = {
  _id: IdLike;
  userId?: { _id?: IdLike; name?: string; email?: string; avatar?: string; role?: string } | IdLike;
  whatsapp?: string;
  mobile?: string;
  country?: string;
  state?: string;
  address?: string;
  createdAt?: string;
};

function toId(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

function getUserId(client: ClientDoc) {
  if (!client.userId) return "";
  if (typeof client.userId === "string") return client.userId;
  if ("_id" in client.userId) return toId(client.userId._id);
  return toId(client.userId);
}

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
    const users = await User.find({
      $or: [
        { email: { $regex: safeSearch, $options: "i" } },
        { name: { $regex: safeSearch, $options: "i" } },
      ],
    }).select("_id");

    filter.userId = { $in: users.map((user) => user._id) };
  }

  const clients = (await Client.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .populate({ path: "userId", select: "name email avatar role" })
    .lean()) as unknown as ClientDoc[];

  const userIds = clients.map(getUserId).filter(Boolean);
  const bookingUserIds = userIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const bookingStats = await Booking.aggregate([
    { $match: { clientId: { $in: bookingUserIds } } },
    {
      $group: {
        _id: "$clientId",
        bookingsCount: { $sum: 1 },
        paidBookings: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
        },
        totalSpent: { $sum: "$amountPaid" },
      },
    },
  ]);
  const statsByUserId = new Map(
    bookingStats.map((stat) => [toId(stat._id), stat])
  );

  return NextResponse.json({
    clients: clients.map((client) => ({
      ...client,
      bookingsCount: statsByUserId.get(getUserId(client))?.bookingsCount ?? 0,
      paidBookings: statsByUserId.get(getUserId(client))?.paidBookings ?? 0,
      totalSpent: statsByUserId.get(getUserId(client))?.totalSpent ?? 0,
    })),
  });
}
