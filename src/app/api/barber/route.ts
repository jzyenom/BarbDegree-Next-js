import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Barber from "@/models/Barber";

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

    const barber = await Barber.findOne({ userId: user._id });
    return NextResponse.json({ exists: !!barber }, { status: 200 });
  } catch (error) {
    console.error("Error checking barber profile:", error);
    return NextResponse.json({ error: "Failed to check profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const data: Record<string, string> = {};

    // Convert FormData to object, skip files for now
    formData.forEach((value, key) => {
        if (value instanceof File) {
           // TODO: Implement file upload to S3/Cloudinary
           return;
        }
        data[key] = value as string;
    });

    // Validation
    const requiredFields = ['whatsapp', 'mobile', 'country', 'state', 'nin', 'bio', 'address', 'exp', 'charge', 'bankName', 'accountNo'];
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

    // Validate NIN
    if (!/^\d{11}$/.test(data.nin)) {
      return NextResponse.json({ error: "NIN must be 11 digits" }, { status: 400 });
    }

    // Validate account number
    if (!/^\d{10}$/.test(data.accountNo)) {
      return NextResponse.json({ error: "Account number must be 10 digits" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingBarber = await Barber.findOne({ userId: user._id });
    if (existingBarber) {
        return NextResponse.json({ error: "Barber profile already exists" }, { status: 400 });
    }

    await Barber.create({ ...data, userId: user._id });
    return NextResponse.json({ message: "Barber registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register barber" }, { status: 500 });
  }
}
