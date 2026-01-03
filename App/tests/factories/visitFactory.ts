import { VisitCreate } from "~/models/visit";

let seq = 0;
export function makeVisit(overrides: Partial<Record<string, any>> = {}) {
  seq += 1;
  const base = {
    clientId: overrides.clientId || `client-${seq}`,
    doctorName: overrides.doctorName || `Dr ${seq}`,
    notes: overrides.notes ?? null,
    visitDate: overrides.visitDate || new Date().toISOString(),
    ...overrides,
  };

  return VisitCreate.parse(base);
}
