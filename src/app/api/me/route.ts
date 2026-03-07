import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import User from "@/models/User";
import Client from "@/models/Client";
import Barber from "@/models/Barber";
import "@/models/Service";

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized)`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `const dbUser = await User.findById(user.id);`.
 * 6. Executes `if (dbUser && !dbUser.name && dbUser.email) {`.
 * 7. Executes `const derivedName = dbUser.email.split("@")[0];`.
 * 8. Executes `dbUser.name = derivedName;`.
 * 9. Executes `await dbUser.save();`.
 * 10. Executes `}`.
 * 11. Executes `const client = await Client.findOne({ userId: user.id });`.
 * 12. Executes `const barber = await Barber.findOne({ userId: user.id }).populate({`.
 * 13. Executes `path: "services",`.
 * 14. Executes `options: { sort: { createdAt: -1 } },`.
 * 15. Executes `});`.
 * 16. Executes `return NextResponse.json({`.
 * 17. Executes `user: dbUser,`.
 * 18. Executes `client,`.
 * 19. Executes `barber: barber ? barber.toObject({ virtuals: true }) : null,`.
 * 20. Executes `});`.
 */
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await User.findById(user.id);
  if (dbUser && !dbUser.name && dbUser.email) {
    const derivedName = dbUser.email.split("@")[0];
    dbUser.name = derivedName;
    await dbUser.save();
  }
  const client = await Client.findOne({ userId: user.id });
  const barber = await Barber.findOne({ userId: user.id }).populate({
    path: "services",
    options: { sort: { createdAt: -1 } },
  });

  return NextResponse.json({
    user: dbUser,
    client,
    barber: barber ? barber.toObject({ virtuals: true }) : null,
  });
}
