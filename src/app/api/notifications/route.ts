/**
 * AUTO-FILE-COMMENT: src/app/api/notifications/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/authGuard";

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized)`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `const notifications = await Notification.find({ userId: user.id })`.
 * 6. Executes `.sort({ createdAt: -1 })`.
 * 7. Executes `.limit(50);`.
 * 8. Executes `return NextResponse.json({ notifications });`.
 */
export async function GET(req: Request) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await Notification.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json({ notifications });
}
