import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Shop from "@/models/Shop";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

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

function getId(value: unknown) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

function parseUpdate(body: Record<string, unknown>) {
  const update: Record<string, string | undefined> = {};
  for (const field of Object.keys(MAX_LENGTHS) as (keyof typeof MAX_LENGTHS)[]) {
    if (!(field in body)) continue;
    const value = body[field];
    if (value == null || value === "") {
      update[field] = undefined;
      continue;
    }
    if (typeof value !== "string") {
      return { ok: false as const, error: `${field} must be a string` };
    }
    const normalized = value.trim();
    if (normalized.length > MAX_LENGTHS[field]) {
      return { ok: false as const, error: `${field} is too long` };
    }
    update[field] = normalized || undefined;
  }

  return { ok: true as const, value: update };
}

async function canManageShop(userId: string, role: string | undefined, shopBarberId: unknown) {
  if (isAdminRole(role)) return true;
  const barber = await Barber.findOne({ userId }).select("_id");
  return barber ? barber._id.toString() === getId(shopBarberId) : false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid shop id" }, { status: 400 });
  }

  const shop = await Shop.findById(id).populate({
    path: "barberId",
    select: "userId avatar address state country",
    populate: { path: "userId", select: "name email avatar" },
  });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  return NextResponse.json({ shop });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid shop id" }, { status: 400 });
  }

  const shop = await Shop.findById(id);
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  if (!(await canManageShop(user.id, user.role, shop.barberId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const parsed = parseUpdate(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (Object.keys(parsed.value).length === 0) {
    return NextResponse.json({ error: "No updatable fields were provided" }, { status: 400 });
  }

  Object.assign(shop, parsed.value);
  await shop.save();
  return NextResponse.json({ shop });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid shop id" }, { status: 400 });
  }

  const shop = await Shop.findById(id);
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  if (!(await canManageShop(user.id, user.role, shop.barberId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await shop.deleteOne();
  await Barber.findByIdAndUpdate(shop.barberId, { $unset: { shop: "" } });
  return NextResponse.json({ message: "Shop deleted successfully" });
}
