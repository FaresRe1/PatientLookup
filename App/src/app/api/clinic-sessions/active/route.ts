import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { ClinicSessionResponse } from "~/models/clinicSession";
import { errorResponse } from "~/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await db.clinicSession.findFirst({
      where: { isActive: true },
    });
    if (!session) return errorResponse("No active session", 404);
    return NextResponse.json(ClinicSessionResponse.parse(session), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to retrieve active session", 500, msg);
  }
}
