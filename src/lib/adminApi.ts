import { NextRequest, NextResponse } from "next/server";
import { requireAuth, type AuthenticatedUser } from "@/lib/authGuard";
import { isAdminRole } from "@/lib/roles";

type AdminApiAccess =
  | { user: AuthenticatedUser; response: null }
  | { user: AuthenticatedUser; response: NextResponse };

export async function requireAdminApi(req: NextRequest): Promise<AdminApiAccess> {
  const { user, unauthorized } = await requireAuth(req);

  if (unauthorized) {
    return {
      user,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!isAdminRole(user.role)) {
    return {
      user,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, response: null };
}
