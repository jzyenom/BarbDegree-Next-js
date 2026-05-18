import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import { createSubscriptionNotification } from "@/lib/subscription-helpers";
import Barber from "@/models/Barber";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const barberId = typeof body.barberId === "string" ? body.barberId.trim() : "";
  const enabled = typeof body.enabled === "boolean" ? body.enabled : null;
  const forcedStatus =
    typeof body.forcedStatus === "boolean" ? body.forcedStatus : Boolean(enabled);

  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
  }
  if (enabled == null) {
    return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
  }

  const barber = await Barber.findByIdAndUpdate(
    barberId,
    {
      adminSubscriptionOverride: enabled,
      adminForcedSubscriptionStatus: forcedStatus,
    },
    { new: true }
  ).populate("userId");

  if (!barber) return NextResponse.json({ error: "Barber not found" }, { status: 404 });

  if (barber.userId?._id) {
    await createSubscriptionNotification({
      userId: barber.userId._id,
      title: "Subscription Access Updated",
      message: forcedStatus
        ? "An admin has enabled booking access for your barber account."
        : "An admin has disabled booking access for your barber account.",
      type: forcedStatus ? "success" : "warning",
      data: {
        adminId: user.id,
        barberId,
        adminSubscriptionOverride: enabled,
        adminForcedSubscriptionStatus: forcedStatus,
      },
    });
  }

  console.info("[admin-subscription-override]", {
    adminId: user.id,
    barberId,
    enabled,
    forcedStatus,
  });

  return NextResponse.json({ barber });
}
