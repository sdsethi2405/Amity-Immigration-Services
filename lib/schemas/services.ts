import { z } from "zod";

import { contentBlockSchema } from "@/lib/schemas/content-blocks";

export const serviceFieldsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a kebab-case slug"),
  summary: z.string().trim().max(500).optional().nullable(),
  body: z.array(contentBlockSchema).default([]),
  icon: z.string().trim().max(80).optional().nullable(),
  sort_order: z.coerce.number().int().min(0).max(10_000).default(0),
  is_published: z.boolean().default(false),
  team_id: z.string().uuid(),
});

export const serviceCreateSchema = serviceFieldsSchema.extend({
  csrfToken: z.string().min(1),
});

export const serviceUpdateSchema = serviceFieldsSchema.extend({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
});

export const serviceDeleteSchema = z.object({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type ServiceDeleteInput = z.infer<typeof serviceDeleteSchema>;
