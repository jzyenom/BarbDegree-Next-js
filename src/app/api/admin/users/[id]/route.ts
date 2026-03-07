/**
 * AUTO-FILE-COMMENT: src/app/api/admin/users/[id]/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/database/dbConnect";
import { requireAuth } from "@/lib/authGuard";
import { AppRole, isAdminRole, isSuperadminRole } from "@/lib/roles";
import User from "@/models/User";
import Barber from "@/models/Barber";
import Client from "@/models/Client";

const ROLE_OPTIONS: AppRole[] = ["client", "barber", "admin", "superadmin"];
const ADMIN_ASSIGNABLE: AppRole[] = ["client", "barber"];

/**
 * AUTO-FUNCTION-COMMENT: PATCH
 * Purpose: Handles patch.
 * Line-by-line:
 * 1. Executes `await connectToDatabase();`.
 * 2. Executes `const { user, unauthorized } = await requireAuth(req);`.
 * 3. Executes `if (unauthorized) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `if (!isAdminRole(user.role)) {`.
 * 7. Executes `return NextResponse.json({ error: "Forbidden" }, { status: 403 });`.
 * 8. Executes `}`.
 * 9. Executes `const body = await req.json();`.
 * 10. Executes `const nextRole = body?.role as AppRole | undefined;`.
 * 11. Executes `if (!nextRole || !ROLE_OPTIONS.includes(nextRole)) {`.
 * 12. Executes `return NextResponse.json({ error: "Invalid role" }, { status: 400 });`.
 * 13. Executes `}`.
 * 14. Executes `const { id } = await params;`.
 * 15. Executes `if (!mongoose.Types.ObjectId.isValid(id)) {`.
 * 16. Executes `return NextResponse.json({ error: "Invalid user id" }, { status: 400 });`.
 * 17. Executes `}`.
 * 18. Executes `const targetUser = await User.findById(id);`.
 * 19. Executes `if (!targetUser) {`.
 * 20. Executes `return NextResponse.json({ error: "User not found" }, { status: 404 });`.
 * 21. Executes `}`.
 * 22. Executes `const requesterIsSuperadmin = isSuperadminRole(user.role);`.
 * 23. Executes `const targetRole = (targetUser.role || null) as AppRole | null;`.
 * 24. Executes `const targetId = targetUser._id.toString();`.
 * 25. Executes `if (targetId === user.id) {`.
 * 26. Executes `if (!requesterIsSuperadmin || nextRole !== "superadmin") {`.
 * 27. Executes `return NextResponse.json(`.
 * 28. Executes `{ error: "You cannot change your own role from this dashboard" },`.
 * 29. Executes `{ status: 400 }`.
 * 30. Executes `);`.
 * 31. Executes `}`.
 * 32. Executes `}`.
 * 33. Executes `if (!requesterIsSuperadmin) {`.
 * 34. Executes `if (!ADMIN_ASSIGNABLE.includes(nextRole)) {`.
 * 35. Executes `return NextResponse.json(`.
 * 36. Executes `{ error: "Only superadmin can assign admin or superadmin" },`.
 * 37. Executes `{ status: 403 }`.
 * 38. Executes `);`.
 * 39. Executes `}`.
 * 40. Executes `if (targetRole === "admin" || targetRole === "superadmin") {`.
 * 41. Executes `return NextResponse.json(`.
 * 42. Executes `{ error: "Only superadmin can modify admin-level accounts" },`.
 * 43. Executes `{ status: 403 }`.
 * 44. Executes `);`.
 * 45. Executes `}`.
 * 46. Executes `}`.
 * 47. Executes `targetUser.role = nextRole;`.
 * 48. Executes `await targetUser.save();`.
 * 49. Executes `if (nextRole === "barber") {`.
 * 50. Executes `await Barber.findOneAndUpdate(`.
 * 51. Executes `{ userId: targetUser._id },`.
 * 52. Executes `{ $setOnInsert: { userId: targetUser._id } },`.
 * 53. Executes `{ upsert: true, new: true }`.
 * 54. Executes `);`.
 * 55. Executes `}`.
 * 56. Executes `if (nextRole === "client") {`.
 * 57. Executes `await Client.findOneAndUpdate(`.
 * 58. Executes `{ userId: targetUser._id },`.
 * 59. Executes `{ $setOnInsert: { userId: targetUser._id } },`.
 * 60. Executes `{ upsert: true, new: true }`.
 * 61. Executes `);`.
 * 62. Executes `}`.
 * 63. Executes `return NextResponse.json({`.
 * 64. Executes `user: {`.
 * 65. Executes `_id: targetUser._id.toString(),`.
 * 66. Executes `name: targetUser.name || "",`.
 * 67. Executes `email: targetUser.email || "",`.
 * 68. Executes `role: targetUser.role || null,`.
 * 69. Executes `avatar: targetUser.avatar || null,`.
 * 70. Executes `},`.
 * 71. Executes `});`.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { user, unauthorized } = await requireAuth(req);
  if (unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const nextRole = body?.role as AppRole | undefined;

  if (!nextRole || !ROLE_OPTIONS.includes(nextRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }
  const targetUser = await User.findById(id);

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const requesterIsSuperadmin = isSuperadminRole(user.role);
  const targetRole = (targetUser.role || null) as AppRole | null;
  const targetId = targetUser._id.toString();

  if (targetId === user.id) {
    if (!requesterIsSuperadmin || nextRole !== "superadmin") {
      return NextResponse.json(
        { error: "You cannot change your own role from this dashboard" },
        { status: 400 }
      );
    }
  }

  if (!requesterIsSuperadmin) {
    if (!ADMIN_ASSIGNABLE.includes(nextRole)) {
      return NextResponse.json(
        { error: "Only superadmin can assign admin or superadmin" },
        { status: 403 }
      );
    }

    if (targetRole === "admin" || targetRole === "superadmin") {
      return NextResponse.json(
        { error: "Only superadmin can modify admin-level accounts" },
        { status: 403 }
      );
    }
  }

  targetUser.role = nextRole;
  await targetUser.save();

  if (nextRole === "barber") {
    await Barber.findOneAndUpdate(
      { userId: targetUser._id },
      { $setOnInsert: { userId: targetUser._id } },
      { upsert: true, new: true }
    );
  }

  if (nextRole === "client") {
    await Client.findOneAndUpdate(
      { userId: targetUser._id },
      { $setOnInsert: { userId: targetUser._id } },
      { upsert: true, new: true }
    );
  }

  return NextResponse.json({
    user: {
      _id: targetUser._id.toString(),
      name: targetUser.name || "",
      email: targetUser.email || "",
      role: targetUser.role || null,
      avatar: targetUser.avatar || null,
    },
  });
}
