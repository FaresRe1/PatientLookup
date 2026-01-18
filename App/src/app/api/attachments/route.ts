import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { authWrapper } from "~/utils/authWrapper";

// POST: Upload an attachment to a visit
export const POST = authWrapper(async (req: NextRequest) => {
    try {
        const formData = await req.formData();
        
        const file = formData.get("file") as File | null;
        const visitId = formData.get("visitId") as string | null;

        // Validation
        if (!file) {
            return NextResponse.json({ msg: "File is required" }, { status: 400 });
        }
        if (!visitId) {
            return NextResponse.json({ msg: "visitId is required" }, { status: 400 });
        }

        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { msg: "File size exceeds 10MB limit" },
                { status: 400 }
            );
        }

        const visit = await db.visit.findUnique({
            where: { id: visitId }
        });

        if (!visit) {
            return NextResponse.json({ msg: "Visit not found" }, { status: 404 });
        }

        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        const attachment = await db.visitAttachment.create({
            data: {
                visitId,
                fileName: file.name,
                fileType: file.type,
                fileData: buffer,
                fileSize: file.size
            }
        });

        return NextResponse.json(
            {
                id: attachment.id,
                fileName: attachment.fileName,
                fileType: attachment.fileType,
                fileSize: attachment.fileSize,
                createdAt: attachment.createdAt
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Upload attachment error:", error);
        return NextResponse.json(
            { msg: "Failed to upload attachment", error: error.message },
            { status: 500 }
        );
    }
});

// GET: Fetch attachments for a visit
export const GET = authWrapper(async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const visitId = searchParams.get("visitId");

        if (!visitId) {
            return NextResponse.json({ msg: "visitId query parameter is required" }, { status: 400 });
        }

        const attachments = await db.visitAttachment.findMany({
            where: { visitId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                createdAt: true
            }
        });

        return NextResponse.json(attachments);

    } catch (error: any) {
        console.error("Fetch attachments error:", error);
        return NextResponse.json(
            { msg: "Failed to load attachments", error: error.message },
            { status: 500 }
        );
    }
});
