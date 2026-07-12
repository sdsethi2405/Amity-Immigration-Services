import { createServerSupabaseClient } from "@/lib/supabase/server";

export type WriteAuditInput = {
  action: string;
  actorAdminId: string | null;
  targetTable: string;
  targetId?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Append an immutable audit log entry. Stage 7 destructive actions call this.
 */
export async function writeAudit({
  action,
  actorAdminId,
  targetTable,
  targetId = null,
  beforeState = null,
  afterState = null,
  ip = null,
  userAgent = null,
}: WriteAuditInput): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("audit_log").insert({
    action,
    actor_admin_id: actorAdminId,
    target_table: targetTable,
    target_id: targetId,
    before_state: beforeState,
    after_state: afterState,
    ip,
    user_agent: userAgent,
  });

  if (error) throw error;
}
