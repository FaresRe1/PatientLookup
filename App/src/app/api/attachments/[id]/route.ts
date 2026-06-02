import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { errorResponse } from "~/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const attachment = await db.visitAttachment.findUnique({
      where: { id },
    });

    if (!attachment) return errorResponse("Attachment not found", 404);

    return new NextResponse(attachment.fileData, {
      status: 200,
      headers: {
        "Content-Type": attachment.fileType,
        "Content-Disposition": `attachment; filename="${attachment.fileName}"`,
        "Content-Length": attachment.fileSize.toString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to download attachment", 500, msg);
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const attachment = await db.visitAttachment.findUnique({
      where: { id },
    });

    if (!attachment) return errorResponse("Attachment not found", 404);

    await db.visitAttachment.delete({ where: { id } });

    return NextResponse.json({ msg: "Attachment deleted successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to delete attachment", 500, msg);
  }
}
