import { z } from "zod";

import { contentBlockSchema } from "@/lib/schemas/content-blocks";

export const pageUpdateSchema = z.object({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  meta_title: z.string().trim().max(200).optional().nullable(),
  meta_description: z.string().trim().max(500).optional().nullable(),
  blocks: z.array(contentBlockSchema),
});

export type PageUpdateInput = z.infer<typeof pageUpdateSchema>;
