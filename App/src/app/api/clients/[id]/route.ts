import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authWrapper } from "utils/authWrapper";

const idSchema = z.string().min(1, "id is required");

const updateClientSchema = z.object({
    fullName: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email").optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    dob: z.string().optional().nullable(), // ISO format in JSON
});

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

        return NextResponse.json({ details });

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

        const body = await req.json();
        const parsedBody = updateClientSchema.safeParse(body);

        if (!parsedBody.success) {
            return NextResponse.json({ msg: "Validation failed", errors: parsedBody.error.format() }, { status: 400 });
        }

        const data = parsedBody.data;

        // Convert the string date to a real Date object for Prisma
        const updateData: any = { ...data };
        if (data.dob) {
            updateData.dob = new Date(data.dob);
        }

        const updatedClient = await db.client.update({
            where: { id: parsedId.data },
            data: updateData,
        });

        return NextResponse.json({ msg: "Client updated successfully", details: updatedClient });

    } catch (error: any) {
        return NextResponse.json({ msg: 'Failed to update client', error: error.message }, { status: 500 });
    }
});