import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { enforceRateLimit, rateLimitProfiles } from "@/server/security/rateLimit";

export const runtime = "nodejs";

const handler = NextAuth(authOptions);

async function rateLimitedHandler(req: NextRequest) {
  const limited = await enforceRateLimit(req, rateLimitProfiles.auth);
  if (limited) return limited;

  return handler(req);
}

export { rateLimitedHandler as GET, rateLimitedHandler as POST };
