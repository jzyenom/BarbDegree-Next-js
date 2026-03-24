import mongoose, { Connection } from "mongoose";
import { getMongoUri } from "@/lib/env";

type MongooseCache = {
  connection: Connection | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const mongooseCache = globalCache.mongooseCache ?? {
  connection: null,
  promise: null,
};

globalCache.mongooseCache = mongooseCache;

const connectToDatabase = async (): Promise<Connection> => {
  if (mongooseCache.connection?.readyState === 1) {
    return mongooseCache.connection;
  }

  if (!mongooseCache.promise) {
    const mongoUri = getMongoUri();

    mongooseCache.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    const mongooseInstance = await mongooseCache.promise;
    mongooseCache.connection = mongooseInstance.connection;

    if (mongooseCache.connection.readyState !== 1) {
      throw new Error("MongoDB connection did not reach the connected state.");
    }

    return mongooseCache.connection;
  } catch (error) {
    mongooseCache.promise = null;
    mongooseCache.connection = null;
    console.error("[db] Database connection failed.", error);
    throw error;
  }
};

export default connectToDatabase;
