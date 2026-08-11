import { z } from "zod";

export const portalLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(254)
    .email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(256, "Password is too long"),
});

export type PortalLoginInput = z.infer<typeof portalLoginSchema>;

export const portalLogoutSchema = z.object({
  csrfToken: z.string().min(1, "CSRF token is required"),
});

export type PortalLogoutInput = z.infer<typeof portalLogoutSchema>;

export const portalToggleChecklistSchema = z.object({
  csrfToken: z.string().min(1),
  itemId: z.string().uuid(),
  matterId: z.string().uuid(),
  isComplete: z.boolean(),
});

export type PortalToggleChecklistInput = z.infer<
  typeof portalToggleChecklistSchema
>;

export const portalUploadDocumentSchema = z.object({
  csrfToken: z.string().min(1),
  matterId: z.string().uuid(),
});

export type PortalUploadDocumentInput = z.infer<
  typeof portalUploadDocumentSchema
>;

export const ALLOWED_CLIENT_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_CLIENT_DOCUMENT_BYTES = 10 * 1024 * 1024;
