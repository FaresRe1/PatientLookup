import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authWrapper } from "utils/authWrapper";

// Define Client type
type Client = {
    id: string;
    fullName: string;
    email?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    notes?: string | null;
};

const searchSchema = z.object({
    query: z.string().optional(),
});

// To run use this GET request : http://localhost:3000/api/clients/search?query=whatever_you_want_to_type
// export const GET = authWrapper(async (req: Request) => {  ONLY USE THIS WHEN TESTING
export const GET = authWrapper(async (req: NextRequest) => {
    try {
        const url = new URL(req.url);
        const queryParams = url.searchParams.get("query") ?? "";

        const parseResult = searchSchema.safeParse({ query: queryParams });
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });
        }

        const { query } = parseResult.data;

        let clients: Client[];

        if (!query) {
            // Empty query return all clients
            clients = await db.client.findMany();
        } else {
            // Non-empty query for case-insensitive search using raw SQL
            clients = await db.$queryRaw<Client[]>`
                SELECT * FROM Client
                WHERE LOWER(fullName) LIKE '%' || LOWER(${query}) || '%'
                   OR LOWER(email) LIKE '%' || LOWER(${query}) || '%'
                   OR LOWER(phoneNumber) LIKE '%' || LOWER(${query}) || '%';
            `;
        }

        return NextResponse.json(clients);
    } catch (error: any) {
        return NextResponse.json(
            { msg: "Failed to get client information", error: error.message },
            { status: 500 }
        );
    }
});
