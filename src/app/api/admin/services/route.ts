import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import { requireAdminApi } from "@/lib/adminApi";
import { escapeRegex, parseLimit } from "@/lib/adminQuery";
import Service from "@/models/Service";

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const access = await requireAdminApi(req);
  if (access.response) return access.response;

  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const active = url.searchParams.get("active")?.trim() || "";
  const limit = parseLimit(req, 100, 500);
  const filter: Record<string, unknown> = {};

  if (active === "true") {
    filter.isActive = true;
  }

  if (active === "false") {
    filter.isActive = false;
  }

  if (search) {
    const safeSearch = escapeRegex(search.slice(0, 120));
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const services = await Service.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .populate({
      path: "barberId",
      select: "userId address state country",
      populate: { path: "userId", select: "name email avatar role" },
    })
    .lean();

  return NextResponse.json({ services });
}
