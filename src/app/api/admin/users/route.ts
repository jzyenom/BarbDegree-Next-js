import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import User from "@/models/User";
import Barber from "@/models/Barber";
import Client from "@/models/Client";

type IdLike = { toString(): string } | string;

type UserListDoc = {
  _id: IdLike;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
};

type BarberProfileDoc = {
  _id: IdLike;
  userId: IdLike;
  isSubscribed?: boolean;
};

type ClientProfileDoc = {
  _id: IdLike;
  userId: IdLike;
};

function toIdString(value: IdLike | null | undefined) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim();
  const role = url.searchParams.get("role")?.trim();
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 200);

  const filter: Record<string, unknown> = {};

  if (role) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];
  }

  const users = (await User.find(filter)
    .sort({ _id: -1 })
    .limit(limit)
    .lean()) as UserListDoc[];

  const userIds = users.map((u) => u._id);

  const [barberProfiles, clientProfiles] = (await Promise.all([
    Barber.find({ userId: { $in: userIds } }).select("_id userId isSubscribed").lean(),
    Client.find({ userId: { $in: userIds } }).select("_id userId").lean(),
  ])) as [BarberProfileDoc[], ClientProfileDoc[]];

  const barberByUserId = new Map(
    barberProfiles.map((b) => [toIdString(b.userId), b])
  );
  const clientByUserId = new Map(
    clientProfiles.map((c) => [toIdString(c.userId), c])
  );

  const items = users.map((u) => {
    const key = toIdString(u._id);
    const barber = barberByUserId.get(key);
    const client = clientByUserId.get(key);

    return {
      _id: key,
      name: u.name || "",
      email: u.email || "",
      role: u.role || null,
      avatar: u.avatar || null,
      hasBarberProfile: Boolean(barber),
      hasClientProfile: Boolean(client),
      barberProfileId: barber ? toIdString(barber._id) : null,
      clientProfileId: client ? toIdString(client._id) : null,
      barberSubscribed: barber?.isSubscribed ?? null,
    };
  });

  return NextResponse.json({ users: items });
}
