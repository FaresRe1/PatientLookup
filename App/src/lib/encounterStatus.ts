export const ENCOUNTER_STATUSES = [
  "registered",
  "in_triage",
  "triage_completed",
  "in_examination",
  "examination_completed",
  "in_diagnosis",
  "waiting_medication",
  "completed_medication_given",
  "completed_no_meds",
  "referred",
] as const;

export type EncounterStatus = (typeof ENCOUNTER_STATUSES)[number];

export const STATUS_TRANSITIONS: Record<EncounterStatus, EncounterStatus[]> = {
  registered:                ["in_triage"],
  in_triage:                 ["triage_completed"],
  triage_completed:          ["in_examination"],
  in_examination:            ["examination_completed"],
  examination_completed:     ["in_diagnosis"],
  in_diagnosis:              ["waiting_medication", "completed_no_meds", "referred"],
  waiting_medication:        ["completed_medication_given"],
  completed_medication_given: [],
  completed_no_meds:         [],
  referred:                  [],
};

export function isValidTransition(from: EncounterStatus, to: EncounterStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalStatus(status: EncounterStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}

export const STATUS_LABELS: Record<EncounterStatus, string> = {
  registered:                "Registered",
  in_triage:                 "In Triage",
  triage_completed:          "Awaiting Examination",
  in_examination:            "In Examination",
  examination_completed:     "Awaiting Diagnosis",
  in_diagnosis:              "In Diagnosis",
  waiting_medication:        "Awaiting Medication",
  completed_medication_given: "Completed",
  completed_no_meds:         "Completed (No Meds)",
  referred:                  "Referred",
};

export const COMPLETED_STATUSES: EncounterStatus[] = [
  "completed_medication_given",
  "completed_no_meds",
  "referred",
];

export function isCompleted(status: EncounterStatus): boolean {
  return COMPLETED_STATUSES.includes(status);
}
