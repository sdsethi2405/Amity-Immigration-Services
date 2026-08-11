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

function formatEnquiryText(enquiry: EnquiryNotifyPayload, adminUrl: string): string {
  return [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone ?? "—"}`,
    `Visa interest: ${enquiry.visa_interest ?? "—"}`,
    `Source: ${enquiry.source_page ?? "—"}`,
    "",
    enquiry.message,
    "",
    `Open in admin: ${adminUrl}`,
  ].join("\n");
}

async function notifyEnquiryEmail(
  enquiry: EnquiryNotifyPayload,
  adminUrl: string,
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
      text: formatEnquiryText(enquiry, adminUrl),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed (${response.status}): ${body.slice(0, 200)}`);
  }
}

async function notifyEnquirySlack(
  enquiry: EnquiryNotifyPayload,
  adminUrl: string,
): Promise<void> {
  const setting = await getSiteSetting("slack_webhook_url");
  const webhookUrl =
    typeof setting === "string"
      ? setting.trim()
      : setting &&
          typeof setting === "object" &&
          "url" in setting &&
          typeof (setting as { url?: unknown }).url === "string"
        ? (setting as { url: string }).url.trim()
        : "";

  if (!webhookUrl) return;

  const text = [
    `*New enquiry from ${enquiry.name}*`,
    formatEnquiryText(enquiry, adminUrl),
  ].join("\n");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack webhook failed (${response.status}): ${body.slice(0, 200)}`);
  }
}

/**
 * Optional Resend email + Slack webhook when configured in site_settings / env.
 * Failures are swallowed by the caller — never block enquiry insert.
 */
export async function notifyEnquiryCreated(
  enquiry: EnquiryNotifyPayload,
): Promise<void> {
  const siteUrl = getSiteUrl();
  const adminUrl = `${siteUrl}/admin/enquiries/${enquiry.id}`;

  const results = await Promise.allSettled([
    notifyEnquiryEmail(enquiry, adminUrl),
    notifyEnquirySlack(enquiry, adminUrl),
  ]);

  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

  if (failures.length > 0) {
    const messages = failures.map((failure) =>
      failure.reason instanceof Error
        ? failure.reason.message
        : String(failure.reason),
    );
    throw new Error(messages.join("; "));
  }
}

/**
 * Best-effort acknowledgement email to the enquirer when Resend is configured.
 */
export async function sendEnquiryClientAcknowledgement(options: {
  toEmail: string;
  name: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Amity Immigration Services <onboarding@resend.dev>";

  const firstName = options.name.trim().split(/\s+/)[0] || "there";
  const text = [
    `Hello ${firstName},`,
    "",
    "Thank you for contacting Amity Immigration Services. We have received your enquiry and will respond as soon as we can.",
    "",
    "This acknowledgement confirms receipt only. It is not migration advice and does not create a client relationship.",
    "",
    "Amity Immigration Services is a registered migration agent (MARN 964861), not a law firm.",
    "",
    "Kind regards,",
    "Amity Immigration Services",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [options.toEmail],
      subject: "We received your enquiry — Amity Immigration Services",
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Resend ack failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }

  return true;
}

export function isEnquiryEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
