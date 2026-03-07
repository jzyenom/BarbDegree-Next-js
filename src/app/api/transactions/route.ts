/**
 * AUTO-FILE-COMMENT: src/app/api/transactions/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized)`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `const tx = await Transaction.find({ userId: user.id }).sort({`.
 * 6. Executes `createdAt: -1,`.
 * 7. Executes `}).select("bookingId amount currency reference status provider createdAt updatedAt");`.
 * 8. Executes `return NextResponse.json({ transactions: tx });`.
 */
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tx = await Transaction.find({ userId: user.id }).sort({
    createdAt: -1,
  }).select("bookingId amount currency reference status provider createdAt updatedAt");

  return NextResponse.json({ transactions: tx });
}
