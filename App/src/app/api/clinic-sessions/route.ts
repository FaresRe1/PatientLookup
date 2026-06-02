import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { ClinicSessionCreate, ClinicSessionResponse } from "~/models/clinicSession";
import { parseBody } from "~/utils/validation";
import { errorResponse } from "~/lib/api";

export async function GET() {
  try {
    const sessions = await db.clinicSession.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(sessions.map((s) => ClinicSessionResponse.parse(s)));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to retrieve clinic sessions", 500, msg);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = parseBody(ClinicSessionCreate, body);
    if (!result.ok) {
      return NextResponse.json(
        { msg: "Validation failed", errors: result.errors },
        { status: 400 },
      );
    }

    if (result.data.isActive) {
      await db.clinicSession.updateMany({ data: { isActive: false } });
    }

    const session = await db.clinicSession.create({ data: result.data });
    return NextResponse.json(ClinicSessionResponse.parse(session), { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to create clinic session", 500, msg);
  }
}
