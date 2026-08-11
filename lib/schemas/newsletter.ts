import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(254)
    .email("Enter a valid email"),
  locale: z.enum(["en", "zh"]).default("en"),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
