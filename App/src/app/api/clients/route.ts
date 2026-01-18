import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { authWrapper } from "~/utils/authWrapper";
import { db } from "~/server/db";
import { ClientCreate, ClientResponse } from "~/models/client";
import { parseBody } from "~/utils/validation";

    
//This get request gets ALL of the clients from the client database. Minimum 50, if the database includes more than 50, then only the first 50 will be shown by order of fullName
// To run use this GET request: http://localhost:3000/api/clients
export const GET = authWrapper(async (req: Request) => {
    try {
        const rows = await db.client.findMany({ 
            take: 50, 
            skip: 0, 
            orderBy: { fullName: 'asc' }, 
        });

        // Validate/normalize rows using ClientResponse
        const clients = rows.map((r) => {
            const clientWithImage = {
                ...r,
                profileImage: r.profileImage ? Buffer.from(r.profileImage).toString('base64') : null,
            };
            return ClientResponse.parse(clientWithImage);
        });

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
        const formData = await req.formData();

        const fullName = formData.get('fullName') as string;
        const gender = formData.get('gender') as string;
        const dob = formData.get('dob') as string;
        const email = formData.get('email') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const address = formData.get('address') as string;
        const profileImageFile = formData.get('profileImage') as File | null;

        // Validate profile image size (5MB limit for headshots)
        const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        if (profileImageFile && profileImageFile.size > MAX_PROFILE_IMAGE_SIZE) {
            return NextResponse.json(
                { msg: "Profile image size exceeds 5MB limit" },
                { status: 400 }
            );
        }

        let profileImage: Uint8Array | undefined;
        if (profileImageFile) {
            const arrayBuffer = await profileImageFile.arrayBuffer();
            profileImage = new Uint8Array(arrayBuffer);
        }

        const data = {
            fullName,
            gender,
            dob: new Date(dob),
            email: email || null,
            phoneNumber: phoneNumber || null,
            address: address || null,
            profileImage,
        };

        const result = parseBody(ClientCreate, data);
        if (!result.ok) {
            return NextResponse.json({ msg: "Validation failed", errors: result.errors }, { status: 400 });
        }

        const newClient = await db.client.create({
            data: result.data,
        });
        
        // For response, convert profileImage to base64 if present
        const responseData = {
            ...newClient,
            profileImage: newClient.profileImage ? Buffer.from(newClient.profileImage).toString('base64') : null,
        };
        const validated = ClientResponse.parse(responseData);
        return NextResponse.json({ newClient: validated });
    }
    catch (error: any) {
        if (error && (error.code === "P2002" || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"))) {
            return NextResponse.json({ msg: 'Client email already used', error: error.message }, { status: 400 });
        }
        return NextResponse.json({ msg: 'Failed to post client information', error: error?.message }, { status: 500 });
    }
});