"use server";

import { revalidatePath } from "next/cache";

import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import {
  requireAdmin,
  requireCanDelete,
  requireCsrf,
  toActionError,
} from "@/lib/auth/access";
import { checkEnquiryRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { writeAudit } from "@/lib/db/audit";
import { adminGetEnquiryById } from "@/lib/db/admin-queries";
import { notifyEnquiryCreated, sendEnquiryClientAcknowledgement } from "@/lib/enquiry-notify";
import {
  enquiryDeleteSchema,
  enquiryMarkReadSchema,
  enquiryNotesUpdateSchema,
  enquirySchema,
  enquiryStatusUpdateSchema,
} from "@/lib/schemas/enquiry";
import { createPublicSupabaseClient } from "@/lib/supabase/public-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SubmitEnquiryResult =
  | { success: true }
  | { success: false; error: string };

function revalidateEnquiries(id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/enquiries");
  if (id) revalidatePath(`/admin/enquiries/${id}`);
}

export async function submitEnquiry(
  input: unknown,
): Promise<SubmitEnquiryResult> {
  const parsed = enquirySchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid form data";
    return { success: false, error: firstIssue };
  }

  if (parsed.data.website) {
    return { success: true };
  }

  const ip = (await getClientIp()) ?? "unknown";
  const rate = await checkEnquiryRateLimit(ip);
  if (!rate.allowed) {
    return {
      success: false,
      error: "Too many enquiries from this network. Please try again later.",
    };
  }

  const { name, email, phone, visa_interest, message, source_page } =
    parsed.data;

  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      name,
      email,
      phone: phone || null,
      visa_interest: visa_interest || null,
      message,
      source_page: source_page ?? "/contact",
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      error: "We could not submit your enquiry. Please try again shortly.",
    };
  }

  try {
    await notifyEnquiryCreated({
      id: data.id,
      name,
      email,
      phone: phone || null,
      visa_interest: visa_interest || null,
      message,
      source_page: source_page ?? "/contact",
    });
  } catch {
    // Notify is best-effort
  }

  try {
    await sendEnquiryClientAcknowledgement({ toEmail: email, name });
  } catch {
    // Client ack is best-effort
  }

  revalidateEnquiries(data.id);
  return { success: true };
}

export async function updateEnquiryStatusAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = enquiryStatusUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();

    const existing = await adminGetEnquiryById(parsed.data.id);
    if (!existing) {
      return actionFail("Enquiry not found");
    }

    if (existing.status === parsed.data.status) {
      return actionOk();
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("enquiries")
      .update({
        status: parsed.data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) throw error;

    await writeAudit({
      action: "update_status",
      actorAdminId: admin.id,
      targetTable: "enquiries",
      targetId: existing.id,
      beforeState: { status: existing.status },
      afterState: { status: parsed.data.status },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateEnquiries(existing.id);
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateEnquiryNotesAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = enquiryNotesUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    await requireAdmin();

    const existing = await adminGetEnquiryById(parsed.data.id);
    if (!existing) {
      return actionFail("Enquiry not found");
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("enquiries")
      .update({
        notes: parsed.data.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) throw error;

    revalidateEnquiries(existing.id);
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function deleteEnquiryAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = enquiryDeleteSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireCanDelete(admin);

    const existing = await adminGetEnquiryById(parsed.data.id);
    if (!existing) {
      return actionFail("Enquiry not found");
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("enquiries")
      .delete()
      .eq("id", parsed.data.id);

    if (error) throw error;

    await writeAudit({
      action: "delete",
      actorAdminId: admin.id,
      targetTable: "enquiries",
      targetId: existing.id,
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: null,
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateEnquiries();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

/** Marks an enquiry as read on first admin open. Idempotent when already set. */
export async function markEnquiryReadAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = enquiryMarkReadSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireAdmin();

    const existing = await adminGetEnquiryById(parsed.data.id);
    if (!existing) {
      return actionFail("Enquiry not found");
    }

    if (existing.read_at) {
      return actionOk();
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("enquiries")
      .update({
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id)
      .is("read_at", null);

    if (error) throw error;

    revalidateEnquiries(existing.id);
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
