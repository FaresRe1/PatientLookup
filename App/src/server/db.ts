import { PrismaClient } from "@prisma/client";
import path from "path";
import { existsSync } from "fs";

function getDatabaseUrl(): string {
  // Explicit env override (set by Electron main process in production)
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "file:./app.db") {
    return process.env.DATABASE_URL;
  }

  // Development: use prisma/app.db relative to cwd
  if (process.env.NODE_ENV === "development") {
    return `file:${path.join(process.cwd(), "prisma", "app.db")}`;
  }

  // Production: check for app.db next to the executable
  const localDb = path.join(process.cwd(), "app.db");
  if (existsSync(localDb)) {
    return `file:${localDb}`;
  }

  // Fallback
  return `file:${path.join(process.cwd(), "prisma", "app.db")}`;
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
