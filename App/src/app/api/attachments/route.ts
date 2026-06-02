import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { errorResponse } from "~/lib/api";
import { MAX_ATTACHMENT_BYTES } from "~/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const visitId = formData.get("visitId") as string | null;

    if (!file) return errorResponse("File is required", 400);
    if (!visitId) return errorResponse("visitId is required", 400);

    if (file.size > MAX_ATTACHMENT_BYTES) {
      return errorResponse("File size exceeds 10MB limit", 400);
    }

    const visit = await db.visit.findUnique({ where: { id: visitId } });
    if (!visit) return errorResponse("Visit not found", 404);

    const buffer = Buffer.from(await file.arrayBuffer());

    const attachment = await db.visitAttachment.create({
      data: {
        visitId,
        fileName: file.name,
        fileType: file.type,
        fileData: buffer,
        fileSize: file.size,
      },
    });

    return NextResponse.json(
      {
        id: attachment.id,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        createdAt: attachment.createdAt,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to upload attachment", 500, msg);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitId = searchParams.get("visitId");

    if (!visitId) {
      return errorResponse("visitId query parameter is required", 400);
    }

    const attachments = await db.visitAttachment.findMany({
      where: { visitId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });

    return NextResponse.json(attachments);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to load attachments", 500, msg);
  }
}
