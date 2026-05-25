import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/authCookies";

const ADMIN_API_WINDOW_MS = 60 * 1000;
const ADMIN_API_MAX_REQUESTS = 120;
const adminApiBuckets = new Map<string, { count: number; expiresAt: number }>();

function authSecret() {
  return (
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET
  );
}

function loginRedirect(req: NextRequest) {
  const url = new URL("/login", req.url);
  url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function adminApiRateLimit(req: NextRequest) {
  const now = Date.now();
  const key = `${req.nextUrl.pathname}:${clientIp(req)}`;
  const bucket = adminApiBuckets.get(key);

  if (!bucket || bucket.expiresAt <= now) {
    adminApiBuckets.set(key, { count: 1, expiresAt: now + ADMIN_API_WINDOW_MS });
    return null;
  }

  bucket.count += 1;
  if (bucket.count <= ADMIN_API_MAX_REQUESTS) return null;

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((bucket.expiresAt - now) / 1000)),
      },
    }
  );
}

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: authSecret(),
    cookieName: SESSION_COOKIE_NAME,
  });
  const pathname = req.nextUrl.pathname;
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!token) {
    return isAdminApi ? jsonError("Unauthorized", 401) : loginRedirect(req);
  }

  if (isAdminApi) {
    const limited = adminApiRateLimit(req);
    if (limited) return limited;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/admin/:path*",
    "/dashboard/superadmin/:path*",
    "/api/admin/:path*",
  ],
};
