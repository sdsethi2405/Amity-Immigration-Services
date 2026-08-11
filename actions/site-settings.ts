"use server";

import { revalidatePath } from "next/cache";

import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import {
  requireAdmin,
  requireAdminManagement,
  requireCsrf,
  toActionError,
} from "@/lib/auth/access";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { writeAudit } from "@/lib/db/audit";
import { getSiteSetting, type SiteSettingKey } from "@/lib/db/queries";
import {
  updateComplianceFooterSchema,
  updateContactDetailsSchema,
  updateEnquiryNotifySchema,
  updateEnquiryTemplatesSchema,
  updateFeeEstimateBandsSchema,
  updateGoogleReviewsEmbedSchema,
  updatePointsTableSchema,
  updateSlackWebhookSchema,
  updateSocialLinksSchema,
  updateWhatsappSchema,
} from "@/lib/schemas/site-settings";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidateSettings() {
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/services/points-calculator");
  revalidatePath("/services/fee-estimate");
}

async function upsertSiteSetting(
  key: SiteSettingKey,
  value: unknown,
  adminId: string,
): Promise<void> {
  const supabase = createServerSupabaseClient();
  const existing = await getSiteSetting(key);

  if (existing === null) {
    const { error } = await supabase.from("site_settings").insert({
      key,
      value,
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("site_settings")
    .update({
      value,
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    })
    .eq("key", key);

  if (error) throw error;
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateContactDetailsAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateContactDetailsSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const before = await getSiteSetting("contact_details");
    const value = {
      phone: emptyToNull(parsed.data.phone) ?? undefined,
      email: emptyToNull(parsed.data.email) ?? undefined,
      address: emptyToNull(parsed.data.address) ?? undefined,
      office_hours: emptyToNull(parsed.data.office_hours) ?? undefined,
    };

    await upsertSiteSetting("contact_details", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState: (before as Record<string, unknown> | null) ?? null,
      afterState: value as Record<string, unknown>,
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateSocialLinksAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateSocialLinksSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const before = await getSiteSetting("social_links");
    const value = {
      facebook: emptyToNull(parsed.data.facebook),
      linkedin: emptyToNull(parsed.data.linkedin),
      instagram: emptyToNull(parsed.data.instagram),
    };

    await upsertSiteSetting("social_links", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState: (before as Record<string, unknown> | null) ?? null,
      afterState: value as Record<string, unknown>,
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateComplianceFooterAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateComplianceFooterSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const before = await getSiteSetting("compliance_footer");
    const value = parsed.data.compliance_footer;

    await upsertSiteSetting("compliance_footer", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState:
        typeof before === "string"
          ? { value: before }
          : ((before as Record<string, unknown> | null) ?? null),
      afterState: { value },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateEnquiryNotifyAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateEnquiryNotifySchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const before = await getSiteSetting("enquiry_notify");
    const value = { email: emptyToNull(parsed.data.notify_email) };

    await upsertSiteSetting("enquiry_notify", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState: (before as Record<string, unknown> | null) ?? null,
      afterState: value as Record<string, unknown>,
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updatePointsTableAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updatePointsTableSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(
        parsed.error.issues[0]?.message ?? "Enter whole numbers only",
      );
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const value = parsed.data.points_table;

    const before = await getSiteSetting("points_table");
    await upsertSiteSetting("points_table", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState: (before as Record<string, unknown> | null) ?? {
        defaults: true,
      },
      afterState: value as Record<string, unknown>,
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateEnquiryTemplatesAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateEnquiryTemplatesSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const before = await getSiteSetting("enquiry_templates");
    const value = parsed.data.templates;

    await upsertSiteSetting("enquiry_templates", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState: Array.isArray(before)
        ? { templates: before }
        : ((before as Record<string, unknown> | null) ?? null),
      afterState: { templates: value },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateSlackWebhookAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateSlackWebhookSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const before = await getSiteSetting("slack_webhook_url");
    const value = emptyToNull(parsed.data.slack_webhook_url) ?? "";

    await upsertSiteSetting("slack_webhook_url", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState:
        typeof before === "string"
          ? { value: before }
          : ((before as Record<string, unknown> | null) ?? null),
      afterState: { value },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateWhatsappAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateWhatsappSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const before = await getSiteSetting("whatsapp_e164");
    const value = emptyToNull(parsed.data.whatsapp_e164) ?? "";

    await upsertSiteSetting("whatsapp_e164", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState:
        typeof before === "string"
          ? { value: before }
          : ((before as Record<string, unknown> | null) ?? null),
      afterState: { value },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateFeeEstimateBandsAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateFeeEstimateBandsSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const before = await getSiteSetting("fee_estimate_bands");
    const value = parsed.data.bands;

    await upsertSiteSetting("fee_estimate_bands", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState: Array.isArray(before)
        ? { bands: before }
        : ((before as Record<string, unknown> | null) ?? null),
      afterState: { bands: value },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateGoogleReviewsEmbedAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateGoogleReviewsEmbedSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireAdminManagement(admin);

    const before = await getSiteSetting("google_reviews_embed_url");
    const value = emptyToNull(parsed.data.google_reviews_embed_url) ?? "";

    await upsertSiteSetting("google_reviews_embed_url", value, admin.id);
    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "site_settings",
      beforeState:
        typeof before === "string"
          ? { value: before }
          : ((before as Record<string, unknown> | null) ?? null),
      afterState: { value },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateSettings();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
