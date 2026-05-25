import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_API_WINDOW_MS = 60 * 1000;
const ADMIN_API_MAX_REQUESTS = 120;
const adminApiBuckets = new Map<string, { count: number; expiresAt: number }>();

function isAdminRole(role?: string | null) {
  return role === "admin" || role === "superadmin";
}

function isSuperadminRole(role?: string | null) {
  return role === "superadmin";
}

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

function dashboardRedirect(req: NextRequest) {
  return NextResponse.redirect(new URL("/dashboard", req.url));
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
  const token = await getToken({ req, secret: authSecret() });
  const pathname = req.nextUrl.pathname;
  const isAdminApi = pathname.startsWith("/api/admin");
  const isSuperadminPage = pathname.startsWith("/dashboard/superadmin");
  const role = token?.role;

  if (!token) {
    return isAdminApi ? jsonError("Unauthorized", 401) : loginRedirect(req);
  }

  if (isAdminApi) {
    const limited = adminApiRateLimit(req);
    if (limited) return limited;
  }

  if (isSuperadminPage) {
    if (!isSuperadminRole(role)) {
      return dashboardRedirect(req);
    }

    return NextResponse.next();
  }

  if (!isAdminRole(role)) {
    return isAdminApi ? jsonError("Forbidden", 403) : dashboardRedirect(req);
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
