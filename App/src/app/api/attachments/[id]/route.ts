import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { authWrapper } from "~/utils/authWrapper";

// GET: Download a specific attachment
export const GET = authWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;

        const attachment = await db.visitAttachment.findUnique({
            where: { id }
        });

        if (!attachment) {
            return NextResponse.json({ msg: "Attachment not found" }, { status: 404 });
        }

        return new NextResponse(attachment.fileData, {
            status: 200,
            headers: {
                "Content-Type": attachment.fileType,
                "Content-Disposition": `attachment; filename="${attachment.fileName}"`,
                "Content-Length": attachment.fileSize.toString()
            }
        });

    } catch (error: any) {
        console.error("Download attachment error:", error);
        return NextResponse.json(
            { msg: "Failed to download attachment", error: error.message },
            { status: 500 }
        );
    }
});

// DELETE: Remove an attachment
export const DELETE = authWrapper(async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;

        const attachment = await db.visitAttachment.findUnique({
            where: { id }
        });

        if (!attachment) {
            return NextResponse.json({ msg: "Attachment not found" }, { status: 404 });
        }

        // Delete the attachment
        await db.visitAttachment.delete({
            where: { id }
        });

        return NextResponse.json({ msg: "Attachment deleted successfully" });

    } catch (error: any) {
        console.error("Delete attachment error:", error);
        return NextResponse.json(
            { msg: "Failed to delete attachment", error: error.message },
            { status: 500 }
        );
    }
});
