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

/**
 * AUTO-FUNCTION-COMMENT: toIdString
 * Purpose: Handles to id string.
 * Line-by-line:
 * 1. Executes `if (!value) return "";`.
 * 2. Executes `return typeof value === "string" ? value : value.toString();`.
 */
function toIdString(value: IdLike | null | undefined) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

/**
 * AUTO-FUNCTION-COMMENT: escapeRegex
 * Purpose: Handles escape regex.
 * Line-by-line:
 * 1. Executes `return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");`.
 */
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ROLE_OPTIONS: AppRole[] = ["client", "barber", "admin", "superadmin"];

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `if (!isAdminRole(user.role)) {`.
 * 7. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 8. Executes `}`.
 * 9. Executes `const url = new URL(req.url);`.
 * 10. Executes `const search = url.searchParams.get("search")?.trim() || "";`.
 * 11. Executes `const role = url.searchParams.get("role")?.trim() || "";`.
 * 12. Executes `const requestedLimit = Number(url.searchParams.get("limit") || 100);`.
 * 13. Executes `const parsedLimit = Number.isFinite(requestedLimit)`.
 * 14. Executes `? Math.floor(requestedLimit)`.
 * 15. Executes `: 100;`.
 * 16. Executes `const limit = Math.min(Math.max(parsedLimit, 1), 200);`.
 * 17. Executes `const filter: Record<string, unknown> = {};`.
 * 18. Executes `if (role && ROLE_OPTIONS.includes(role as AppRole)) {`.
 * 19. Executes `filter.role = role;`.
 * 20. Executes `}`.
 * 21. Executes `if (search) {`.
 * 22. Executes `const safeSearch = escapeRegex(search.slice(0, 120));`.
 * 23. Executes `filter.$or = [`.
 * 24. Executes `{ email: { $regex: safeSearch, $options: "i" } },`.
 * 25. Executes `{ name: { $regex: safeSearch, $options: "i" } },`.
 * 26. Executes `];`.
 * 27. Executes `}`.
 * 28. Executes `const users = (await User.find(filter)`.
 * 29. Executes `.sort({ _id: -1 })`.
 * 30. Executes `.limit(limit)`.
 * 31. Executes `.lean()) as UserListDoc[];`.
 * 32. Executes `const userIds = users.map((u) => u._id);`.
 * 33. Executes `const [barberProfilesRaw, clientProfilesRaw] = await Promise.all([`.
 * 34. Executes `Barber.find({ userId: { $in: userIds } }).select("_id userId isSubscribed").lean(),`.
 * 35. Executes `Client.find({ userId: { $in: userIds } }).select("_id userId").lean(),`.
 * 36. Executes `]);`.
 * 37. Executes `const barberProfiles = barberProfilesRaw as unknown as BarberProfileDoc[];`.
 * 38. Executes `const clientProfiles = clientProfilesRaw as unknown as ClientProfileDoc[];`.
 * 39. Executes `const barberByUserId = new Map(`.
 * 40. Executes `barberProfiles.map((b) => [toIdString(b.userId), b])`.
 * 41. Executes `);`.
 * 42. Executes `const clientByUserId = new Map(`.
 * 43. Executes `clientProfiles.map((c) => [toIdString(c.userId), c])`.
 * 44. Executes `);`.
 * 45. Executes `const items = users.map((u) => {`.
 * 46. Executes `const key = toIdString(u._id);`.
 * 47. Executes `const barber = barberByUserId.get(key);`.
 * 48. Executes `const client = clientByUserId.get(key);`.
 * 49. Executes `return {`.
 * 50. Executes `_id: key,`.
 * 51. Executes `name: u.name || "",`.
 * 52. Executes `email: u.email || "",`.
 * 53. Executes `role: u.role || null,`.
 * 54. Executes `avatar: u.avatar || null,`.
 * 55. Executes `hasBarberProfile: Boolean(barber),`.
 * 56. Executes `hasClientProfile: Boolean(client),`.
 * 57. Executes `barberProfileId: barber ? toIdString(barber._id) : null,`.
 * 58. Executes `clientProfileId: client ? toIdString(client._id) : null,`.
 * 59. Executes `barberSubscribed: barber?.isSubscribed ?? null,`.
 * 60. Executes `};`.
 * 61. Executes `});`.
 * 62. Executes `return NextResponse.json({ users: items });`.
 */
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
