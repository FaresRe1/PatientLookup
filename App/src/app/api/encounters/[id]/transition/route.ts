import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { EncounterStatusTransition, EncounterResponse } from "~/models/clinicEncounter";
import { parseBody } from "~/utils/validation";
import { errorResponse } from "~/lib/api";
import { isValidTransition, type EncounterStatus } from "~/lib/encounterStatus";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const result = parseBody(EncounterStatusTransition, body);
    if (!result.ok) {
      return NextResponse.json(
        { msg: "Validation failed", errors: result.errors },
        { status: 400 },
      );
    }

    const existing = await db.clinicEncounter.findUnique({
      where: { id: params.id },
      include: { session: { select: { endedAt: true } } },
    });
    if (!existing) return errorResponse("Encounter not found", 404);
    if (existing.session.endedAt) {
      return errorResponse("This clinic session has ended — no further transitions allowed", 422);
    }

    const currentStatus = existing.status as EncounterStatus;
    const { newStatus, ...clinicalData } = result.data;

    if (!isValidTransition(currentStatus, newStatus)) {
      return errorResponse(
        `Cannot transition from '${currentStatus}' to '${newStatus}'`,
        422,
      );
    }

    const medicationGivenAt =
      newStatus === "completed_medication_given" ? new Date() : undefined;

    // Strip undefined values so Prisma doesn't nullify existing data
    const cleanData = Object.fromEntries(
      Object.entries(clinicalData).filter(([, v]) => v !== undefined),
    );

    const updated = await db.clinicEncounter.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        ...cleanData,
        ...(medicationGivenAt ? { medicationGivenAt } : {}),
      },
      include: {
        client: {
          select: {
            fullName: true,
            profileImage: true,
            gender: true,
            dob: true,
            village: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...EncounterResponse.parse(updated),
      client: {
        ...updated.client,
        dob: updated.client.dob.toISOString(),
        profileImage: updated.client.profileImage
          ? Buffer.from(updated.client.profileImage).toString("base64")
          : null,
      },
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return errorResponse("Encounter not found", 404);
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to transition encounter", 500, msg);
  }
}
