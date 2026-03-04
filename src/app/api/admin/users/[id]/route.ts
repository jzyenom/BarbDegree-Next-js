import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import { AppRole, isAdminRole, isSuperadminRole } from "@/lib/roles";
import User from "@/models/User";
import Barber from "@/models/Barber";
import Client from "@/models/Client";

const ROLE_OPTIONS: AppRole[] = ["client", "barber", "admin", "superadmin"];
const ADMIN_ASSIGNABLE: AppRole[] = ["client", "barber"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const nextRole = body?.role as AppRole | undefined;

  if (!nextRole || !ROLE_OPTIONS.includes(nextRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const { id } = await params;
  const targetUser = await User.findById(id);

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const requesterIsSuperadmin = isSuperadminRole(user.role);
  const targetRole = (targetUser.role || null) as AppRole | null;
  const targetId = targetUser._id.toString();

  if (targetId === user.id) {
    if (!requesterIsSuperadmin || nextRole !== "superadmin") {
      return NextResponse.json(
        { error: "You cannot change your own role from this dashboard" },
        { status: 400 }
      );
    }
  }

  if (!requesterIsSuperadmin) {
    if (!ADMIN_ASSIGNABLE.includes(nextRole)) {
      return NextResponse.json(
        { error: "Only superadmin can assign admin or superadmin" },
        { status: 403 }
      );
    }

    if (targetRole === "admin" || targetRole === "superadmin") {
      return NextResponse.json(
        { error: "Only superadmin can modify admin-level accounts" },
        { status: 403 }
      );
    }
  }

  targetUser.role = nextRole;
  await targetUser.save();

  if (nextRole === "barber") {
    await Barber.findOneAndUpdate(
      { userId: targetUser._id },
      { $setOnInsert: { userId: targetUser._id } },
      { upsert: true, new: true }
    );
  }

  if (nextRole === "client") {
    await Client.findOneAndUpdate(
      { userId: targetUser._id },
      { $setOnInsert: { userId: targetUser._id } },
      { upsert: true, new: true }
    );
  }

  return NextResponse.json({
    user: {
      _id: targetUser._id.toString(),
      name: targetUser.name || "",
      email: targetUser.email || "",
      role: targetUser.role || null,
      avatar: targetUser.avatar || null,
    },
  });
}

