import { z } from "zod";

export const AttachmentBase = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  createdAt: z.string(),
});

export const AttachmentResponse = AttachmentBase;

export type AttachmentType = z.infer<typeof AttachmentResponse>;
