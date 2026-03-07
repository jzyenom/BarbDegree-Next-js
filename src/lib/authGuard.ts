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
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { user: emptyUser, unauthorized: true as const };
  }

  return {
    user: session.user as AuthenticatedUser,
    unauthorized: false as const,
  };
}
