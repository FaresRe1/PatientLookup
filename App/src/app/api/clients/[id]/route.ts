import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authWrapper } from "utils/authWrapper";

const idSchema = z.string().min(1, "id is required");


// To run this GET request  http://localhost:3000/api/clients/the_id_of_the_client
export const GET = authWrapper(async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
        const { id } = await context.params;
        const parsed = idSchema.safeParse(id);
        if (!parsed.success) {
            return NextResponse.json({ msg: "Validation failed" }, { status: 400 });
        }
        const correct_id = parsed.data;

        // If the details can't be found then a failed message will be sent with status 404
        const details = await db.client.findUnique({ where: { id: correct_id } })
        if (!details) {
            return NextResponse.json({ msg: 'Failed to find client information' }, { status: 404 });
        }

        return NextResponse.json({ details });

    }
    catch (error: any) {
        return NextResponse.json({ msg: 'Failed to get client information', error: error.message }, { status: 500 });
    }

});