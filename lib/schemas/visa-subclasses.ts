import { z } from "zod";

import { contentBlockSchema } from "@/lib/schemas/content-blocks";

const streamEnum = z.enum([
  "skilled",
  "employer",
  "family",
  "student",
  "business",
  "visitor",
  "humanitarian",
  "bridging",
  "other",
]);

export const visaSubclassFieldsSchema = z.object({
  subclass_number: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a kebab-case slug"),
  stream: streamEnum,
  visa_type: z.enum(["temporary", "permanent"]),
  pr_pathway: z.boolean().default(false),
  status: z.enum(["active", "closing", "closed", "replaced"]).default("active"),
  eligibility_summary: z.string().trim().max(2000).optional().nullable(),
  body: z.array(contentBlockSchema).default([]),
  processing_context: z.string().trim().max(2000).optional().nullable(),
  sort_order: z.coerce.number().int().min(0).max(10_000).default(0),
  is_published: z.boolean().default(false),
  team_id: z.string().uuid(),
});

export const visaSubclassCreateSchema = visaSubclassFieldsSchema.extend({
  csrfToken: z.string().min(1),
});

export const visaSubclassUpdateSchema = visaSubclassFieldsSchema.extend({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
});

export const visaSubclassDeleteSchema = z.object({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
});

export type VisaSubclassCreateInput = z.infer<typeof visaSubclassCreateSchema>;
export type VisaSubclassUpdateInput = z.infer<typeof visaSubclassUpdateSchema>;
export type VisaSubclassDeleteInput = z.infer<typeof visaSubclassDeleteSchema>;
