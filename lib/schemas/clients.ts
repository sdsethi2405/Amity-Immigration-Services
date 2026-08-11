import { z } from "zod";

export const createClientSchema = z.object({
  csrfToken: z.string().min(1),
  email: z.string().trim().email("Enter a valid email").max(254),
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(120, "Full name is too long"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(256, "Password is too long"),
});

export const setClientActiveSchema = z.object({
  csrfToken: z.string().min(1),
  id: z.string().uuid(),
  is_active: z.boolean(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type SetClientActiveInput = z.infer<typeof setClientActiveSchema>;
