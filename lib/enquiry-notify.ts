import { getSiteSetting } from "@/lib/db/queries";
import { getSiteUrl } from "@/lib/seo";

type EnquiryNotifyPayload = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  visa_interest: string | null;
  message: string;
  source_page: string | null;
};

/**
 * Optional Resend email when RESEND_API_KEY and notify_email are set.
 * Failures are swallowed by the caller — never block enquiry insert.
 */
export async function notifyEnquiryCreated(
  enquiry: EnquiryNotifyPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const notifySetting = await getSiteSetting("enquiry_notify");
  const notifyEmail =
    notifySetting &&
    typeof notifySetting === "object" &&
    "email" in notifySetting &&
    typeof (notifySetting as { email?: unknown }).email === "string"
      ? (notifySetting as { email: string }).email.trim()
      : "";

  if (!notifyEmail) return;

  const siteUrl = getSiteUrl();
  const adminUrl = `${siteUrl}/admin/enquiries/${enquiry.id}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.RESEND_FROM_EMAIL?.trim() ||
        "Amity Enquiries <onboarding@resend.dev>",
      to: [notifyEmail],
      subject: `New enquiry from ${enquiry.name}`,
      text: [
        `Name: ${enquiry.name}`,
        `Email: ${enquiry.email}`,
        `Phone: ${enquiry.phone ?? "—"}`,
        `Visa interest: ${enquiry.visa_interest ?? "—"}`,
        `Source: ${enquiry.source_page ?? "—"}`,
        "",
        enquiry.message,
        "",
        `Open in admin: ${adminUrl}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed (${response.status}): ${body.slice(0, 200)}`);
  }
}

export function isEnquiryEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
