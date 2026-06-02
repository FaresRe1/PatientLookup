import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { errorResponse } from "~/lib/api";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await db.clinicSession.findUnique({
      where: { id: params.id },
    });
    if (!session) return errorResponse("Session not found", 404);
    if (session.endedAt) return errorResponse("Session already ended", 400);

    const updated = await db.clinicSession.update({
      where: { id: params.id },
      data: { isActive: false, endedAt: new Date() },
    });

    return NextResponse.json({ endedAt: updated.endedAt?.toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to end session", 500, msg);
  }
}
