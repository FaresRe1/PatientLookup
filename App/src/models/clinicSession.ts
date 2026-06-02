import { z } from "zod";

const datePreprocess = (v: unknown) => {
  if (typeof v === "string" && v) return new Date(v);
  if (v instanceof Date) return v;
  return v;
};

const isoPreprocess = (v: unknown) =>
  v instanceof Date ? v.toISOString() : v;

export const ClinicSessionCreate = z.object({
  clinicName:  z.string().min(1, "Clinic name is required"),
  location:    z.string().min(1, "Location is required"),
  date:        z.preprocess(datePreprocess, z.date()),
  startTime:   z.preprocess(datePreprocess, z.date()),
  endTime:     z.preprocess(datePreprocess, z.date()),
  dailyTarget: z.coerce.number().int().positive().default(50),
  isActive:    z.boolean().default(false),
});

export const ClinicSessionUpdate = ClinicSessionCreate.partial();

export const ClinicSessionResponse = z.object({
  id:          z.string(),
  createdAt:   z.preprocess(isoPreprocess, z.string()),
  updatedAt:   z.preprocess(isoPreprocess, z.string()),
  clinicName:  z.string(),
  location:    z.string(),
  date:        z.preprocess(isoPreprocess, z.string()),
  startTime:   z.preprocess(isoPreprocess, z.string()),
  endTime:     z.preprocess(isoPreprocess, z.string()),
  dailyTarget: z.number(),
  isActive:    z.boolean(),
  endedAt:     z.preprocess(isoPreprocess, z.string().nullable().optional()),
});

export type ClinicSessionCreateType = z.infer<typeof ClinicSessionCreate>;
export type ClinicSessionUpdateType = z.infer<typeof ClinicSessionUpdate>;
export type ClinicSessionResponseType = z.infer<typeof ClinicSessionResponse>;
