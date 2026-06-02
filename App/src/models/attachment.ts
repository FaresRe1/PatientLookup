import { z } from "zod";

export const AttachmentResponse = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  createdAt: z.string(),
});

export type AttachmentType = z.infer<typeof AttachmentResponse>;
