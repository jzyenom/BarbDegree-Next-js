import mongoose, { Connection } from "mongoose";
import { getMongoUri } from "@/lib/env";

type MongooseCache = {
  connection: Connection | null;
  promise: Promise<typeof mongoose> | null;
  lastFailure: {
    name: string;
    message: string;
    stack?: string;
    failedAt: number;
    retryAt: number;
  } | null;
  lastFailureLogAt: number;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const mongooseCache = globalCache.mongooseCache ?? {
  connection: null,
  promise: null,
  lastFailure: null,
  lastFailureLogAt: 0,
};

globalCache.mongooseCache = mongooseCache;

export class DatabaseUnavailableError extends Error {
  code = "DATABASE_UNAVAILABLE";
  retryAt?: number;
  cause?: unknown;

  constructor(message: string, options?: { retryAt?: number; cause?: unknown }) {
    super(message);
    this.name = "DatabaseUnavailableError";
    this.retryAt = options?.retryAt;
    this.cause = options?.cause;
  }
}

export function isDatabaseUnavailableError(
  error: unknown
): error is DatabaseUnavailableError {
  return (
    error instanceof DatabaseUnavailableError ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "DATABASE_UNAVAILABLE")
  );
}

function readPositiveIntEnv(name: string, fallback: number) {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

const serverSelectionTimeoutMS = readPositiveIntEnv(
  "MONGODB_SERVER_SELECTION_TIMEOUT_MS",
  10_000
);
const connectTimeoutMS = readPositiveIntEnv("MONGODB_CONNECT_TIMEOUT_MS", 10_000);
const socketTimeoutMS = readPositiveIntEnv("MONGODB_SOCKET_TIMEOUT_MS", 20_000);
const maxRetries = readPositiveIntEnv("MONGODB_CONNECT_RETRIES", 2);
const retryBaseDelayMS = readPositiveIntEnv("MONGODB_RETRY_BASE_DELAY_MS", 250);
const failureCacheMS = readPositiveIntEnv("MONGODB_FAILURE_CACHE_MS", 15_000);
const failureLogIntervalMS = readPositiveIntEnv(
  "MONGODB_FAILURE_LOG_INTERVAL_MS",
  60_000
);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

function logConnectionFailure(error: unknown) {
  const now = Date.now();
  if (now - mongooseCache.lastFailureLogAt < failureLogIntervalMS) {
    return;
  }

  mongooseCache.lastFailureLogAt = now;
  console.error("[db] MongoDB connection unavailable.", {
    ...serializeError(error),
    serverSelectionTimeoutMS,
    connectTimeoutMS,
    socketTimeoutMS,
    failureCacheMS,
  });
}

async function connectWithRetry(mongoUri: string) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await mongoose.connect(mongoUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS,
        connectTimeoutMS,
        socketTimeoutMS,
      });
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries) break;

      const delay = retryBaseDelayMS * 2 ** attempt;
      await sleep(delay);
    }
  }

  throw lastError;
}

const connectToDatabase = async (): Promise<Connection> => {
  if (mongooseCache.connection?.readyState === 1) {
    return mongooseCache.connection;
  }

  const now = Date.now();
  if (mongooseCache.lastFailure && mongooseCache.lastFailure.retryAt > now) {
    throw new DatabaseUnavailableError(
      "MongoDB is temporarily unavailable. Skipping connection retry until cooldown expires.",
      { retryAt: mongooseCache.lastFailure.retryAt }
    );
  }

  if (!mongooseCache.promise) {
    const mongoUri = getMongoUri();

    // One shared promise prevents duplicate connection attempts during bursts.
    mongooseCache.promise = connectWithRetry(mongoUri);
  }

  try {
    const mongooseInstance = await mongooseCache.promise;
    mongooseCache.connection = mongooseInstance.connection;
    mongooseCache.lastFailure = null;

    if (mongooseCache.connection.readyState !== 1) {
      throw new Error("MongoDB connection did not reach the connected state.");
    }

    return mongooseCache.connection;
  } catch (error) {
    mongooseCache.promise = null;
    mongooseCache.connection = null;

    const serialized = serializeError(error);
    const retryAt = Date.now() + failureCacheMS;
    mongooseCache.lastFailure = {
      ...serialized,
      failedAt: Date.now(),
      retryAt,
    };

    logConnectionFailure(error);

    throw new DatabaseUnavailableError("MongoDB is unavailable.", {
      cause: error,
      retryAt,
    });
  }
};

export default connectToDatabase;
