"use server";

import { revalidatePath } from "next/cache";

import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import {
  AuthError,
  requireAdmin,
  requireAdminManagement,
  requireCsrf,
  toActionError,
} from "@/lib/auth/access";
import { hashPassword } from "@/lib/auth/password";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { writeAudit } from "@/lib/db/audit";
import { adminGetAdminById } from "@/lib/db/admin-queries";
import {
  createAdminSchema,
  setAdminActiveSchema,
} from "@/lib/schemas/admins";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidateAdmins() {
  revalidatePath("/admin/settings");
}

export async function createAdminAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = createAdminSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const actor = await requireAdmin();
    requireAdminManagement(actor);

    const teamId =
      parsed.data.teamId && parsed.data.teamId.length > 0
        ? parsed.data.teamId
        : null;

    const supabase = createServerSupabaseClient();

    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id, scope")
      .eq("id", parsed.data.roleId)
      .maybeSingle();

    if (roleError) throw roleError;
    if (!role) {
      return actionFail("Role not found");
    }

    if (role.scope === "team" && !teamId) {
      return actionFail("Team is required for team-scoped roles");
    }

    if (role.scope === "global" && teamId) {
      return actionFail("Global roles cannot be assigned a team");
    }

    if (teamId) {
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("id", teamId)
        .maybeSingle();

      if (teamError) throw teamError;
      if (!team) {
        return actionFail("Team not found");
      }
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const { data: created, error: insertError } = await supabase
      .from("admins")
      .insert({
        username: parsed.data.username,
        password_hash: passwordHash,
        role_id: parsed.data.roleId,
        team_id: teamId,
        is_active: true,
      })
      .select("id, username, role_id, team_id, is_active")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return actionFail("Username already exists");
      }
      throw insertError;
    }

    await writeAudit({
      action: "create",
      actorAdminId: actor.id,
      targetTable: "admins",
      targetId: created.id,
      beforeState: null,
      afterState: {
        id: created.id,
        username: created.username,
        role_id: created.role_id,
        team_id: created.team_id,
        is_active: created.is_active,
      },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateAdmins();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function setAdminActiveAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = setAdminActiveSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const actor = await requireAdmin();
    requireAdminManagement(actor);

    if (parsed.data.id === actor.id && !parsed.data.is_active) {
      throw new AuthError("You cannot deactivate your own account");
    }

    const existing = await adminGetAdminById(parsed.data.id);
    if (!existing) {
      return actionFail("Admin not found");
    }

    if (existing.is_active === parsed.data.is_active) {
      return actionOk();
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("admins")
      .update({ is_active: parsed.data.is_active })
      .eq("id", parsed.data.id);

    if (error) throw error;

    await writeAudit({
      action: "update",
      actorAdminId: actor.id,
      targetTable: "admins",
      targetId: existing.id,
      beforeState: { is_active: existing.is_active },
      afterState: { is_active: parsed.data.is_active },
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    revalidateAdmins();
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
