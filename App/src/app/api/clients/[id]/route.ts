import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authWrapper } from "~/utils/authWrapper";
import { parseBody } from "~/utils/validation";

const idSchema = z.string().min(1, "id is required");

import { ClientCreate, ClientResponse } from "~/models/client";

const updateClientSchema = ClientCreate.partial();

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

        const validated = ClientResponse.parse(details);
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

        const body = await req.json();
        const parsed = parseBody(updateClientSchema, body);
        if (!parsed.ok) {
            return NextResponse.json({ msg: "Validation failed", errors: parsed.errors }, { status: 400 });
        }

        const data = parsed.data;

        // Ensure dob is a Date for Prisma (ClientCreate preprocess already converts strings to Date)
        const updateData: any = { ...(data as Record<string, any>) };
        if ((data as any).dob && !((data as any).dob instanceof Date)) {
            updateData.dob = new Date((data as any).dob);
        }

        const updatedClient = await db.client.update({
            where: { id: parsedId.data },
            data: updateData,
        });

        const validated = ClientResponse.parse(updatedClient);
        return NextResponse.json({ msg: "Client updated successfully", details: validated });

    } catch (error: any) {
        return NextResponse.json({ msg: 'Failed to update client', error: error.message }, { status: 500 });
    }
});