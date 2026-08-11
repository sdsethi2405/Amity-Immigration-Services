"use server";

import { revalidatePath } from "next/cache";

import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import {
  requireAdmin,
  requireCsrf,
  requireRoleLevel,
  toActionError,
} from "@/lib/auth/access";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { writeAudit } from "@/lib/db/audit";
import { hashPassword } from "@/lib/portal/password";
import {
  createMatterSchema,
  updateMatterStatusSchema,
} from "@/lib/schemas/matters";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type DocumentChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function parseDocumentChecklist(value: unknown): DocumentChecklistItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (typeof row.label !== "string" || row.label.trim().length === 0) {
        return null;
      }
      return {
        id:
          typeof row.id === "string" && row.id.length > 0
            ? row.id
            : crypto.randomUUID(),
        label: row.label.trim(),
        required: row.required === true || row.required === undefined,
      };
    })
    .filter((item): item is DocumentChecklistItem => item !== null);
}

function revalidateMatters(id?: string) {
  revalidatePath("/admin/matters");
  revalidatePath("/portal");
  if (id) {
    revalidatePath(`/admin/matters/${id}`);
    revalidatePath(`/portal/matters/${id}`);
  }
}

/**
 * Create a matter (and optionally a new client). Admin+ required.
 * Seeds checklist items from the visa subclass document_checklist when linked.
 */
export async function createMatterAction(
  input: unknown,
): Promise<ActionResult<{ id: string; clientId: string }>> {
  try {
    const parsed = createMatterSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireRoleLevel(admin, ROLE_LEVEL.ADMIN);

    const supabase = createServerSupabaseClient();
    let clientId = emptyToNull(parsed.data.existing_client_id);

    if (!clientId) {
      const email = parsed.data.client_email!.trim().toLowerCase();
      const passwordHash = await hashPassword(parsed.data.client_password!);

      const { data: createdClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          email,
          full_name: parsed.data.client_full_name!.trim(),
          password_hash: passwordHash,
          is_active: true,
        })
        .select("id")
        .single();

      if (clientError) {
        if (clientError.code === "23505") {
          return actionFail("A client with this email already exists");
        }
        throw clientError;
      }

      clientId = createdClient.id;
    } else {
      const { data: existing, error: existingError } = await supabase
        .from("clients")
        .select("id")
        .eq("id", clientId)
        .maybeSingle();

      if (existingError) throw existingError;
      if (!existing) {
        return actionFail("Client not found");
      }
    }

    if (!clientId) {
      return actionFail("Client is required");
    }

    const resolvedClientId = clientId;

    const visaSubclassId = emptyToNull(parsed.data.visa_subclass_id);
    const enquiryId = emptyToNull(parsed.data.enquiry_id);

    const { data: matter, error: matterError } = await supabase
      .from("matters")
      .insert({
        client_id: resolvedClientId,
        title: parsed.data.title.trim(),
        status: parsed.data.status,
        notes: emptyToNull(parsed.data.notes),
        visa_subclass_id: visaSubclassId,
        enquiry_id: enquiryId,
        updated_by: admin.id,
      })
      .select("id")
      .single();

    if (matterError) throw matterError;

    if (visaSubclassId) {
      const { data: visa, error: visaError } = await supabase
        .from("visa_subclasses")
        .select("document_checklist")
        .eq("id", visaSubclassId)
        .maybeSingle();

      if (visaError) throw visaError;

      const checklist = parseDocumentChecklist(visa?.document_checklist);
      if (checklist.length > 0) {
        const rows = checklist.map((item, index) => ({
          matter_id: matter.id,
          label: item.label,
          is_required: item.required,
          is_complete: false,
          sort_order: index,
        }));

        const { error: seedError } = await supabase
          .from("matter_checklist_items")
          .insert(rows);

        if (seedError) throw seedError;
      }
    }

    await writeAudit({
      action: "create",
      actorAdminId: admin.id,
      targetTable: "matters",
      targetId: matter.id,
      beforeState: null,
      afterState: {
        title: parsed.data.title,
        client_id: resolvedClientId,
        status: parsed.data.status,
      },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateMatters(matter.id);
    return actionOk({ id: matter.id, clientId: resolvedClientId });
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateMatterStatusAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = updateMatterStatusSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireRoleLevel(admin, ROLE_LEVEL.ADMIN);

    const supabase = createServerSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from("matters")
      .select("id, status, client_id, title")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) {
      return actionFail("Matter not found");
    }

    if (existing.status === parsed.data.status) {
      return actionOk();
    }

    const { error } = await supabase
      .from("matters")
      .update({
        status: parsed.data.status,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) throw error;

    await writeAudit({
      action: "update_status",
      actorAdminId: admin.id,
      targetTable: "matters",
      targetId: existing.id,
      beforeState: { status: existing.status },
      afterState: { status: parsed.data.status },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateMatters(existing.id);
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
