import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authWrapper } from "~/utils/authWrapper";
import { parseBody } from "~/utils/validation";

const idSchema = z.string().min(1, "id is required");

import { ClientCreate, ClientResponse } from "~/models/client";

const updateClientSchema = ClientCreate;

export const GET = authWrapper(async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await context.params;
        const parsed = idSchema.safeParse(id);
        
        if (!parsed.success) {
            return NextResponse.json({ msg: "Validation failed" }, { status: 400 });
        }
        
        const correct_id = parsed.data;

        const details = await db.client.findUnique({ where: { id: correct_id } });

        if (!details) {
            return NextResponse.json({ msg: 'Failed to find client information' }, { status: 404 });
        }

        const clientWithImage = {
            ...details,
            profileImage: details.profileImage ? Buffer.from(details.profileImage).toString('base64') : null,
        };
        const validated = ClientResponse.parse(clientWithImage);
        return NextResponse.json({ details: validated });

    } catch (error: any) {
        return NextResponse.json({ msg: 'Failed to get client information', error: error.message }, { status: 500 });
    }
});

export const PUT = authWrapper(async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await context.params;
        const parsedId = idSchema.safeParse(id);
        if (!parsedId.success) {
            return NextResponse.json({ msg: "Invalid ID" }, { status: 400 });
        }

        // Check if request has FormData (file upload) or JSON
        const contentType = req.headers.get('content-type') || '';
        let body: any;
        let profileImageFile: File | null = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            profileImageFile = formData.get('profileImage') as File | null;
            
            body = {};
            for (const [key, value] of formData.entries()) {
                if (key !== 'profileImage') {
                    body[key] = value;
                }
            }
        } else {
            body = await req.json();
        }
        const parsed = parseBody(updateClientSchema, body);
        if (!parsed.ok) {
            return NextResponse.json({ msg: "Validation failed", errors: parsed.errors }, { status: 400 });
        }

        const data = parsed.data;

        let profileImage: Uint8Array | undefined;
        if (profileImageFile) {
            const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
            if (profileImageFile.size > MAX_PROFILE_IMAGE_SIZE) {
                return NextResponse.json(
                    { msg: "Profile image size exceeds 5MB limit" },
                    { status: 400 }
                );
            }
            
            const arrayBuffer = await profileImageFile.arrayBuffer();
            profileImage = new Uint8Array(arrayBuffer);
        }

        // Ensure dob is a Date for Prisma (ClientCreate preprocess already converts strings to Date)
        const updateData: any = { ...(data as Record<string, any>) };
        if ((data as any).dob && !((data as any).dob instanceof Date)) {
            updateData.dob = new Date((data as any).dob);
        }
        if (profileImage !== undefined) {
            updateData.profileImage = profileImage;
        } else if ((data as any).profileImage && typeof (data as any).profileImage === 'string') {
            updateData.profileImage = Uint8Array.from(Buffer.from((data as any).profileImage, 'base64'));
        }

        const updatedClient = await db.client.update({
            where: { id: parsedId.data },
            data: updateData,
        });

        const clientWithImage = {
            ...updatedClient,
            profileImage: updatedClient.profileImage ? Buffer.from(updatedClient.profileImage).toString('base64') : null,
        };
        const validated = ClientResponse.parse(clientWithImage);
        return NextResponse.json({ msg: "Client updated successfully", details: validated });

    } catch (error: any) {
        return NextResponse.json({ msg: 'Failed to update client', error: error.message }, { status: 500 });
    }
});