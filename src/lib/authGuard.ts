/**
 * AUTO-FILE-COMMENT: src/lib/authGuard.ts
 * Purpose: Explains the role of this module and documents its functions.
 * Notes: Comments are documentation-only and do not change runtime behavior.
 */
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/authOptions";

export type AuthenticatedUser = NonNullable<Session["user"]> & {
  id: string;
};

const emptyUser: AuthenticatedUser = {
  id: "",
};

 /**
 * AUTO-FUNCTION-COMMENT: requireAuth
 * Purpose: Handles require auth.
 * Line-by-line:
 * 1. Executes `const session = await getServerSession(authOptions);`.
 * 2. Executes `if (!session?.user?.id) {`.
 * 3. Executes `return { user: emptyUser, unauthorized: true as const };`.
 * 4. Executes `}`.
 * 5. Executes `return {`.
 * 6. Executes `user: session.user as AuthenticatedUser,`.
 * 7. Executes `unauthorized: false as const,`.
 * 8. Executes `};`.
 */
export async function requireAuth(_req?: Request | NextRequest) {
  if (!authOptions.secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[authGuard] Auth secret is not configured");
      return { user: emptyUser, unauthorized: true as const };
    }
    console.warn("[authGuard] Auth secret is not configured; proceeding in development mode.");
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { user: emptyUser, unauthorized: true as const };
  }

  return {
    user: session.user as AuthenticatedUser,
    unauthorized: false as const,
  };
}
