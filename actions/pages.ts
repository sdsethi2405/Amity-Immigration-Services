"use server";

import { revalidatePath } from "next/cache";

import {
  requireCsrf,
  requireTeamScopedMutation,
  toActionError,
} from "@/lib/auth/access";
import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import { adminGetPageById } from "@/lib/db/admin-queries";
import { pageUpdateSchema } from "@/lib/schemas/pages";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updatePageAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = pageUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);

    const existing = await adminGetPageById(parsed.data.id);
    if (!existing) {
      return actionFail("Page not found");
    }

    const admin = await requireTeamScopedMutation(existing.team_id);

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("pages")
      .update({
        title: parsed.data.title,
        meta_title: parsed.data.meta_title ?? null,
        meta_description: parsed.data.meta_description ?? null,
        blocks: parsed.data.blocks,
        updated_at: new Date().toISOString(),
        updated_by: admin.id,
      })
      .eq("id", existing.id);

    if (error) throw error;

    revalidatePath("/admin/pages");
    revalidatePath(`/admin/pages/${existing.id}`);
    if (existing.slug === "home") {
      revalidatePath("/");
    } else if (["privacy", "terms"].includes(existing.slug)) {
      revalidatePath(`/legal/${existing.slug}`);
    } else {
      revalidatePath(`/${existing.slug}`);
    }

    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
