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

 
export async function requireAuth(_req?: Request | NextRequest) {
  void _req;

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
