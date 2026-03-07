/**
 * AUTO-FILE-COMMENT: src/app/api/role/route.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/database/dbConnect";
import User from "@/models/User";
import Client from "@/models/Client";
import Barber from "@/models/Barber";

type SelectableRole = "barber" | "client";

/**
 * AUTO-FUNCTION-COMMENT: parseSelectableRole
 * Purpose: Handles parse selectable role.
 * Line-by-line:
 * 1. Executes `if (value === "barber" || value === "client") {`.
 * 2. Executes `return value;`.
 * 3. Executes `}`.
 * 4. Executes `return null;`.
 */
function parseSelectableRole(value: unknown): SelectableRole | null {
  if (value === "barber" || value === "client") {
    return value;
  }
  return null;
}

/**
 * AUTO-FUNCTION-COMMENT: POST
 * Purpose: Handles post.
 * Line-by-line:
 * 1. Executes `try {`.
 * 2. Executes `const session = await getServerSession(authOptions);`.
 * 3. Executes `if (!session?.user?.email) {`.
 * 4. Executes `return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`.
 * 5. Executes `}`.
 * 6. Executes `const payload = (await req.json().catch(() => null)) as Record<`.
 * 7. Executes `string,`.
 * 8. Executes `unknown`.
 * 9. Executes `> | null;`.
 * 10. Executes `const role = parseSelectableRole(payload?.role);`.
 * 11. Executes `if (!role) {`.
 * 12. Executes `return NextResponse.json({ error: "Invalid role" }, { status: 400 });`.
 * 13. Executes `}`.
 * 14. Executes `await connectToDatabase();`.
 * 15. Executes `const email = session.user.email.trim().toLowerCase();`.
 * 16. Executes `const user = await User.findOne({ email }).select("_id role");`.
 * 17. Executes `if (!user) {`.
 * 18. Executes `return NextResponse.json({ error: "User not found" }, { status: 404 });`.
 * 19. Executes `}`.
 * 20. Executes `const currentRole = user.role as string | undefined;`.
 * 21. Executes `if (currentRole === "admin" || currentRole === "superadmin") {`.
 * 22. Executes `return NextResponse.json(`.
 * 23. Executes `{ error: "Role cannot be changed for this account" },`.
 * 24. Executes `{ status: 403 }`.
 * 25. Executes `);`.
 * 26. Executes `}`.
 * 27. Executes `// Prevent cross-role changes once profile data exists.`.
 * 28. Executes `if (role === "barber") {`.
 * 29. Executes `const existingClient = await Client.findOne({ userId: user._id }).select(`.
 * 30. Executes `"_id"`.
 * 31. Executes `);`.
 * 32. Executes `if (existingClient) {`.
 * 33. Executes `return NextResponse.json(`.
 * 34. Executes `{`.
 * 35. Executes `error:`.
 * 36. Executes `"Client profile already exists. Use a separate account for barber registration.",`.
 * 37. Executes `},`.
 * 38. Executes `{ status: 409 }`.
 * 39. Executes `);`.
 * 40. Executes `}`.
 * 41. Executes `}`.
 * 42. Executes `if (role === "client") {`.
 * 43. Executes `const existingBarber = await Barber.findOne({ userId: user._id }).select(`.
 * 44. Executes `"_id"`.
 * 45. Executes `);`.
 * 46. Executes `if (existingBarber) {`.
 * 47. Executes `return NextResponse.json(`.
 * 48. Executes `{`.
 * 49. Executes `error:`.
 * 50. Executes `"Barber profile already exists. Use a separate account for client registration.",`.
 * 51. Executes `},`.
 * 52. Executes `{ status: 409 }`.
 * 53. Executes `);`.
 * 54. Executes `}`.
 * 55. Executes `}`.
 * 56. Executes `if (currentRole === role) {`.
 * 57. Executes `return NextResponse.json({`.
 * 58. Executes `message: "Role already set",`.
 * 59. Executes `user: { id: user._id.toString(), role },`.
 * 60. Executes `});`.
 * 61. Executes `}`.
 * 62. Executes `user.role = role;`.
 * 63. Executes `await user.save();`.
 * 64. Executes `return NextResponse.json({`.
 * 65. Executes `message: "Role updated",`.
 * 66. Executes `user: { id: user._id.toString(), role: user.role },`.
 * 67. Executes `});`.
 * 68. Executes `} catch (error) {`.
 * 69. Executes `console.error(error);`.
 * 70. Executes `return NextResponse.json(`.
 * 71. Executes `{ error: "Failed to update role" },`.
 * 72. Executes `{ status: 500 }`.
 * 73. Executes `);`.
 * 74. Executes `}`.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    const role = parseSelectableRole(payload?.role);
    if (!role) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectToDatabase();
    const email = session.user.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select("_id role");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentRole = user.role as string | undefined;
    if (currentRole === "admin" || currentRole === "superadmin") {
      return NextResponse.json(
        { error: "Role cannot be changed for this account" },
        { status: 403 }
      );
    }

    // Prevent cross-role changes once profile data exists.
    if (role === "barber") {
      const existingClient = await Client.findOne({ userId: user._id }).select(
        "_id"
      );
      if (existingClient) {
        return NextResponse.json(
          {
            error:
              "Client profile already exists. Use a separate account for barber registration.",
          },
          { status: 409 }
        );
      }
    }

    if (role === "client") {
      const existingBarber = await Barber.findOne({ userId: user._id }).select(
        "_id"
      );
      if (existingBarber) {
        return NextResponse.json(
          {
            error:
              "Barber profile already exists. Use a separate account for client registration.",
          },
          { status: 409 }
        );
      }
    }

    if (currentRole === role) {
      return NextResponse.json({
        message: "Role already set",
        user: { id: user._id.toString(), role },
      });
    }

    user.role = role;
    await user.save();

    return NextResponse.json({
      message: "Role updated",
      user: { id: user._id.toString(), role: user.role },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
