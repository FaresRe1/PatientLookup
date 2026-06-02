import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { errorResponse } from "~/lib/api";
import { EncounterResponse } from "~/models/clinicEncounter";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const encounters = await db.clinicEncounter.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        session: {
          select: {
            clinicName: true,
            location: true,
            date: true,
          },
        },
      },
    });

    return NextResponse.json(
      encounters.map((e) => ({
        ...EncounterResponse.parse(e),
        session: {
          clinicName: e.session.clinicName,
          location: e.session.location,
          date: e.session.date.toISOString(),
        },
        medicationGivenAt: e.medicationGivenAt?.toISOString() ?? null,
      })),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to retrieve encounters", 500, msg);
  }
}
