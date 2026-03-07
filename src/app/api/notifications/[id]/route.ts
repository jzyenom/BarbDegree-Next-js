import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/database/dbConnect";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/authGuard";

/**
 * AUTO-FUNCTION-COMMENT: PATCH
 * Purpose: Handles patch.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized)`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `const { id } = await params;`.
 * 6. Executes `if (!mongoose.Types.ObjectId.isValid(id)) {`.
 * 7. Executes `return NextResponse.json({ error: "Invalid notification id" }, { status: 400 });`.
 * 8. Executes `}`.
 * 9. Executes `const notification = await Notification.findOneAndUpdate(`.
 * 10. Executes `{ _id: id, userId: user.id },`.
 * 11. Executes `{ read: true },`.
 * 12. Executes `{ new: true }`.
 * 13. Executes `);`.
 * 14. Executes `if (!notification) {`.
 * 15. Executes `return NextResponse.json({ error: "Not found" }, { status: 404 });`.
 * 16. Executes `}`.
 * 17. Executes `return NextResponse.json({ notification });`.
 */
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
