import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { EncounterUpdate, EncounterResponse } from "~/models/clinicEncounter";
import { parseBody } from "~/utils/validation";
import { errorResponse } from "~/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const encounter = await db.clinicEncounter.findUnique({
      where: { id: params.id },
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

    if (!encounter) return errorResponse("Encounter not found", 404);

    return NextResponse.json({
      ...EncounterResponse.parse(encounter),
      client: {
        ...encounter.client,
        dob: encounter.client.dob.toISOString(),
        profileImage: encounter.client.profileImage
          ? Buffer.from(encounter.client.profileImage).toString("base64")
          : null,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to retrieve encounter", 500, msg);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const result = parseBody(EncounterUpdate, body);
    if (!result.ok) {
      return NextResponse.json(
        { msg: "Validation failed", errors: result.errors },
        { status: 400 },
      );
    }

    const cleanData = Object.fromEntries(
      Object.entries(result.data).filter(([, v]) => v !== undefined),
    );

    const updated = await db.clinicEncounter.update({
      where: { id: params.id },
      data: cleanData,
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
    return errorResponse("Failed to update encounter", 500, msg);
  }
}
