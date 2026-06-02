import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

const EXPORT_PASSWORD = "Safar";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "No data";
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? "" : String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\r\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { password?: string; type?: string };

    if (body.password !== EXPORT_PASSWORD) {
      return NextResponse.json({ msg: "Incorrect password" }, { status: 401 });
    }

    const type = body.type ?? "patients";

    if (type === "patients") {
      const rows = await db.client.findMany({ orderBy: { createdAt: "asc" } });
      const data = rows.map((r) => ({
        id: r.id,
        fullName: r.fullName,
        gender: r.gender,
        dob: r.dob.toISOString().split("T")[0],
        phoneNumber: r.phoneNumber ?? "",
        village: r.village ?? "",
        createdAt: r.createdAt.toISOString(),
      }));
      return new NextResponse(toCsv(data), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="patients-${Date.now()}.csv"`,
        },
      });
    }

    if (type === "encounters") {
      const rows = await db.clinicEncounter.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          client: { select: { fullName: true } },
          session: { select: { clinicName: true, location: true } },
        },
      });
      const data = rows.map((r) => ({
        id: r.id,
        patientName: r.client.fullName,
        patientId: r.clientId,
        clinicName: r.session.clinicName,
        location: r.session.location,
        status: r.status,
        registeredAt: r.createdAt.toISOString(),
        bloodPressure: r.bloodPressure ?? "",
        heartRate: r.heartRate ?? "",
        temperature: r.temperature ?? "",
        spO2: r.spO2 ?? "",
        weight: r.weight ?? "",
        mainComplaint: r.mainComplaint ?? "",
        medicalHistory: r.medicalHistory ?? "",
        currentMedications: r.currentMedications ?? "",
        allergies: r.allergies ?? "",
        redFlags: r.redFlags ?? "",
        drugHistory: r.drugHistory ?? "",
        familyHistory: r.familyHistory ?? "",
        socialHistory: r.socialHistory ?? "",
        examinationPerformed: r.examinationPerformed ?? "",
        examinationResults: r.examinationResults ?? "",
        diagnosis: r.diagnosis ?? "",
        clinicalNotes: r.clinicalNotes ?? "",
        treatmentAdvice: r.treatmentAdvice ?? "",
        prescription: r.prescription ?? "",
        followUpAdvice: r.followUpAdvice ?? "",
        referral: r.referral ? "Yes" : "No",
        medicationNeeded: r.medicationNeeded ? "Yes" : "No",
        prescriberNotes: r.prescriberNotes ?? "",
        medicationGivenAt: r.medicationGivenAt?.toISOString() ?? "",
      }));
      return new NextResponse(toCsv(data), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="encounters-${Date.now()}.csv"`,
        },
      });
    }

    if (type === "sessions") {
      const rows = await db.clinicSession.findMany({ orderBy: { createdAt: "asc" } });
      const data = rows.map((r) => ({
        id: r.id,
        clinicName: r.clinicName,
        location: r.location,
        date: r.date.toISOString().split("T")[0],
        startTime: r.startTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        endTime: r.endTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        dailyTarget: r.dailyTarget,
        isActive: r.isActive ? "Yes" : "No",
        endedAt: r.endedAt?.toISOString() ?? "",
        createdAt: r.createdAt.toISOString(),
      }));
      return new NextResponse(toCsv(data), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sessions-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ msg: "Invalid export type" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ msg: "Export failed", error: msg }, { status: 500 });
  }
}
