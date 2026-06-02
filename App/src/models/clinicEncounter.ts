import { z } from "zod";
import { ENCOUNTER_STATUSES } from "~/lib/encounterStatus";

const isoPreprocess = (v: unknown) =>
  v instanceof Date ? v.toISOString() : v;

export const EncounterCreate = z.object({
  clientId:  z.string().min(1, "Patient ID is required"),
  sessionId: z.string().min(1, "Session ID is required"),
});

export const EncounterTriageUpdate = z.object({
  bloodPressure:      z.string().optional(),
  heartRate:          z.string().optional(),
  temperature:        z.string().optional(),
  spO2:               z.string().optional(),
  weight:             z.string().optional(),
  mainComplaint:      z.string().optional(),
  medicalHistory:     z.string().optional(),
  currentMedications: z.string().optional(),
  allergies:          z.string().optional(),
  redFlags:           z.string().optional(),
  drugHistory:        z.string().optional(),
  familyHistory:      z.string().optional(),
  socialHistory:      z.string().optional(),
});

export const EncounterExaminationUpdate = z.object({
  examinationPerformed: z.string().optional(),
  examinationResults:   z.string().optional(),
});

export const EncounterDiagnosisUpdate = z.object({
  diagnosis:       z.string().optional(),
  clinicalNotes:   z.string().optional(),
  treatmentAdvice: z.string().optional(),
  prescription:    z.string().optional(),
  followUpAdvice:  z.string().optional(),
  referral:        z.boolean().optional(),
  medicationNeeded: z.boolean().optional(),
  prescriberNotes: z.string().optional(),
});

// Used by the PUT endpoint — update clinical data without changing status
export const EncounterUpdate = z.object({
  ...EncounterTriageUpdate.shape,
  ...EncounterExaminationUpdate.shape,
  ...EncounterDiagnosisUpdate.shape,
});

// Used by the transition endpoint — carries the new status plus any stage data
export const EncounterStatusTransition = z.object({
  newStatus: z.enum(ENCOUNTER_STATUSES),
  ...EncounterTriageUpdate.shape,
  ...EncounterExaminationUpdate.shape,
  ...EncounterDiagnosisUpdate.shape,
});

export const EncounterResponse = z.object({
  id:        z.string(),
  createdAt: z.preprocess(isoPreprocess, z.string()),
  updatedAt: z.preprocess(isoPreprocess, z.string()),
  status:    z.enum(ENCOUNTER_STATUSES),
  clientId:  z.string(),
  sessionId: z.string(),

  // Triage
  bloodPressure:      z.string().nullable().optional(),
  heartRate:          z.string().nullable().optional(),
  temperature:        z.string().nullable().optional(),
  spO2:               z.string().nullable().optional(),
  weight:             z.string().nullable().optional(),
  mainComplaint:      z.string().nullable().optional(),
  medicalHistory:     z.string().nullable().optional(),
  currentMedications: z.string().nullable().optional(),
  allergies:          z.string().nullable().optional(),
  redFlags:           z.string().nullable().optional(),
  drugHistory:        z.string().nullable().optional(),
  familyHistory:      z.string().nullable().optional(),
  socialHistory:      z.string().nullable().optional(),

  // Examination
  examinationPerformed: z.string().nullable().optional(),
  examinationResults:   z.string().nullable().optional(),

  // Diagnosis
  diagnosis:        z.string().nullable().optional(),
  clinicalNotes:    z.string().nullable().optional(),
  treatmentAdvice:  z.string().nullable().optional(),
  prescription:     z.string().nullable().optional(),
  followUpAdvice:   z.string().nullable().optional(),
  referral:         z.boolean(),
  medicationNeeded: z.boolean(),
  prescriberNotes:  z.string().nullable().optional(),

  // Medication
  medicationGivenAt: z.preprocess(isoPreprocess, z.string().nullable().optional()),
});

export type EncounterCreateType           = z.infer<typeof EncounterCreate>;
export type EncounterUpdateType           = z.infer<typeof EncounterUpdate>;
export type EncounterResponseType         = z.infer<typeof EncounterResponse>;
export type EncounterStatusTransitionType = z.infer<typeof EncounterStatusTransition>;
