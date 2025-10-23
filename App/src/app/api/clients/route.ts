import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { authWrapper } from "utils/authWrapper";
import { z } from "zod";
import { db } from "~/server/db";

const clientSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
});


//This get request gets ALL of the clients from the client database. Minimum 50, if the database includes more than 50, then only the first 50 will be shown by order of fullName
// To run use this GET request: http://localhost:3000/api/clients
export const GET = authWrapper(async (req: Request) => {
    try {
        const clients = await db.client.findMany({ take: 50, skip: 0, orderBy: { fullName: 'asc' }, });
        return NextResponse.json({ clients });
    }
    catch (error: any) {
        return NextResponse.json({ msg: 'Failed to retrieve clients', error: error.message }, { status: 500 });
    }
});


//This is a Post request to post new client data into the database
// To run use this POST request : http://localhost:3000/api/clients
export const POST = authWrapper(async (req: Request) => {
    try {
        const body = await req.json()
        const parsed = clientSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ msg: "Validation failed" }, { status: 400 });
        }
        const { fullName, email, phoneNumber, address, notes } = parsed.data;

        const newClient = await db.client.create({
            data: {
                fullName, email, phoneNumber, address, notes
            }
        });
        return NextResponse.json({ newClient });
    }
    catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {

            // if (error?.code === "P2002") //use this only for testing, and comment out  the outer if statement

            if (error.code === "P2002") {
                return NextResponse.json({ msg: 'Client email already used', error: error.message }, { status: 400 });
            }
        }
        return NextResponse.json({ msg: 'Failed to post client information', error: error.message }, { status: 500 });
    }
});

