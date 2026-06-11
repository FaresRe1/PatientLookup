import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { PatientCreate } from "~/models/patient";
import { parseBody } from "~/utils/validation";
import { serializePatient, errorResponse } from "~/lib/api";
import { MAX_PROFILE_IMAGE_BYTES, DEFAULT_PAGE_SIZE } from "~/lib/constants";

export async function GET(_req?: Request) {
  try {
    const rows = await db.client.findMany({
      take: DEFAULT_PAGE_SIZE,
      skip: 0,
      orderBy: { fullName: "asc" },
    });

    const patients = rows.map(serializePatient);
    return NextResponse.json(patients);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to retrieve patients", 500, msg);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const profileImageFile = formData.get("profileImage") as File | null;

    if (profileImageFile && profileImageFile.size > MAX_PROFILE_IMAGE_BYTES) {
      return errorResponse("Profile image size exceeds 5MB limit", 400);
    }

    let profileImage: Uint8Array | undefined;
    if (profileImageFile && profileImageFile.size > 0) {
      const arrayBuffer = await profileImageFile.arrayBuffer();
      profileImage = new Uint8Array(arrayBuffer);
    }

    const sessionId = (formData.get("sessionId") as string) || null;

    const data = {
      fullName: formData.get("fullName") as string,
      gender: formData.get("gender") as string,
      dob: new Date(formData.get("dob") as string),
      phoneNumber: (formData.get("phoneNumber") as string) || null,
      village: (formData.get("village") as string) || null,
      profileImage,
    };

    const result = parseBody(PatientCreate, data);
    if (!result.ok) {
      return NextResponse.json(
        { msg: "Validation failed", errors: result.errors },
        { status: 400 },
      );
    }

    const newRecord = await db.$transaction(async (tx) => {
      const client = await tx.client.create({ data: result.data });
      if (sessionId) {
        await tx.clinicEncounter.create({
          data: { clientId: client.id, sessionId, status: "registered" },
        });
      }
      return client;
    });

    return NextResponse.json(serializePatient(newRecord));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to save patient", 500, msg);
  }
}
