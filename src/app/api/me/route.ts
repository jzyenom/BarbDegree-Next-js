import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import User from "@/models/User";
import Client from "@/models/Client";
import Barber from "@/models/Barber";
import "@/models/Service";

const PASSWORD_SALT_ROUNDS = 10;


export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await User.findById(user.id).select("+password");
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
    user: dbUser
      ? {
          ...dbUser.toObject(),
          password: undefined,
          hasPassword: Boolean(dbUser.password),
        }
      : null,
    client,
    barber: barber ? barber.toObject({ virtuals: true }) : null,
  });
}

export async function PATCH(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Record<string, unknown>;
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword.trim() : "";
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword.trim() : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword.trim() : "";

  if (newPassword.length < 8 || newPassword.length > 72) {
    return NextResponse.json(
      { error: "New password must be between 8 and 72 characters." },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "Password confirmation does not match." },
      { status: 400 }
    );
  }

  const dbUser = await User.findById(user.id).select("+password");
  if (!dbUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (dbUser.password) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );
    }
  }

  dbUser.password = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
  await dbUser.save();

  return NextResponse.json({ message: "Password saved successfully." });
}
