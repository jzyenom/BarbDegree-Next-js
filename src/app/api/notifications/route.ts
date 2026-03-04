import { NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/authGuard";

export async function GET(req: Request) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req as any);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await Notification.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json({ notifications });
}
