import type { EncounterStatus } from "~/lib/encounterStatus";

/**
 * Returns the URL for the appropriate stage form for a given encounter status.
 * Returns null for completed/terminal statuses with no actionable form.
 * Filled in phase by phase — only triage active for Phase 3.
 */
export function getEncounterHref(
  encounterId: string,
  status: EncounterStatus,
): string | null {
  switch (status) {
    case "registered":
    case "in_triage":
      return `/clinic/triage/${encounterId}`;
    case "triage_completed":
    case "in_examination":
      return `/clinic/examination/${encounterId}`;        // Phase 4
    case "examination_completed":
    case "in_diagnosis":
      return `/clinic/diagnosis/${encounterId}`;          // Phase 5
    case "waiting_medication":
      return `/clinic/medication/${encounterId}`;         // Phase 6
    default:
      return null;
  }
}
