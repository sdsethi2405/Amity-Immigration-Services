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

export const enquiryTemplateSchema = z.object({
  id: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1, "Template name is required").max(80),
  body: z.string().trim().min(1, "Template body is required").max(5000),
});

export const updateEnquiryTemplatesSchema = z.object({
  csrfToken: z.string().min(1),
  templates: z
    .array(enquiryTemplateSchema)
    .max(20, "At most 20 templates allowed"),
});

export const updateSlackWebhookSchema = z.object({
  csrfToken: z.string().min(1),
  slack_webhook_url: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) =>
        value === "" ||
        z.string().url().safeParse(value).success,
      "Enter a valid webhook URL or leave blank",
    ),
});

export const updateWhatsappSchema = z.object({
  csrfToken: z.string().min(1),
  whatsapp_e164: z
    .string()
    .trim()
    .max(20)
    .refine(
      (value) => value === "" || /^\+?[0-9\s-]{8,20}$/.test(value),
      "Enter a WhatsApp number in international format or leave blank",
    ),
});

export const feeEstimateBandSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(120),
  amountAud: z.coerce.number().min(0).max(1_000_000),
});

export const updateFeeEstimateBandsSchema = z.object({
  csrfToken: z.string().min(1),
  bands: z.array(feeEstimateBandSchema).max(20),
});

export const updateGoogleReviewsEmbedSchema = z.object({
  csrfToken: z.string().min(1),
  google_reviews_embed_url: z
    .string()
    .trim()
    .max(2000)
    .refine(
      (value) =>
        value === "" || z.string().url().safeParse(value).success,
      "Enter a valid embed URL or leave blank",
    ),
});

const nonNegInt = z.number().int().min(0).max(200);

export const updatePointsTableSchema = z.object({
  csrfToken: z.string().min(1),
  points_table: z.object({
    age: z.object({
      "18-24": nonNegInt,
      "25-32": nonNegInt,
      "33-39": nonNegInt,
      "40-44": nonNegInt,
      "45+": nonNegInt,
    }),
    english: z.object({
      competent: nonNegInt,
      proficient: nonNegInt,
      superior: nonNegInt,
    }),
    overseasEmployment: z.object({
      "<3": nonNegInt,
      "3-4": nonNegInt,
      "5-7": nonNegInt,
      "8-10": nonNegInt,
    }),
    australianEmployment: z.object({
      "<1": nonNegInt,
      "1-2": nonNegInt,
      "3-4": nonNegInt,
      "5-7": nonNegInt,
      "8-10": nonNegInt,
    }),
    employmentCap: nonNegInt,
    education: z.object({
      none: nonNegInt,
      doctorate: nonNegInt,
      bachelorOrMasters: nonNegInt,
      diplomaOrTrade: nonNegInt,
    }),
    australianStudy: nonNegInt,
    specialistEducation: nonNegInt,
    communityLanguage: nonNegInt,
    professionalYear: nonNegInt,
    regionalStudy: nonNegInt,
    partner: z.object({
      none: nonNegInt,
      skilledPartner: nonNegInt,
      competentEnglish: nonNegInt,
      singleOrCitizenPr: nonNegInt,
    }),
    nomination: z.object({
      none: nonNegInt,
      state190: nonNegInt,
      regional491: nonNegInt,
    }),
    eoiMinimum: nonNegInt,
  }),
});
