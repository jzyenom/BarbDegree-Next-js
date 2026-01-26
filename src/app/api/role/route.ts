import { NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { role } = await req.json();

    // Validate role
    if (!role || !["barber", "client"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectToDatabase();

    // Create a user document with only the role (no email/username needed)
    const user = await User.create({ role });

    return NextResponse.json({ message: "Role updated", user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
