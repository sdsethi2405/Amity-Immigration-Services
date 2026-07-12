import { z } from "zod";

import { contentBlockSchema } from "@/lib/schemas/content-blocks";

export const postFieldsSchema = z.object({
  title: z.string().trim().min(1).max(300),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a kebab-case slug"),
  excerpt: z.string().trim().max(1000).optional().nullable(),
  body: z.array(contentBlockSchema).default([]),
  cover_url: z.string().trim().max(2000).optional().nullable(),
  author_name: z.string().trim().max(120).optional().nullable(),
  published_at: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }),
  is_published: z.boolean().default(false),
  team_id: z.string().uuid(),
});

export const postCreateSchema = postFieldsSchema.extend({
  csrfToken: z.string().min(1),
});

export const postUpdateSchema = postFieldsSchema.extend({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
});

export const postDeleteSchema = z.object({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type PostDeleteInput = z.infer<typeof postDeleteSchema>;
