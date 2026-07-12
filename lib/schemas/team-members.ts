import { z } from "zod";

export const teamMemberFieldsSchema = z.object({
  name: z.string().trim().min(1).max(160),
  role_title: z.string().trim().max(160).optional().nullable(),
  bio: z.string().trim().max(4000).optional().nullable(),
  photo_url: z.string().trim().max(2000).optional().nullable(),
  sort_order: z.coerce.number().int().min(0).max(10_000).default(0),
  is_published: z.boolean().default(false),
  team_id: z.string().uuid(),
});

export const teamMemberCreateSchema = teamMemberFieldsSchema.extend({
  csrfToken: z.string().min(1),
});

export const teamMemberUpdateSchema = teamMemberFieldsSchema.extend({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
});

export const teamMemberDeleteSchema = z.object({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
});

export type TeamMemberCreateInput = z.infer<typeof teamMemberCreateSchema>;
export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;
export type TeamMemberDeleteInput = z.infer<typeof teamMemberDeleteSchema>;
