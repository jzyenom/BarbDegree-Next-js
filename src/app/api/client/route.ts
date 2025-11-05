import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/dbConnect";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Client from "@/models/Client";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await connectToDatabase();
    const user = await User.findOne({ email: data.email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    await Client.create({ ...data, userId: user._id });
    return NextResponse.json({ message: "Client registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register client" }, { status: 500 });
  }
}
