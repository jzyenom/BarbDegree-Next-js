import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import User from "@/models/User";
import Barber from "@/models/Barber";
import Client from "@/models/Client";
import { AppRole } from "@/lib/roles";

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

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ROLE_OPTIONS: AppRole[] = ["client", "barber", "admin", "superadmin"];

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
  const search = url.searchParams.get("search")?.trim() || "";
  const role = url.searchParams.get("role")?.trim() || "";
  const requestedLimit = Number(url.searchParams.get("limit") || 100);
  const parsedLimit = Number.isFinite(requestedLimit)
    ? Math.floor(requestedLimit)
    : 100;
  const limit = Math.min(Math.max(parsedLimit, 1), 200);

  const filter: Record<string, unknown> = {};

  if (role && ROLE_OPTIONS.includes(role as AppRole)) {
    filter.role = role;
  }

  if (search) {
    const safeSearch = escapeRegex(search.slice(0, 120));
    filter.$or = [
      { email: { $regex: safeSearch, $options: "i" } },
      { name: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const users = (await User.find(filter)
    .sort({ _id: -1 })
    .limit(limit)
    .lean()) as UserListDoc[];

  const userIds = users.map((u) => u._id);

  const [barberProfilesRaw, clientProfilesRaw] = await Promise.all([
    Barber.find({ userId: { $in: userIds } }).select("_id userId isSubscribed").lean(),
    Client.find({ userId: { $in: userIds } }).select("_id userId").lean(),
  ]);
  const barberProfiles = barberProfilesRaw as unknown as BarberProfileDoc[];
  const clientProfiles = clientProfilesRaw as unknown as ClientProfileDoc[];

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
