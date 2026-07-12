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
import { adminGetPostById } from "@/lib/db/admin-queries";
import {
  postCreateSchema,
  postDeleteSchema,
  postUpdateSchema,
} from "@/lib/schemas/posts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function revalidatePosts(slug?: string) {
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPostAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = postCreateSchema.safeParse(input);
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
      .from("posts")
      .insert({
        ...fields,
        published_at:
          fields.is_published && !fields.published_at
            ? new Date().toISOString()
            : fields.published_at ?? null,
        updated_by: admin.id,
      })
      .select("id")
      .single();

    if (error) throw error;

    revalidatePosts(fields.slug);
    return actionOk({ id: data.id });
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function updatePostAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = postUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);

    const existing = await adminGetPostById(parsed.data.id);
    if (!existing) {
      return actionFail("Post not found");
    }

    const admin = await requireTeamScopedMutation(existing.team_id);
    await requireTeamScopedMutation(parsed.data.team_id);

    if (parsed.data.is_published !== existing.is_published) {
      requireCanPublish(admin);
      await writeAudit({
        action: parsed.data.is_published ? "publish" : "unpublish",
        actorAdminId: admin.id,
        targetTable: "posts",
        targetId: existing.id,
        beforeState: existing as unknown as Record<string, unknown>,
        afterState: { is_published: parsed.data.is_published },
        ip: await getClientIp(),
        userAgent: await getUserAgent(),
      });
    }

    const { csrfToken: _csrf, id, ...fields } = parsed.data;
    const publishedAt =
      fields.is_published && !fields.published_at
        ? existing.published_at ?? new Date().toISOString()
        : fields.published_at ?? null;

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("posts")
      .update({
        ...fields,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
        updated_by: admin.id,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePosts(fields.slug);
    revalidatePath(`/admin/posts/${id}`);
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function deletePostAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = postDeleteSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);

    const existing = await adminGetPostById(parsed.data.id);
    if (!existing) {
      return actionFail("Post not found");
    }

    const admin = await requireTeamScopedMutation(existing.team_id);
    requireCanDelete(admin);

    await writeAudit({
      action: "delete",
      actorAdminId: admin.id,
      targetTable: "posts",
      targetId: existing.id,
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: null,
      ip: await getClientIp(),
      userAgent: await getUserAgent(),
    });

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", existing.id);

    if (error) throw error;

    revalidatePosts(existing.slug);
    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
