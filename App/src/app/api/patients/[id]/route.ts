import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { PatientCreate } from "~/models/patient";
import { parseBody } from "~/utils/validation";
import { serializePatient, errorResponse } from "~/lib/api";
import { MAX_PROFILE_IMAGE_BYTES } from "~/lib/constants";

const idSchema = z.string().min(1, "id is required");

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) {
      return errorResponse("Invalid patient ID", 400);
    }

    const record = await db.client.findUnique({
      where: { id: parsed.data },
    });

    if (!record) {
      return errorResponse("Patient not found", 404);
    }

    return NextResponse.json({ details: serializePatient(record) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to get patient", 500, msg);
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) {
      return errorResponse("Invalid patient ID", 400);
    }

    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, unknown>;
    let profileImageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      profileImageFile = formData.get("profileImage") as File | null;
      body = {};
      for (const [key, value] of formData.entries()) {
        if (key !== "profileImage") {
          body[key] = value;
        }
      }
    } else {
      body = await req.json();
    }

    const parsed = parseBody(PatientCreate, body);
    if (!parsed.ok) {
      return NextResponse.json(
        { msg: "Validation failed", errors: parsed.errors },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = { ...parsed.data };

    // Ensure dob is a Date for Prisma
    if (updateData.dob && !(updateData.dob instanceof Date)) {
      updateData.dob = new Date(updateData.dob as string);
    }

    // Handle profile image
    if (profileImageFile && profileImageFile.size > 0) {
      if (profileImageFile.size > MAX_PROFILE_IMAGE_BYTES) {
        return errorResponse("Profile image size exceeds 5MB limit", 400);
      }
      const arrayBuffer = await profileImageFile.arrayBuffer();
      updateData.profileImage = new Uint8Array(arrayBuffer);
    } else if (
      typeof updateData.profileImage === "string" &&
      updateData.profileImage
    ) {
      updateData.profileImage = Uint8Array.from(
        Buffer.from(updateData.profileImage as string, "base64"),
      );
    } else {
      delete updateData.profileImage;
    }

    const updated = await db.client.update({
      where: { id: parsedId.data },
      data: updateData,
    });

    return NextResponse.json({
      msg: "Patient updated successfully",
      details: serializePatient(updated),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to update patient", 500, msg);
  }
}
