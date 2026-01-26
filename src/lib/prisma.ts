import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * 1. Validate DATABASE_URL safely.
 *    We do not use "!" because that can crash at runtime.
 */
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

/**
 * 2. Create adapter with validated connection string.
 */
const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

/**
 * 3. Create Prisma client using the adapter.
 */
const createPrismaClient = () =>
  new PrismaClient({
    adapter,
  });

/**
 * 4. Proper singleton pattern for Prisma in Node.
 *    Avoids creating multiple clients during hot reload in dev.
 */
declare global {
   
  var prismaGlobal: PrismaClient | undefined;
}

const prisma =
  globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;



