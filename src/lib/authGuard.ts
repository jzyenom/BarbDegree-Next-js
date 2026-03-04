import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/authOptions";

export async function requireAuth(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { user: null, unauthorized: true };
  }

  return { user: session.user, unauthorized: false };
}
