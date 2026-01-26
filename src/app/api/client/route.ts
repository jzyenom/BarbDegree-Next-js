import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Client from "@/models/Client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ exists: false }, { status: 200 });

    const client = await Client.findOne({ userId: user._id });
    return NextResponse.json({ exists: !!client }, { status: 200 });
  } catch (error) {
    console.error("Error checking client profile:", error);
    return NextResponse.json({ error: "Failed to check profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validation
    const requiredFields = ['whatsapp', 'mobile', 'country', 'state', 'address'];
    for (const field of requiredFields) {
      if (!data[field]?.trim()) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Validate phone numbers
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(data.whatsapp) || !phoneRegex.test(data.mobile)) {
      return NextResponse.json({ error: "Invalid phone numbers" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Prevent duplicate client profiles
    const existingClient = await Client.findOne({ userId: user._id });
    if (existingClient) {
        return NextResponse.json({ error: "Client profile already exists" }, { status: 400 });
    }

    await Client.create({ ...data, userId: user._id });
    return NextResponse.json({ message: "Client registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register client" }, { status: 500 });
  }
}
