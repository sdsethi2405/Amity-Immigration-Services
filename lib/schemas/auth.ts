import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(64, "Username is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(256, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const logoutSchema = z.object({
  csrfToken: z.string().min(1, "CSRF token is required"),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

export const changePasswordSchema = z
  .object({
    csrfToken: z.string().min(1, "CSRF token is required"),
    currentPassword: z.string().min(1, "Current password is required").max(256),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters")
      .max(256, "Password is too long"),
    confirmPassword: z.string().min(1, "Confirm your new password").max(256),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from the current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
