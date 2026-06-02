import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { errorResponse } from "~/lib/api";
import { COMPLETED_STATUSES } from "~/lib/encounterStatus";
import type { EncounterStatus } from "~/lib/encounterStatus";

export async function GET() {
  try {
    let isEnded = false;
    let session = await db.clinicSession.findFirst({
      where: { isActive: true },
    });

    if (!session) {
      // Check for a recently-ended session to display final stats
      session = await db.clinicSession.findFirst({
        where: { endedAt: { not: null } },
        orderBy: { endedAt: "desc" },
      });
      if (session) {
        isEnded = true;
      } else {
        return errorResponse("No active session", 404);
      }
    }

    // Group encounter counts by status — no PII returned
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
      get("completed_medication_given") +
      get("completed_no_meds") +
      get("referred");

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
      counts,
      total,
      completed,
      active: total - completed,
      referred: get("referred"),
      waitingTriage: get("registered"),
      inTriage: get("in_triage"),
      waitingExam: get("triage_completed"),
      inExam: get("in_examination"),
      waitingDiagnosis: get("examination_completed"),
      inDiagnosis: get("in_diagnosis"),
      waitingMeds: get("waiting_medication"),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("Failed to retrieve session stats", 500, msg);
  }
}
