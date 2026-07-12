"use server";

import { revalidatePath } from "next/cache";

import {
  requireCanDelete,
  requireCanPublish,
  requireCsrf,
  requireTeamScopedMutation,
  toActionError,
} from "@/lib/auth/access";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import { writeAudit } from "@/lib/db/audit";
import { adminGetServiceById } from "@/lib/db/admin-queries";
import {
  serviceCreateSchema,
  serviceDeleteSchema,
  serviceUpdateSchema,
} from "@/lib/schemas/services";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidateServices() {
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

export async function createServiceAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = serviceCreateSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireTeamScopedMutation(parsed.data.team_id);

    if (parsed.data.is_published) {
      requireCanPublish(admin);
    }

    const { csrfToken: _csrf, ...fields } = parsed.data;
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("services")
      .insert({
        ...fields,
        updated_by: admin.id,
      })
      .select("id")
      .single();

    if (error) throw error;

    revalidateServices();
    return actionOk({ id: data.id });
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updateServiceAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = serviceUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);

    const existing = await adminGetServiceById(parsed.data.id);
    if (!existing) {
      return actionFail("Service not found");
    }

    const admin = await requireTeamScopedMutation(existing.team_id);
    await requireTeamScopedMutation(parsed.data.team_id);

    if (parsed.data.is_published !== existing.is_published) {
      requireCanPublish(admin);

      await writeAudit({
        action: parsed.data.is_published ? "publish" : "unpublish",
        actorAdminId: admin.id,
        targetTable: "services",
        targetId: existing.id,
        beforeState: existing as unknown as Record<string, unknown>,
        afterState: { is_published: parsed.data.is_published },
        ip: await getClientIp(),
        userAgent: await getUserAgent(),
      });
    }

    const { csrfToken: _csrf, id, ...fields } = parsed.data;
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("services")
      .update({
        ...fields,
        updated_at: new Date().toISOString(),
        updated_by: admin.id,
      })
      .eq("id", id);

    if (error) throw error;

    revalidateServices();
    revalidatePath(`/admin/services/${id}`);
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function deleteServiceAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = serviceDeleteSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);

    const existing = await adminGetServiceById(parsed.data.id);
    if (!existing) {
      return actionFail("Service not found");
    }

    const admin = await requireTeamScopedMutation(existing.team_id);
    requireCanDelete(admin);

    await writeAudit({
      action: "delete",
      actorAdminId: admin.id,
      targetTable: "services",
      targetId: existing.id,
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: null,
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", existing.id);

    if (error) throw error;

    revalidateServices();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
