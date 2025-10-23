import { PrismaClient } from "@prisma/client";
import path from "path";
import { existsSync } from "fs";

const getDatabaseUrl = () => {
  // If DATABASE_URL is explicitly set (by Electron), use it
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "file:./app.db") {
    console.log('[Prisma] Using explicit DATABASE_URL:', process.env.DATABASE_URL);
    return process.env.DATABASE_URL;
  }

  // Development: use the .env value
  if (process.env.NODE_ENV === "development") {
    const devUrl = process.env.DATABASE_URL || "file:./prisma/app.db";
    console.log('[Prisma] Using dev DATABASE_URL:', devUrl);
    return devUrl;
  }

  // Production: Check if we're in Electron by looking for app.db in current directory
  const localDb = path.join(process.cwd(), 'app.db');
  if (existsSync(localDb)) {
    console.log('[Prisma] Found database at:', localDb);
    return `file:${localDb}`;
  }

  // Fallback to .env value
  console.log('[Prisma] Using fallback DATABASE_URL:', process.env.DATABASE_URL);
  return process.env.DATABASE_URL || "file:./prisma/app.db";
};

const createPrismaClient = () => {
  const dbUrl = getDatabaseUrl();
  console.log('[Prisma] Final DATABASE_URL:', dbUrl);
  console.log('[Prisma] Current directory:', process.cwd());

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error", "warn"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}