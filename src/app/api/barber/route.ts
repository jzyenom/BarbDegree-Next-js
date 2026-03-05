import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Barber from "@/models/Barber";
import { isAdminRole } from "@/lib/roles";

const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;
const MAX_TEXT_LENGTH = 200;
const MAX_BIO_LENGTH = 800;

function normalizeField(
  value: unknown,
  fieldName: string,
  maxLength = MAX_TEXT_LENGTH
) {
  if (typeof value !== "string") {
    return { ok: false as const, error: `${fieldName} is required` };
  }

  const normalized = value.trim();
  if (!normalized) {
    return { ok: false as const, error: `${fieldName} is required` };
  }
  if (normalized.length > maxLength) {
    return { ok: false as const, error: `${fieldName} is too long` };
  }

  return { ok: true as const, value: normalized };
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedEmail = searchParams.get("email")?.trim().toLowerCase();
    const sessionEmail = session.user.email.trim().toLowerCase();
    const isAdmin = isAdminRole(session.user.role);

    const email = requestedEmail || sessionEmail;
    if (!isAdmin && email !== sessionEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email }).select("_id");
    if (!user) return NextResponse.json({ exists: false }, { status: 200 });

    const barber = await Barber.findOne({ userId: user._id }).select("_id");
    return NextResponse.json({ exists: !!barber }, { status: 200 });
  } catch (error) {
    console.error("Error checking barber profile:", error);
    return NextResponse.json({ error: "Failed to check profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const data: Record<string, unknown> = {};

    // Ignore files and only process known scalar fields
    formData.forEach((value, key) => {
      if (value instanceof File) return;
      data[key] = value;
    });

    const whatsapp = normalizeField(data.whatsapp, "whatsapp");
    if (!whatsapp.ok) {
      return NextResponse.json({ error: whatsapp.error }, { status: 400 });
    }
    const mobile = normalizeField(data.mobile, "mobile");
    if (!mobile.ok) {
      return NextResponse.json({ error: mobile.error }, { status: 400 });
    }
    const country = normalizeField(data.country, "country");
    if (!country.ok) {
      return NextResponse.json({ error: country.error }, { status: 400 });
    }
    const state = normalizeField(data.state, "state");
    if (!state.ok) {
      return NextResponse.json({ error: state.error }, { status: 400 });
    }
    const nin = normalizeField(data.nin, "nin");
    if (!nin.ok) {
      return NextResponse.json({ error: nin.error }, { status: 400 });
    }
    const bio = normalizeField(data.bio, "bio", MAX_BIO_LENGTH);
    if (!bio.ok) {
      return NextResponse.json({ error: bio.error }, { status: 400 });
    }
    const address = normalizeField(data.address, "address");
    if (!address.ok) {
      return NextResponse.json({ error: address.error }, { status: 400 });
    }
    const exp = normalizeField(data.exp, "exp");
    if (!exp.ok) {
      return NextResponse.json({ error: exp.error }, { status: 400 });
    }
    const charge = normalizeField(data.charge, "charge");
    if (!charge.ok) {
      return NextResponse.json({ error: charge.error }, { status: 400 });
    }
    const bankName = normalizeField(data.bankName, "bankName");
    if (!bankName.ok) {
      return NextResponse.json({ error: bankName.error }, { status: 400 });
    }
    const accountNo = normalizeField(data.accountNo, "accountNo");
    if (!accountNo.ok) {
      return NextResponse.json({ error: accountNo.error }, { status: 400 });
    }

    if (!PHONE_PATTERN.test(whatsapp.value) || !PHONE_PATTERN.test(mobile.value)) {
      return NextResponse.json({ error: "Invalid phone numbers" }, { status: 400 });
    }
    if (!/^\d{11}$/.test(nin.value)) {
      return NextResponse.json({ error: "NIN must be 11 digits" }, { status: 400 });
    }
    if (!/^\d{10}$/.test(accountNo.value)) {
      return NextResponse.json({ error: "Account number must be 10 digits" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email.toLowerCase() }).select("_id");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingBarber = await Barber.findOne({ userId: user._id }).select("_id");
    if (existingBarber) {
      return NextResponse.json({ error: "Barber profile already exists" }, { status: 400 });
    }

    await Barber.create({
      userId: user._id,
      whatsapp: whatsapp.value,
      mobile: mobile.value,
      country: country.value,
      state: state.value,
      nin: nin.value,
      bio: bio.value,
      address: address.value,
      exp: exp.value,
      charge: charge.value,
      bankName: bankName.value,
      accountNo: accountNo.value,
    });

    return NextResponse.json({ message: "Barber registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register barber" }, { status: 500 });
  }
}
