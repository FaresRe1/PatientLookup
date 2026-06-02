import { VisitCreate } from "~/models/visit";

let seq = 0;

export function resetVisitSeq() {
  seq = 0;
}

export function makeVisit(overrides: Partial<Record<string, unknown>> = {}) {
  seq += 1;
  return VisitCreate.parse({
    clientId: (overrides.clientId as string) || `client-${seq}`,
    doctorName: (overrides.doctorName as string) || `Dr ${seq}`,
    notes: overrides.notes ?? null,
    visitDate: (overrides.visitDate as string) || new Date().toISOString(),
    ...overrides,
  });
}
