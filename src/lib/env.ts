const isProduction = process.env.NODE_ENV === "production";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getVercelUrl(): string | undefined {
  const vercelUrl = readEnv("VERCEL_URL");
  return vercelUrl ? `https://${vercelUrl.replace(/^https?:\/\//, "")}` : undefined;
}

function parseAbsoluteUrl(name: string, value: string): string {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`[env] ${name} must be an absolute URL. Received: "${value}".`);
  }

  const isLocalhost =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]";
  const isHostedDeployment = Boolean(readEnv("VERCEL_URL") || readEnv("VERCEL"));

  if (
    isProduction &&
    parsed.protocol !== "https:" &&
    !(isLocalhost && !isHostedDeployment)
  ) {
    throw new Error(`[env] ${name} must use https in production. Received: "${value}".`);
  }

  return parsed.toString().replace(/\/$/, "");
}

export function getAuthBaseUrl(): string | undefined {
  const explicitUrl = readEnv("NEXTAUTH_URL") ?? readEnv("AUTH_URL");

  if (explicitUrl) {
    return parseAbsoluteUrl("NEXTAUTH_URL", explicitUrl);
  }

  const vercelUrl = getVercelUrl();
  if (vercelUrl) {
    return vercelUrl;
  }

  if (isProduction) {
    throw new Error(
      "[env] Missing NEXTAUTH_URL/AUTH_URL in production and no VERCEL_URL fallback is available."
    );
  }

  return undefined;
}

export function getNextAuthSecret(): string | undefined {
  const secret = readEnv("NEXTAUTH_SECRET") ?? readEnv("AUTH_SECRET") ?? readEnv("JWT_SECRET");

  if (!secret && isProduction) {
    throw new Error("[env] Missing NEXTAUTH_SECRET (or AUTH_SECRET) in production.");
  }

  return secret;
}

export function getMongoUri(): string {
  const mongoUri =
    readEnv("MONGODB_URI") ??
    (isProduction ? readEnv("MONGODB_URI_CLOUD") : readEnv("MONGODB_URI_LOCAL"));

  if (mongoUri) {
    return mongoUri;
  }

  if (isProduction) {
    throw new Error(
      "[env] Missing MongoDB connection string. Set MONGODB_URI (preferred) or MONGODB_URI_CLOUD in production."
    );
  }

  return "mongodb://localhost:27017/barbdegree2";
}

export function getGoogleOAuthConfig(): {
  clientId?: string;
  clientSecret?: string;
  enabled: boolean;
} {
  const clientId = readEnv("GOOGLE_CLIENT_ID");
  const clientSecret = readEnv("GOOGLE_CLIENT_SECRET");

  if ((clientId && !clientSecret) || (!clientId && clientSecret)) {
    throw new Error(
      "[env] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must either both be set or both be omitted."
    );
  }

  if (isProduction && (!clientId || !clientSecret)) {
    throw new Error(
      "[env] Google OAuth is required in production for this app. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
    );
  }

  return {
    clientId,
    clientSecret,
    enabled: Boolean(clientId && clientSecret),
  };
}

export function getPublicAppUrl(): string | undefined {
  const publicUrl = readEnv("NEXT_PUBLIC_URL") ?? readEnv("NEXT_PUBLIC_APP_URL");
  return publicUrl ? parseAbsoluteUrl("NEXT_PUBLIC_URL", publicUrl) : undefined;
}
