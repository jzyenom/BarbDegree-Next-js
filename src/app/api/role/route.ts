import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/dbConnect";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();
    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "Role updated", user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
