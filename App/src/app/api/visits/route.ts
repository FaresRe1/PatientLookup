import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { parseBody } from "~/utils/validation";
import { errorResponse } from "~/lib/api";
import { VisitCreate, VisitResponse } from "~/models/visit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return errorResponse("clientId query parameter is required", 400);
    }

    const visits = await db.visit.findMany({
      where: { clientId },
      orderBy: { visitDate: "desc" },
      include: {
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(visits);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to load visits", 500, msg);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = parseBody(VisitCreate, body);
    if (!parsed.ok) {
      return NextResponse.json(
        { msg: "Validation failed", errors: parsed.errors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const newVisit = await db.visit.create({
      data: {
        clientId: data.clientId,
        doctorName: data.doctorName,
        presentingComplaint: data.presentingComplaint ?? "",
        historyOfPresentingComplaint:
          data.historyOfPresentingComplaint ?? "",
        observationAndExamination: data.observationAndExamination ?? "",
        impression: data.impression ?? "",
        plan: data.plan ?? "",
        notes: data.notes ?? "",
        visitDate:
          data.visitDate instanceof Date
            ? data.visitDate
            : new Date(data.visitDate),
      },
    });

    const validated = VisitResponse.parse(newVisit);
    return NextResponse.json(validated, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to save visit", 500, msg);
  }
}
