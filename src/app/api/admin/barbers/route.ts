import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized)`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `if (!isAdminRole(user.role)) {`.
 * 6. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 7. Executes `}`.
 * 8. Executes `const barbers = await Barber.find({}).populate("userId");`.
 * 9. Executes `return NextResponse.json({ barbers });`.
 */
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const barbers = await Barber.find({}).populate("userId");

  return NextResponse.json({ barbers });
}
