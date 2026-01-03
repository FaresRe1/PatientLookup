import { z } from "zod";

export const ClientBase = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dob: z.preprocess((v) => {
    if (typeof v === "string" && v) return new Date(v as string);
    if (v instanceof Date) return v;
    return v;
  }, z.date()),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal('')),
  phoneNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const ClientCreate = ClientBase; // same shape for create in this app

export const ClientResponse = z.object({
  id: z.string(),
  createdAt: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string()),
  updatedAt: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string()),
  fullName: z.string(),
  gender: z.string(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  dob: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string()),
  revision: z.number().optional(),
  deletedAt: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.any().nullable().optional()),
  lastModified: z.preprocess((v) => (v instanceof Date ? v.toISOString() : v), z.string()),
});

export type ClientCreateType = z.infer<typeof ClientCreate>;
export type ClientResponseType = z.infer<typeof ClientResponse>;

// JSON-friendly client shape used by client-side code (dates are strings)
export type ClientJSONType = ClientResponseType;
