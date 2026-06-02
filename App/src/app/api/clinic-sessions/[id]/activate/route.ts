import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { ClinicSessionResponse } from "~/models/clinicSession";
import { errorResponse } from "~/lib/api";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await db.clinicSession.updateMany({ data: { isActive: false } });
    const session = await db.clinicSession.update({
      where: { id: params.id },
      data: { isActive: true },
    });
    return NextResponse.json(ClinicSessionResponse.parse(session));
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return errorResponse("Session not found", 404);
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to activate session", 500, msg);
  }
}
