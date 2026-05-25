import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/database/dbConnect";

type RateLimitConfig = {
  keyPrefix: string;
  windowMs: number;
  max: number;
};

type MemoryBucket = {
  count: number;
  expiresAt: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();
let mongoIndexPromise: Promise<void> | null = null;

function getClientIp(req: Request | NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

function getRouteKey(req: Request | NextRequest) {
  try {
    return new URL(req.url).pathname;
  } catch {
    return "unknown";
  }
}

async function getMongoRateLimitCollection() {
  const connection = await connectToDatabase();
  const collection = connection.collection<{
    _id: string;
    count: number;
    expiresAt: Date;
    updatedAt: Date;
  }>("rate_limit_buckets");

  if (!mongoIndexPromise) {
    mongoIndexPromise = Promise.all([
      collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      collection.createIndex({ updatedAt: 1 }),
    ]).then(() => undefined);
  }

  await mongoIndexPromise;
  return collection;
}

async function hitMongo(key: string, windowMs: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const collection = await getMongoRateLimitCollection();
  const bucket = await collection.findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          count: {
            $cond: [
              { $gt: ["$expiresAt", now] },
              { $add: [{ $ifNull: ["$count", 0] }, 1] },
              1,
            ],
          },
          expiresAt: {
            $cond: [{ $gt: ["$expiresAt", now] }, "$expiresAt", resetAt],
          },
          updatedAt: now,
        },
      },
    ],
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  if (!bucket) return null;

  return {
    count: bucket.count,
    resetMs: Math.max(1, bucket.expiresAt.getTime() - now.getTime()),
  };
}

function hitMemory(key: string, windowMs: number) {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || existing.expiresAt <= now) {
    const bucket = { count: 1, expiresAt: now + windowMs };
    memoryBuckets.set(key, bucket);
    return { count: bucket.count, resetMs: windowMs };
  }

  existing.count += 1;
  return { count: existing.count, resetMs: existing.expiresAt - now };
}

function makeRateLimitResponse(resetMs: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil(resetMs / 1000))),
      },
    }
  );
}

export const rateLimitProfiles = {
  auth: { keyPrefix: "auth", windowMs: 15 * 60 * 1000, max: 30 },
  sensitive: { keyPrefix: "sensitive", windowMs: 15 * 60 * 1000, max: 20 },
  payment: { keyPrefix: "payment", windowMs: 60 * 1000, max: 20 },
  webhook: { keyPrefix: "webhook", windowMs: 60 * 1000, max: 120 },
  upload: { keyPrefix: "upload", windowMs: 15 * 60 * 1000, max: 20 },
  admin: { keyPrefix: "admin", windowMs: 60 * 1000, max: 120 },
} satisfies Record<string, RateLimitConfig>;

export async function enforceRateLimit(
  req: Request | NextRequest,
  config: RateLimitConfig,
  subject?: string
) {
  const identity = subject || getClientIp(req);
  const route = getRouteKey(req);
  const key = `rl:${config.keyPrefix}:${route}:${identity}`;

  let result: { count: number; resetMs: number };
  try {
    result = (await hitMongo(key, config.windowMs)) ?? hitMemory(key, config.windowMs);
  } catch (error) {
    console.error("[rate-limit] Falling back to memory limiter", error);
    result = hitMemory(key, config.windowMs);
  }

  if (result.count > config.max) {
    return makeRateLimitResponse(result.resetMs);
  }

  return null;
}
