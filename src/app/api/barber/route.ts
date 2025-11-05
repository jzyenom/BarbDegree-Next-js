import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/dbConnect";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Barber from "@/models/Barber";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectToDatabase();
    const user = await User.findOne({ email: data.email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    await Barber.create({ ...data, userId: user._id });
    return NextResponse.json({ message: "Barber registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register barber" }, { status: 500 });
  }
}
