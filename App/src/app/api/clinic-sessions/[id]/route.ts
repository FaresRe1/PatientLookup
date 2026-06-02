import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { ClinicSessionUpdate, ClinicSessionResponse } from "~/models/clinicSession";
import { parseBody } from "~/utils/validation";
import { errorResponse } from "~/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await db.clinicSession.findUnique({ where: { id: params.id } });
    if (!session) return errorResponse("Session not found", 404);
    return NextResponse.json(ClinicSessionResponse.parse(session));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to retrieve session", 500, msg);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const result = parseBody(ClinicSessionUpdate, body);
    if (!result.ok) {
      return NextResponse.json(
        { msg: "Validation failed", errors: result.errors },
        { status: 400 },
      );
    }

    if (result.data.isActive) {
      await db.clinicSession.updateMany({
        where: { id: { not: params.id } },
        data: { isActive: false },
      });
    }

    const session = await db.clinicSession.update({
      where: { id: params.id },
      data: result.data,
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
    return errorResponse("Failed to update session", 500, msg);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await db.clinicSession.delete({ where: { id: params.id } });
    return NextResponse.json({ msg: "Session deleted" });
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
    return errorResponse("Failed to delete session", 500, msg);
  }
}
