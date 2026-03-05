import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Client from "@/models/Client";
import { isAdminRole } from "@/lib/roles";

const PHONE_PATTERN = /^\+?[\d\s\-()]+$/;
const MAX_TEXT_LENGTH = 200;

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

    const client = await Client.findOne({ userId: user._id }).select("_id");
    return NextResponse.json({ exists: !!client }, { status: 200 });
  } catch (error) {
    console.error("Error checking client profile:", error);
    return NextResponse.json({ error: "Failed to check profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    const whatsapp = normalizeField(body.whatsapp, "whatsapp");
    if (!whatsapp.ok) {
      return NextResponse.json({ error: whatsapp.error }, { status: 400 });
    }

    const mobile = normalizeField(body.mobile, "mobile");
    if (!mobile.ok) {
      return NextResponse.json({ error: mobile.error }, { status: 400 });
    }

    const country = normalizeField(body.country, "country");
    if (!country.ok) {
      return NextResponse.json({ error: country.error }, { status: 400 });
    }

    const state = normalizeField(body.state, "state");
    if (!state.ok) {
      return NextResponse.json({ error: state.error }, { status: 400 });
    }

    const address = normalizeField(body.address, "address", 300);
    if (!address.ok) {
      return NextResponse.json({ error: address.error }, { status: 400 });
    }

    if (!PHONE_PATTERN.test(whatsapp.value) || !PHONE_PATTERN.test(mobile.value)) {
      return NextResponse.json({ error: "Invalid phone numbers" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email.toLowerCase() }).select("_id");
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingClient = await Client.findOne({ userId: user._id }).select("_id");
    if (existingClient) {
      return NextResponse.json({ error: "Client profile already exists" }, { status: 400 });
    }

    await Client.create({
      userId: user._id,
      whatsapp: whatsapp.value,
      mobile: mobile.value,
      country: country.value,
      state: state.value,
      address: address.value,
    });

    return NextResponse.json({ message: "Client registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to register client" }, { status: 500 });
  }
}
