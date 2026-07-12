import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address").max(254),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  visa_interest: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(5000),
  source_page: z.string().trim().max(200).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
