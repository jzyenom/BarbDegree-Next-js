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
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { user: emptyUser, unauthorized: true as const };
  }

  return {
    user: session.user as AuthenticatedUser,
    unauthorized: false as const,
  };
}
