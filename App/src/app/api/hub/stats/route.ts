import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { errorResponse } from "~/lib/api";
import type { EncounterStatus } from "~/lib/encounterStatus";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let isEnded = false;
    let session = await db.clinicSession.findFirst({
      where: { isActive: true },
    });

    if (!session) {
      session = await db.clinicSession.findFirst({
        where: { endedAt: { not: null } },
        orderBy: { endedAt: "desc" },
      });
      if (session) isEnded = true;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const registeredToday = await db.client.count({
      where: { createdAt: { gte: todayStart }, deletedAt: null },
    });

    const noStore = { headers: { "Cache-Control": "no-store" } };

    if (!session) {
      return NextResponse.json({
        session: null,
        isEnded: false,
        registeredToday,
        total: 0,
        completed: 0,
        active: 0,
        waitingTriage: 0,
        inTriage: 0,
        waitingExam: 0,
        inExam: 0,
        waitingDiagnosis: 0,
        inDiagnosis: 0,
        waitingMeds: 0,
      }, noStore);
    }

    const rows = await db.clinicEncounter.groupBy({
      by: ["status"],
      where: { sessionId: session.id },
      _count: { id: true },
    });

    const counts = Object.fromEntries(
      rows.map((r) => [r.status, r._count.id]),
    ) as Partial<Record<EncounterStatus, number>>;

    const get = (s: EncounterStatus) => counts[s] ?? 0;
    const total = rows.reduce((sum, r) => sum + r._count.id, 0);
    const completed =
      get("completed_medication_given") + get("completed_no_meds") + get("referred");

    return NextResponse.json({
      isEnded,
      session: {
        id: session.id,
        clinicName: session.clinicName,
        location: session.location,
        date: session.date.toISOString(),
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        dailyTarget: session.dailyTarget,
        endedAt: session.endedAt?.toISOString() ?? null,
      },
      registeredToday,
      total,
      completed,
      active: total - completed,
      waitingTriage: get("registered"),
      inTriage: get("in_triage"),
      waitingExam: get("triage_completed"),
      inExam: get("in_examination"),
      waitingDiagnosis: get("examination_completed"),
      inDiagnosis: get("in_diagnosis"),
      waitingMeds: get("waiting_medication"),
    }, noStore);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to retrieve hub stats", 500, msg);
  }
}
