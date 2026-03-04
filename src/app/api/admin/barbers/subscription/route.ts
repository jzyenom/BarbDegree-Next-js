import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const barberId = body.barberId;
  const isSubscribed = Boolean(body.isSubscribed);

  const barber = await Barber.findByIdAndUpdate(
    barberId,
    { isSubscribed },
    { new: true }
  );

  if (!barber) return NextResponse.json({ error: "Barber not found" }, { status: 404 });

  return NextResponse.json({ barber });
}
