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
  createClientSchema,
  setClientActiveSchema,
} from "@/lib/schemas/clients";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidateClients() {
  revalidatePath("/admin/users");
  revalidatePath("/admin/matters");
}

export async function createClientAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = createClientSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireRoleLevel(admin, ROLE_LEVEL.ADMIN);

    const email = parsed.data.email.trim().toLowerCase();
    const passwordHash = await hashPassword(parsed.data.password);
    const supabase = createServerSupabaseClient();

    const { data: created, error } = await supabase
      .from("clients")
      .insert({
        email,
        full_name: parsed.data.full_name.trim(),
        password_hash: passwordHash,
        is_active: true,
      })
      .select("id, email, full_name, is_active")
      .single();

    if (error) {
      if (error.code === "23505") {
        return actionFail("A client with this email already exists");
      }
      throw error;
    }

    await writeAudit({
      action: "create",
      actorAdminId: admin.id,
      targetTable: "clients",
      targetId: created.id,
      beforeState: null,
      afterState: {
        id: created.id,
        email: created.email,
        full_name: created.full_name,
        is_active: created.is_active,
      },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateClients();
    return actionOk({ id: created.id });
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function setClientActiveAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = setClientActiveSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireRoleLevel(admin, ROLE_LEVEL.ADMIN);

    const supabase = createServerSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from("clients")
      .select("id, email, full_name, is_active")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) {
      return actionFail("Client not found");
    }

    if (existing.is_active === parsed.data.is_active) {
      return actionOk();
    }

    const { error } = await supabase
      .from("clients")
      .update({
        is_active: parsed.data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) throw error;

    await writeAudit({
      action: "update",
      actorAdminId: admin.id,
      targetTable: "clients",
      targetId: existing.id,
      beforeState: { is_active: existing.is_active },
      afterState: { is_active: parsed.data.is_active },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateClients();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
