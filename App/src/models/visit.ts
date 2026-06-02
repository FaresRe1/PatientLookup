import { z } from "zod";

const datePreprocess = (v: unknown) => {
  if (typeof v === "string" && v) return new Date(v);
  if (v instanceof Date) return v;
  return v;
};

const isoPreprocess = (v: unknown) =>
  v instanceof Date ? v.toISOString() : v;

export const VisitCreate = z.object({
  clientId: z.string().min(1, "Patient ID is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  presentingComplaint: z.string().optional().nullable(),
  historyOfPresentingComplaint: z.string().optional().nullable(),
  observationAndExamination: z.string().optional().nullable(),
  impression: z.string().optional().nullable(),
  plan: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  visitDate: z.preprocess(datePreprocess, z.date()),
});

export const VisitResponse = z.object({
  id: z.string(),
  createdAt: z.preprocess(isoPreprocess, z.string()),
  visitDate: z.preprocess(isoPreprocess, z.string()),
  doctorName: z.string(),
  presentingComplaint: z.string().nullable().optional(),
  historyOfPresentingComplaint: z.string().nullable().optional(),
  observationAndExamination: z.string().nullable().optional(),
  impression: z.string().nullable().optional(),
  plan: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  clientId: z.string(),
});

export type VisitCreateType = z.infer<typeof VisitCreate>;
export type VisitResponseType = z.infer<typeof VisitResponse>;
