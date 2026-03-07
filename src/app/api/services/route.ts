import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Service from "@/models/Service";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import { parseServicePayload } from "@/lib/servicePayload";

type BarberWithServices = {
  services?: unknown[];
  toObject(options?: { virtuals?: boolean }): { services?: unknown[] };
};

/**
 * AUTO-FUNCTION-COMMENT: readVirtualServices
 * Purpose: Handles read virtual services.
 * Line-by-line:
 * 1. Executes `if (!barber) {`.
 * 2. Executes `return [];`.
 * 3. Executes `}`.
 * 4. Executes `const serialized = barber.toObject({ virtuals: true });`.
 * 5. Executes `return Array.isArray(serialized.services) ? serialized.services : [];`.
 */
function readVirtualServices(barber: BarberWithServices | null) {
  if (!barber) {
    return [];
  }

  const serialized = barber.toObject({ virtuals: true });
  return Array.isArray(serialized.services) ? serialized.services : [];
}

/**
 * AUTO-FUNCTION-COMMENT: GET
 * Purpose: Handles get.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const url = new URL(req.url);`.
 * 3. Executes `const barberId = url.searchParams.get("barberId");`.
 * 4. Executes `if (barberId) {`.
 * 5. Executes `if (!mongoose.Types.ObjectId.isValid(barberId)) {`.
 * 6. Executes `return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });`.
 * 7. Executes `}`.
 * 8. Executes `const barber = (await Barber.findById(barberId).populate({`.
 * 9. Executes `path: "services",`.
 * 10. Executes `match: { isActive: true },`.
 * 11. Executes `options: { sort: { price: 1, name: 1 } },`.
 * 12. Executes `})) as BarberWithServices | null;`.
 * 13. Executes `if (!barber) {`.
 * 14. Executes `return NextResponse.json({ error: "Barber not found" }, { status: 404 });`.
 * 15. Executes `}`.
 * 16. Executes `return NextResponse.json({ services: readVirtualServices(barber) });`.
 * 17. Executes `}`.
 * 18. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 19. Executes `if (unauthorized) {`.
 * 20. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 21. Executes `}`.
 * 22. Executes `if (isAdminRole(user.role)) {`.
 * 23. Executes `const services = await Service.find({}).sort({ createdAt: -1 }).lean();`.
 * 24. Executes `return NextResponse.json({ services });`.
 * 25. Executes `}`.
 * 26. Executes `if (user.role !== "barber") {`.
 * 27. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 28. Executes `}`.
 * 29. Executes `const barber = (await Barber.findOne({ userId: user.id }).populate({`.
 * 30. Executes `path: "services",`.
 * 31. Executes `options: { sort: { createdAt: -1 } },`.
 * 32. Executes `})) as BarberWithServices | null;`.
 * 33. Executes `if (!barber) {`.
 * 34. Executes `return NextResponse.json({ services: [] });`.
 * 35. Executes `}`.
 * 36. Executes `return NextResponse.json({ services: readVirtualServices(barber) });`.
 */
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const barberId = url.searchParams.get("barberId");

  if (barberId) {
    if (!mongoose.Types.ObjectId.isValid(barberId)) {
      return NextResponse.json({ error: "Invalid barber id" }, { status: 400 });
    }

    const barber = (await Barber.findById(barberId).populate({
      path: "services",
      match: { isActive: true },
      options: { sort: { price: 1, name: 1 } },
    })) as BarberWithServices | null;

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    return NextResponse.json({ services: readVirtualServices(barber) });
  }

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isAdminRole(user.role)) {
    const services = await Service.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ services });
  }

  if (user.role !== "barber") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const barber = (await Barber.findOne({ userId: user.id }).populate({
    path: "services",
    options: { sort: { createdAt: -1 } },
  })) as BarberWithServices | null;

  if (!barber) {
    return NextResponse.json({ services: [] });
  }

  return NextResponse.json({ services: readVirtualServices(barber) });
}

/**
 * AUTO-FUNCTION-COMMENT: POST
 * Purpose: Handles post.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `if (user.role !== "barber") {`.
 * 7. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 8. Executes `}`.
 * 9. Executes `const barber = await Barber.findOne({ userId: user.id });`.
 * 10. Executes `if (!barber) {`.
 * 11. Executes `return NextResponse.json({ error: "Barber not found" }, { status: 404 });`.
 * 12. Executes `}`.
 * 13. Executes `const body = await req.json();`.
 * 14. Executes `const { data, error } = parseServicePayload(body);`.
 * 15. Executes `if (error || !data) {`.
 * 16. Executes `return NextResponse.json(`.
 * 17. Executes `{ error: error ?? "Invalid service payload" },`.
 * 18. Executes `{ status: 400 }`.
 * 19. Executes `);`.
 * 20. Executes `}`.
 * 21. Executes `try {`.
 * 22. Executes `const service = await Service.create({`.
 * 23. Executes `barberId: barber._id,`.
 * 24. Executes `...data,`.
 * 25. Executes `});`.
 * 26. Executes `return NextResponse.json({ service }, { status: 201 });`.
 * 27. Executes `} catch (createError) {`.
 * 28. Executes `if (`.
 * 29. Executes `typeof createError === "object" &&`.
 * 30. Executes `createError &&`.
 * 31. Executes `"code" in createError &&`.
 * 32. Executes `createError.code === 11000`.
 * 33. Executes `) {`.
 * 34. Executes `return NextResponse.json(`.
 * 35. Executes `{ error: "You already added a service with that name" },`.
 * 36. Executes `{ status: 409 }`.
 * 37. Executes `);`.
 * 38. Executes `}`.
 * 39. Executes `throw createError;`.
 * 40. Executes `}`.
 */
export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "barber") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const barber = await Barber.findOne({ userId: user.id });
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const body = await req.json();
  const { data, error } = parseServicePayload(body);
  if (error || !data) {
    return NextResponse.json(
      { error: error ?? "Invalid service payload" },
      { status: 400 }
    );
  }

  try {
    const service = await Service.create({
      barberId: barber._id,
      ...data,
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (createError) {
    if (
      typeof createError === "object" &&
      createError &&
      "code" in createError &&
      createError.code === 11000
    ) {
      return NextResponse.json(
        { error: "You already added a service with that name" },
        { status: 409 }
      );
    }

    throw createError;
  }
}
