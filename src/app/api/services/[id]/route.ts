/**
 * AUTO-FILE-COMMENT: src/app/api/services/[id]/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/database/dbConnect";
import Barber from "@/models/Barber";
import Service from "@/models/Service";
import { requireAuth } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";
import { parseServicePayload } from "@/lib/servicePayload";

/**
 * AUTO-FUNCTION-COMMENT: PUT
 * Purpose: Handles put.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `const body = await req.json();`.
 * 7. Executes `const { data, error } = parseServicePayload(body, { partial: true });`.
 * 8. Executes `if (error || !data) {`.
 * 9. Executes `return NextResponse.json(`.
 * 10. Executes `{ error: error ?? "Invalid service payload" },`.
 * 11. Executes `{ status: 400 }`.
 * 12. Executes `);`.
 * 13. Executes `}`.
 * 14. Executes `const { id } = await params;`.
 * 15. Executes `if (!mongoose.Types.ObjectId.isValid(id)) {`.
 * 16. Executes `return NextResponse.json({ error: "Invalid service id" }, { status: 400 });`.
 * 17. Executes `}`.
 * 18. Executes `try {`.
 * 19. Executes `if (isAdminRole(user.role)) {`.
 * 20. Executes `const service = await Service.findByIdAndUpdate(id, data, {`.
 * 21. Executes `new: true,`.
 * 22. Executes `runValidators: true,`.
 * 23. Executes `});`.
 * 24. Executes `if (!service) {`.
 * 25. Executes `return NextResponse.json(`.
 * 26. Executes `{ error: "Service not found" },`.
 * 27. Executes `{ status: 404 }`.
 * 28. Executes `);`.
 * 29. Executes `}`.
 * 30. Executes `return NextResponse.json({ service });`.
 * 31. Executes `}`.
 * 32. Executes `if (user.role !== "barber") {`.
 * 33. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 34. Executes `}`.
 * 35. Executes `const barber = await Barber.findOne({ userId: user.id });`.
 * 36. Executes `if (!barber) {`.
 * 37. Executes `return NextResponse.json({ error: "Barber not found" }, { status: 404 });`.
 * 38. Executes `}`.
 * 39. Executes `const service = await Service.findOneAndUpdate(`.
 * 40. Executes `{ _id: id, barberId: barber._id },`.
 * 41. Executes `data,`.
 * 42. Executes `{ new: true, runValidators: true }`.
 * 43. Executes `);`.
 * 44. Executes `if (!service) {`.
 * 45. Executes `return NextResponse.json({ error: "Service not found" }, { status: 404 });`.
 * 46. Executes `}`.
 * 47. Executes `return NextResponse.json({ service });`.
 * 48. Executes `} catch (updateError) {`.
 * 49. Executes `if (`.
 * 50. Executes `typeof updateError === "object" &&`.
 * 51. Executes `updateError &&`.
 * 52. Executes `"code" in updateError &&`.
 * 53. Executes `updateError.code === 11000`.
 * 54. Executes `) {`.
 * 55. Executes `return NextResponse.json(`.
 * 56. Executes `{ error: "You already added a service with that name" },`.
 * 57. Executes `{ status: 409 }`.
 * 58. Executes `);`.
 * 59. Executes `}`.
 * 60. Executes `throw updateError;`.
 * 61. Executes `}`.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { data, error } = parseServicePayload(body, { partial: true });
  if (error || !data) {
    return NextResponse.json(
      { error: error ?? "Invalid service payload" },
      { status: 400 }
    );
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid service id" }, { status: 400 });
  }

  try {
    if (isAdminRole(user.role)) {
      const service = await Service.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ service });
    }

    if (user.role !== "barber") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const barber = await Barber.findOne({ userId: user.id });
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    const service = await Service.findOneAndUpdate(
      { _id: id, barberId: barber._id },
      data,
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (updateError) {
    if (
      typeof updateError === "object" &&
      updateError &&
      "code" in updateError &&
      updateError.code === 11000
    ) {
      return NextResponse.json(
        { error: "You already added a service with that name" },
        { status: 409 }
      );
    }

    throw updateError;
  }
}

/**
 * AUTO-FUNCTION-COMMENT: DELETE
 * Purpose: Handles delete.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `const { id } = await params;`.
 * 7. Executes `if (!mongoose.Types.ObjectId.isValid(id)) {`.
 * 8. Executes `return NextResponse.json({ error: "Invalid service id" }, { status: 400 });`.
 * 9. Executes `}`.
 * 10. Executes `if (isAdminRole(user.role)) {`.
 * 11. Executes `await Service.findByIdAndDelete(id);`.
 * 12. Executes `return NextResponse.json({ success: true });`.
 * 13. Executes `}`.
 * 14. Executes `if (user.role !== "barber") {`.
 * 15. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 16. Executes `}`.
 * 17. Executes `const barber = await Barber.findOne({ userId: user.id });`.
 * 18. Executes `if (!barber) {`.
 * 19. Executes `return NextResponse.json({ error: "Barber not found" }, { status: 404 });`.
 * 20. Executes `}`.
 * 21. Executes `const deleted = await Service.findOneAndDelete({`.
 * 22. Executes `_id: id,`.
 * 23. Executes `barberId: barber._id,`.
 * 24. Executes `});`.
 * 25. Executes `if (!deleted) {`.
 * 26. Executes `return NextResponse.json({ error: "Service not found" }, { status: 404 });`.
 * 27. Executes `}`.
 * 28. Executes `return NextResponse.json({ success: true });`.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid service id" }, { status: 400 });
  }

  if (isAdminRole(user.role)) {
    await Service.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  }

  if (user.role !== "barber") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const barber = await Barber.findOne({ userId: user.id });
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const deleted = await Service.findOneAndDelete({
    _id: id,
    barberId: barber._id,
  });

  if (!deleted) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
