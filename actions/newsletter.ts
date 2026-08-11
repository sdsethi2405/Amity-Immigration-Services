"use server";

import { revalidatePath } from "next/cache";

import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import { newsletterSubscribeSchema } from "@/lib/schemas/newsletter";
import { createPublicSupabaseClient } from "@/lib/supabase/public-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type NewsletterSubscribeResult =
  | { success: true }
  | { success: false; error: string };

export async function subscribeNewsletterAction(
  input: unknown,
): Promise<NewsletterSubscribeResult> {
  const parsed = newsletterSubscribeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  if (parsed.data.website) {
    return { success: true };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const supabase = createPublicSupabaseClient();

  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
    locale: parsed.data.locale,
    is_confirmed: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true };
    }
    return {
      success: false,
      error: "We could not subscribe you right now. Please try again shortly.",
    };
  }

  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function listNewsletterSubscribersAction(): Promise<
  ActionResult<
    Array<{
      id: string;
      email: string;
      locale: string;
      created_at: string;
    }>
  >
> {
  try {
    const { requireAdmin } = await import("@/lib/auth/access");
    await requireAdmin();

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, locale, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    return actionOk(data ?? []);
  } catch (error) {
    const { toActionError } = await import("@/lib/auth/access");
    return actionFail(toActionError(error));
  }
}
