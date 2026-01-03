import { z } from "zod";

export const VisitBase = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  notes: z.string().optional().nullable(),
  visitDate: z.preprocess((v) => {
    if (typeof v === "string" && v) return new Date(v as string);
    if (v instanceof Date) return v;
    return v;
  }, z.date()),
  forms: z
    .array(
      z.object({
        templateId: z.string(),
        templateName: z.string(),
        answers: z.record(z.any()),
      })
    )
    .optional(),
});

export const VisitCreate = VisitBase;

export const VisitResponse = z.object({
  id: z.string(),
  createdAt: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string()),
  visitDate: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string()),
  doctorName: z.string(),
  notes: z.string().nullable().optional(),
  clientId: z.string(),
  forms: z
    .array(
      z.object({
        templateId: z.string(),
        templateName: z.string(),
        answers: z.record(z.any()),
      })
    )
    .optional(),
});

export type VisitCreateType = z.infer<typeof VisitCreate>;
export type VisitResponseType = z.infer<typeof VisitResponse>;
