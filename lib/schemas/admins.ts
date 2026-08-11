import { z } from "zod";

export const createAdminSchema = z.object({
  csrfToken: z.string().min(1),
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(64, "Username is too long"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(256, "Password is too long"),
  roleId: z.string().uuid("Select a role"),
  teamId: z.union([z.string().uuid(), z.literal(""), z.null()]).optional(),
});

export const setAdminActiveSchema = z.object({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
  is_active: z.boolean(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type SetAdminActiveInput = z.infer<typeof setAdminActiveSchema>;
