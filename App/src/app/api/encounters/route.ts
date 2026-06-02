import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { EncounterCreate, EncounterResponse } from "~/models/clinicEncounter";
import { parseBody } from "~/utils/validation";
import { errorResponse } from "~/lib/api";

function serializeEncounterClient(
  profileImage: Buffer | Uint8Array | null | undefined,
) {
  return profileImage ? Buffer.from(profileImage).toString("base64") : null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (sessionId) where.sessionId = sessionId;
    if (status) where.status = status;

    const encounters = await db.clinicEncounter.findMany({
      where,
      orderBy: { createdAt: "asc" },
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

    return NextResponse.json(
      encounters.map((e) => ({
        ...EncounterResponse.parse(e),
        client: {
          ...e.client,
          dob: e.client.dob.toISOString(),
          profileImage: serializeEncounterClient(e.client.profileImage),
        },
      })),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to retrieve encounters", 500, msg);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = parseBody(EncounterCreate, body);
    if (!result.ok) {
      return NextResponse.json(
        { msg: "Validation failed", errors: result.errors },
        { status: 400 },
      );
    }

    const encounter = await db.clinicEncounter.create({
      data: result.data,
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

    return NextResponse.json(
      {
        ...EncounterResponse.parse(encounter),
        client: {
          ...encounter.client,
          dob: encounter.client.dob.toISOString(),
          profileImage: serializeEncounterClient(encounter.client.profileImage),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return errorResponse("Patient already has an encounter in this session", 409);
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to create encounter", 500, msg);
  }
}
