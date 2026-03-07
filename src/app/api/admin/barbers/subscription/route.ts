import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

/**
 * AUTO-FUNCTION-COMMENT: POST
 * Purpose: Handles post.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized)`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `if (!isAdminRole(user.role)) {`.
 * 6. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 7. Executes `}`.
 * 8. Executes `const body = (await req.json()) as Record<string, unknown>;`.
 * 9. Executes `const barberId = typeof body.barberId === "string" ? body.barberId.trim() : "";`.
 * 10. Executes `const isSubscribed = Boolean(body.isSubscribed);`.
 * 11. Executes `if (!mongoose.Types.ObjectId.isValid(barberId)) {`.
 * 12. Executes `return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });`.
 * 13. Executes `}`.
 * 14. Executes `const barber = await Barber.findByIdAndUpdate(`.
 * 15. Executes `barberId,`.
 * 16. Executes `{ isSubscribed },`.
 * 17. Executes `{ new: true }`.
 * 18. Executes `);`.
 * 19. Executes `if (!barber) return NextResponse.json({ error: "Barber not found" }, { status: 404 });`.
 * 20. Executes `return NextResponse.json({ barber });`.
 */
export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const barberId = typeof body.barberId === "string" ? body.barberId.trim() : "";
  const isSubscribed = Boolean(body.isSubscribed);
  if (!mongoose.Types.ObjectId.isValid(barberId)) {
    return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
  }

  const barber = await Barber.findByIdAndUpdate(
    barberId,
    { isSubscribed },
    { new: true }
  );

  if (!barber) return NextResponse.json({ error: "Barber not found" }, { status: 404 });

  return NextResponse.json({ barber });
}
