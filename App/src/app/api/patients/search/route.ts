import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { serializePatient, errorResponse } from "~/lib/api";

const searchSchema = z.object({
  query: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = url.searchParams.get("query") ?? "";

    const parseResult = searchSchema.safeParse({ query: queryParams });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors },
        { status: 400 },
      );
    }

    const q = parseResult.data.query ?? "";

    const rows = await db.client.findMany({
      where: {
        OR: [
          { fullName: { contains: q } },
          { phoneNumber: { contains: q } },
        ],
      },
    });

    const patients = rows.map(serializePatient);
    return NextResponse.json(patients);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to search patients", 500, msg);
  }
}
