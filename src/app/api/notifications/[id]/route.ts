import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/database/dbConnect";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/authGuard";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid notification id" }, { status: 400 });
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: user.id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ notification });
}
