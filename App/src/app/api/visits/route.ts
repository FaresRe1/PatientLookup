import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authWrapper } from "utils/authWrapper";
import { parseBody } from "~/utils/validation";

const createVisitSchema = z.object({
    clientId: z.string().min(1, "Client ID is required"),
    doctorName: z.string().min(1, "Doctor name is required"),
    notes: z.string().optional(),
    visitDate: z.string().min(1, "Visit date is required"),
});

// GET: Fetch all visits for a specific client
// Usage: /api/visits?clientId=123
export const GET = authWrapper(async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("clientId");

        if (!clientId) {
            return NextResponse.json({ msg: "clientId query parameter is required" }, { status: 400 });
        }

        const visits = await db.visit.findMany({
            where: { clientId },
            orderBy: { visitDate: 'desc' }, // Show newest visits first
            include: {
                forms: true // Also grab the documents attached to this visit
            }
        });

        return NextResponse.json(visits);

    } catch (error: any) {
        return NextResponse.json({ msg: 'Failed to load visits', error: error.message }, { status: 500 });
    }
});

// POST: Create a new visit
export const POST = authWrapper(async (req: NextRequest) => {
    try {
        const body = await req.json();

        const parsed = parseBody(createVisitSchema, body);
        if (!parsed.ok) {
            return NextResponse.json({ msg: "Validation failed", errors: parsed.errors }, { status: 400 });
        }

        const data = parsed.data;

        // Create the visit in the database
        const newVisit = await db.visit.create({
            data: {
                clientId: data.clientId,
                doctorName: data.doctorName,
                notes: data.notes || "",
                visitDate: new Date(data.visitDate)
            }
        });

        return NextResponse.json(newVisit, { status: 201 });

    } catch (error: any) {
        console.error("Create visit error:", error);
        return NextResponse.json({ msg: 'Failed to save visit', error: error.message }, { status: 500 });
    }
});