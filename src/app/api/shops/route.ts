import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Shop from "@/models/Shop";
import { requireAuth } from "@/lib/authGuard";

const REQUIRED_FIELDS = ["name", "address", "city", "state", "country"] as const;
const MAX_LENGTHS = {
  name: 120,
  address: 300,
  city: 80,
  state: 80,
  country: 80,
  phone: 40,
  description: 1000,
  openingHours: 300,
} as const;

function parseText(body: Record<string, unknown>, field: keyof typeof MAX_LENGTHS, required = false) {
  const value = body[field];
  if (value == null || value === "") {
    return required
      ? { ok: false as const, error: `${field} is required` }
      : { ok: true as const, value: undefined };
  }
  if (typeof value !== "string") {
    return { ok: false as const, error: `${field} must be a string` };
  }

  const normalized = value.trim();
  if (!normalized && required) {
    return { ok: false as const, error: `${field} is required` };
  }
  if (normalized.length > MAX_LENGTHS[field]) {
    return { ok: false as const, error: `${field} is too long` };
  }

  return { ok: true as const, value: normalized || undefined };
}

function parseShopPayload(body: Record<string, unknown>, partial = false) {
  const payload: Record<string, string | undefined> = {};
  const fields = Object.keys(MAX_LENGTHS) as (keyof typeof MAX_LENGTHS)[];

  for (const field of fields) {
    if (partial && !(field in body)) continue;
    const parsed = parseText(body, field, !partial && REQUIRED_FIELDS.includes(field as typeof REQUIRED_FIELDS[number]));
    if (!parsed.ok) return parsed;
    if (parsed.value !== undefined || field in body) payload[field] = parsed.value;
  }

  return { ok: true as const, value: payload };
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const barberId = url.searchParams.get("barberId")?.trim();

  if (barberId) {
    const shop = await Shop.findOne({ barberId }).populate({
      path: "barberId",
      select: "userId avatar address state country",
      populate: { path: "userId", select: "name email avatar" },
    });
    return NextResponse.json({ shop });
  }

  if (user.role !== "barber") {
    return NextResponse.json({ error: "barberId is required" }, { status: 400 });
  }

  const barber = await Barber.findOne({ userId: user.id }).select("_id");
  if (!barber) return NextResponse.json({ error: "Barber profile not found" }, { status: 404 });

  const shop = await Shop.findOne({ barberId: barber._id });
  return NextResponse.json({ shop });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "barber") {
    return NextResponse.json({ error: "Only barbers can manage shops" }, { status: 403 });
  }

  const barber = await Barber.findOne({ userId: user.id }).select("_id");
  if (!barber) return NextResponse.json({ error: "Barber profile not found" }, { status: 404 });

  const body = (await req.json()) as Record<string, unknown>;
  const parsed = parseShopPayload(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const shop = await Shop.findOneAndUpdate(
    { barberId: barber._id },
    { barberId: barber._id, ...parsed.value },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  await Barber.findByIdAndUpdate(barber._id, { shop: shop._id });
  return NextResponse.json({ shop }, { status: 201 });
}
