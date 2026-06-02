import { NextResponse } from "next/server";
import type { Client as PrismaClient } from "@prisma/client";
import { PatientResponse } from "~/models/patient";

/**
 * Convert a Prisma Client record into a JSON-safe shape
 * (profileImage Buffer → base64 string, dates handled by Zod).
 */
export function serializePatient(record: PrismaClient) {
  return PatientResponse.parse({
    ...record,
    profileImage: record.profileImage
      ? Buffer.from(record.profileImage).toString("base64")
      : null,
  });
}

/** Return a consistently-shaped error response. */
export function errorResponse(msg: string, status: number, detail?: string) {
  const body: Record<string, string> = { msg };
  if (detail) body.error = detail;
  return NextResponse.json(body, { status });
}
