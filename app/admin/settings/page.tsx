import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  getComplianceFooter,
  getContactDetails,
  getSiteSetting,
  getSocialLinks,
} from "@/lib/db/queries";
import { isEnquiryEmailConfigured } from "@/lib/enquiry-notify";
import { getDefaultPointsTableJson, POINTS_TABLE } from "@/lib/points-table";

export const metadata: Metadata = {
  title: "Settings · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const csrfToken = await getCsrfTokenForForms();
  const canManageSite = admin.role.level >= ROLE_LEVEL.HEAD_ADMIN;

  let contact = null;
  let social = null;
  let complianceFooter = "";
  let notifyEmail = "";
  let pointsTableJson = getDefaultPointsTableJson();

  if (canManageSite) {
    const [contactDetails, socialLinks, footer, notify, points] =
      await Promise.all([
        getContactDetails(),
        getSocialLinks(),
        getComplianceFooter(),
        getSiteSetting("enquiry_notify"),
        getSiteSetting("points_table"),
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
    pointsTableJson =
      points && typeof points === "object"
        ? JSON.stringify(points, null, 2)
        : JSON.stringify(POINTS_TABLE, null, 2);
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
        <SiteSettingsForm
          csrfToken={csrfToken}
          contact={contact}
          social={social}
          complianceFooter={complianceFooter}
          notifyEmail={notifyEmail}
          pointsTableJson={pointsTableJson}
          resendConfigured={isEnquiryEmailConfigured()}
        />
      ) : null}
    </div>
  );
}
