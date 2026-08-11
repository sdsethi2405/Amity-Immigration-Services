import { z } from "zod";

export const updateContactDetailsSchema = z.object({
  csrfToken: z.string().min(1),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(254)
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      "Enter a valid email",
    ),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  office_hours: z.string().trim().max(200).optional().or(z.literal("")),
});

export const updateSocialLinksSchema = z.object({
  csrfToken: z.string().min(1),
  facebook: z.string().trim().max(500).optional().or(z.literal("")),
  linkedin: z.string().trim().max(500).optional().or(z.literal("")),
  instagram: z.string().trim().max(500).optional().or(z.literal("")),
});

export const updateComplianceFooterSchema = z.object({
  csrfToken: z.string().min(1),
  compliance_footer: z.string().trim().min(1).max(2000),
});

export const updateEnquiryNotifySchema = z.object({
  csrfToken: z.string().min(1),
  notify_email: z
    .string()
    .trim()
    .max(254)
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Enter a valid email or leave blank",
    ),
});

export const updatePointsTableSchema = z.object({
  csrfToken: z.string().min(1),
  points_table_json: z.string().trim().min(2).max(50_000),
});
