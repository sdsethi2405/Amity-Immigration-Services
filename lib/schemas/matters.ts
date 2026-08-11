import { z } from "zod";

export const matterStatusSchema = z.enum(["open", "in_progress", "closed"]);

export type MatterStatus = z.infer<typeof matterStatusSchema>;

export const createMatterSchema = z
  .object({
    csrfToken: z.string().min(1),
    title: z.string().trim().min(1, "Title is required").max(200),
    status: matterStatusSchema.default("open"),
    notes: z.string().trim().max(5000).optional().or(z.literal("")),
    visa_subclass_id: z
      .string()
      .uuid()
      .optional()
      .nullable()
      .or(z.literal("")),
    enquiry_id: z.string().uuid().optional().nullable().or(z.literal("")),
    /** Use an existing client when set. */
    existing_client_id: z
      .string()
      .uuid()
      .optional()
      .nullable()
      .or(z.literal("")),
    /** New client fields — required when existing_client_id is empty. */
    client_email: z
      .string()
      .trim()
      .max(254)
      .optional()
      .or(z.literal("")),
    client_full_name: z.string().trim().max(200).optional().or(z.literal("")),
    client_password: z.string().max(256).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasExisting =
      typeof data.existing_client_id === "string" &&
      data.existing_client_id.length > 0;

    if (hasExisting) return;

    if (!data.client_email || !z.string().email().safeParse(data.client_email).success) {
      ctx.addIssue({
        code: "custom",
        message: "Client email is required",
        path: ["client_email"],
      });
    }

    if (!data.client_full_name || data.client_full_name.trim().length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Client name is required",
        path: ["client_full_name"],
      });
    }

    if (!data.client_password || data.client_password.length < 12) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 12 characters",
        path: ["client_password"],
      });
    }
  });

export type CreateMatterInput = z.infer<typeof createMatterSchema>;

export const updateMatterStatusSchema = z.object({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
  status: matterStatusSchema,
});

export type UpdateMatterStatusInput = z.infer<typeof updateMatterStatusSchema>;
