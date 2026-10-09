import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check your environment configuration.");
}

const adapter = new PrismaPg({ connectionString });

declare global {
  // Reuse a single Prisma client during local hot reloads.
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
