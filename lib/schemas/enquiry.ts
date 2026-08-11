import { z } from "zod";

export const enquiryStatusSchema = z.enum(["new", "in_progress", "closed"]);

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address").max(254),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  visa_interest: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(5000),
  source_page: z.string().trim().max(200).optional(),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export const enquiryStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: enquiryStatusSchema,
  csrfToken: z.string().min(1),
});

export const enquiryNotesUpdateSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(10_000),
  csrfToken: z.string().min(1),
});

export const enquiryDeleteSchema = z.object({
  id: z.string().uuid(),
  csrfToken: z.string().min(1),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type EnquiryStatus = z.infer<typeof enquiryStatusSchema>;
