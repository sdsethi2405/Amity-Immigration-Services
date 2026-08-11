import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminsManagement } from "@/components/admin/admins-management";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import {
  SiteSettingsForm,
  type EnquiryTemplateRow,
} from "@/components/admin/site-settings-form";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  adminListAdmins,
  adminListRoles,
  adminListTeams,
} from "@/lib/db/admin-queries";
import {
  getComplianceFooter,
  getContactDetails,
  getFeeEstimateBands,
  getGoogleReviewsEmbedUrl,
  getSiteSetting,
  getSocialLinks,
  getWhatsappE164,
} from "@/lib/db/queries";
import { isEnquiryEmailConfigured } from "@/lib/enquiry-notify";
import {
  parsePointsTable,
  POINTS_TABLE,
  type PointsTable,
} from "@/lib/points-table";

export const metadata: Metadata = {
  title: "Settings · Admin",
  robots: { index: false, follow: false },
};

function parseEnquiryTemplates(value: unknown): EnquiryTemplateRow[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (
        typeof row.id !== "string" ||
        typeof row.name !== "string" ||
        typeof row.body !== "string"
      ) {
        return null;
      }
      return { id: row.id, name: row.name, body: row.body };
    })
    .filter((row): row is EnquiryTemplateRow => row !== null)
    .slice(0, 20);
}

function parseSlackWebhook(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "url" in value &&
    typeof (value as { url: unknown }).url === "string"
  ) {
    return (value as { url: string }).url;
  }
  return "";
}

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const csrfToken = await getCsrfTokenForForms();
  const canManageSite = admin.role.level >= ROLE_LEVEL.HEAD_ADMIN;

  let contact = null;
  let social = null;
  let complianceFooter = "";
  let notifyEmail = "";
  let pointsTable: PointsTable = { ...POINTS_TABLE };
  let enquiryTemplates: EnquiryTemplateRow[] = [];
  let slackWebhookUrl = "";
  let whatsappE164 = "";
  let feeEstimateBands: Awaited<ReturnType<typeof getFeeEstimateBands>> = [];
  let googleReviewsEmbedUrl = "";
  let adminsList: Awaited<ReturnType<typeof adminListAdmins>> = [];
  let rolesList: Awaited<ReturnType<typeof adminListRoles>> = [];
  let teamsList: Awaited<ReturnType<typeof adminListTeams>> = [];

  if (canManageSite) {
    const [
      contactDetails,
      socialLinks,
      footer,
      notify,
      points,
      templates,
      slack,
      whatsapp,
      feeBands,
      reviewsUrl,
      admins,
      roles,
      teams,
    ] = await Promise.all([
      getContactDetails(),
      getSocialLinks(),
      getComplianceFooter(),
      getSiteSetting("enquiry_notify"),
      getSiteSetting("points_table"),
      getSiteSetting("enquiry_templates"),
      getSiteSetting("slack_webhook_url"),
      getWhatsappE164(),
      getFeeEstimateBands(),
      getGoogleReviewsEmbedUrl(),
      adminListAdmins(),
      adminListRoles(),
      adminListTeams(),
    ]);

    contact = contactDetails;
    social = socialLinks;
    complianceFooter = footer;
    if (
      notify &&
      typeof notify === "object" &&
      notify !== null &&
      "email" in notify &&
      typeof (notify as { email: unknown }).email === "string"
    ) {
      notifyEmail = (notify as { email: string }).email ?? "";
    }
    pointsTable = parsePointsTable(points) ?? { ...POINTS_TABLE };
    enquiryTemplates = parseEnquiryTemplates(templates);
    slackWebhookUrl = parseSlackWebhook(slack);
    whatsappE164 = whatsapp ?? "";
    feeEstimateBands = feeBands;
    googleReviewsEmbedUrl = reviewsUrl ?? "";
    adminsList = admins;
    rolesList = roles;
    teamsList = teams;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Account security
          {canManageSite ? " and site-wide configuration" : ""}.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h2 className="font-heading text-xl font-semibold">Change password</h2>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{admin.username}</span>.
        </p>
        <ChangePasswordForm csrfToken={csrfToken} />
      </section>

      {canManageSite ? (
        <>
          <SiteSettingsForm
            csrfToken={csrfToken}
            contact={contact}
            social={social}
            complianceFooter={complianceFooter}
            notifyEmail={notifyEmail}
            pointsTable={pointsTable}
            resendConfigured={isEnquiryEmailConfigured()}
            enquiryTemplates={enquiryTemplates}
            slackWebhookUrl={slackWebhookUrl}
            whatsappE164={whatsappE164}
            feeEstimateBands={feeEstimateBands}
            googleReviewsEmbedUrl={googleReviewsEmbedUrl}
          />
          <AdminsManagement
            csrfToken={csrfToken}
            currentAdminId={admin.id}
            admins={adminsList}
            roles={rolesList}
            teams={teamsList}
          />
        </>
      ) : null}
    </div>
  );
}
