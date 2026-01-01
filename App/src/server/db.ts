import { PrismaClient } from "@prisma/client";
import path from "path";
import { existsSync } from "fs";

const getDatabaseUrl = () => {
  // Check if we're running in Electron (process.type exists in Electron)
  const isElectron = process.versions && process.versions.electron;
  
  // If DATABASE_URL is explicitly set (by Electron main process), use it
  if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "file:./app.db") {
    console.log('[Prisma] Using explicit DATABASE_URL:', process.env.DATABASE_URL);
    return process.env.DATABASE_URL;
  }

  // For npm run dev (Next.js web development)
  if (process.env.NODE_ENV === "development" && !isElectron) {
    const dbPath = path.join(process.cwd(), 'prisma', 'app.db');
    const devUrl = `file:${dbPath}`;
    console.log('[Prisma] Using web dev DATABASE_URL:', devUrl);
    return devUrl;
  }

  // For npm run electron:dev (Electron development)
  if (process.env.NODE_ENV === "development" && isElectron) {
    const dbPath = path.join(process.cwd(), 'prisma', 'app.db');
    const electronDevUrl = `file:${dbPath}`;
    console.log('[Prisma] Using electron dev DATABASE_URL:', electronDevUrl);
    return electronDevUrl;
  }

  // For npm dist (Production Electron .exe)
  // In packaged Electron app, check for app.db in the app's directory
  const localDb = path.join(process.cwd(), 'app.db');
  if (existsSync(localDb)) {
    console.log('[Prisma] Found production database at:', localDb);
    return `file:${localDb}`;
  }

  // Fallback: try prisma/app.db
  const fallbackPath = path.join(process.cwd(), 'prisma', 'app.db');
  console.log('[Prisma] Using fallback DATABASE_URL:', `file:${fallbackPath}`);
  return `file:${fallbackPath}`;
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