"use server";

import { enquirySchema } from "@/lib/schemas/enquiry";
import { createPublicSupabaseClient } from "@/lib/supabase/public-server";

export type SubmitEnquiryResult =
  | { success: true }
  | { success: false; error: string };

export async function submitEnquiry(
  input: unknown,
): Promise<SubmitEnquiryResult> {
  const parsed = enquirySchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid form data";
    return { success: false, error: firstIssue };
  }

  const { name, email, phone, visa_interest, message, source_page } =
    parsed.data;

  const supabase = createPublicSupabaseClient();

  const { error } = await supabase.from("enquiries").insert({
    name,
    email,
    phone: phone || null,
    visa_interest: visa_interest || null,
    message,
    source_page: source_page ?? "/contact",
    status: "new",
  });

  if (error) {
    return {
      success: false,
      error: "We could not submit your enquiry. Please try again shortly.",
    };
  }

  return { success: true };
}
