import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import User from "@/models/User";
import Client from "@/models/Client";
import Barber from "@/models/Barber";
import "@/models/Service";

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
