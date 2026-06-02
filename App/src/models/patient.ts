import { z } from "zod";

const datePreprocess = (v: unknown) => {
  if (typeof v === "string" && v) return new Date(v);
  if (v instanceof Date) return v;
  return v;
};

const isoPreprocess = (v: unknown) =>
  v instanceof Date ? v.toISOString() : v;

export const PatientCreate = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dob: z.preprocess(datePreprocess, z.date()),
  gender: z.string().min(1, "Gender is required"),
  phoneNumber: z.string().optional().nullable(),
  village: z.string().optional().nullable(),
  profileImage: z.instanceof(Uint8Array).optional(),
});

export const PatientResponse = z.object({
  id: z.string(),
  createdAt: z.preprocess(isoPreprocess, z.string()),
  updatedAt: z.preprocess(isoPreprocess, z.string()),
  fullName: z.string(),
  gender: z.string(),
  phoneNumber: z.string().nullable().optional(),
  village: z.string().nullable().optional(),
  dob: z.preprocess(isoPreprocess, z.string()),
  profileImage: z.string().optional().nullable(),
  revision: z.number().optional(),
  deletedAt: z.preprocess(isoPreprocess, z.any().nullable().optional()),
  lastModified: z.preprocess(isoPreprocess, z.string()),
});

export type PatientCreateType = z.infer<typeof PatientCreate>;
export type PatientResponseType = z.infer<typeof PatientResponse>;

/** JSON-friendly shape used by client-side code (dates are ISO strings). */
export type PatientJSON = PatientResponseType;
