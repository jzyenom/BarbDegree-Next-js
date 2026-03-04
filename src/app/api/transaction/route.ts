import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/authGuard";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tx = await Transaction.find({ userId: user.id }).sort({
    createdAt: -1,
  });

  return NextResponse.json({ transactions: tx });
}
