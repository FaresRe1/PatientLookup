import { z } from "zod";
import type { ZodTypeAny } from "zod";

export function parseBody<T extends ZodTypeAny>(schema: T, body: unknown): { ok: true; data: z.infer<T> } | { ok: false; errors: any } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: parsed.error.format() };
  return { ok: true, data: parsed.data as z.infer<T> };
}
