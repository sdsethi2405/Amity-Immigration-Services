/**
 * Privileged admin reads via the service-role client.
 * Always pair with requireAdmin / scope checks in Server Actions or pages.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  mapPage,
  mapPost,
  mapService,
  mapTeamMember,
  mapVisaSubclass,
  type Page,
  type Post,
  type Service,
  type Team,
  type TeamMember,
  type VisaSubclass,
} from "@/lib/db/queries";
import { getAccessibleScopes } from "@/lib/db/queries";

export type AuditLogRow = {
  id: string;
  action: string;
  actor_admin_id: string | null;
  actor_username: string | null;
  target_table: string;
  target_id: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AuditLogFilters = {
  actorAdminId?: string;
  targetTable?: string;
  from?: string;
  to?: string;
  limit?: number;
};

async function scopeFilter(
  adminId: string,
): Promise<{ global: boolean; teamIds: string[] }> {
  const teamIds = await getAccessibleScopes(adminId);
  return { global: teamIds.length > 0, teamIds };
}

export async function adminListTeams(): Promise<Team[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, slug, created_at")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function adminListPagesForAdmin(
  adminId: string,
): Promise<Page[]> {
  const supabase = createServerSupabaseClient();
  const { teamIds } = await scopeFilter(adminId);

  let query = supabase.from("pages").select("*").order("title");
  if (teamIds.length > 0) {
    query = query.in("team_id", teamIds);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapPage(row));
}

export async function adminGetPageById(id: string): Promise<Page | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPage(data) : null;
}

export async function adminListServicesForAdmin(
  adminId: string,
): Promise<Service[]> {
  const supabase = createServerSupabaseClient();
  const { teamIds } = await scopeFilter(adminId);

  if (teamIds.length === 0) return [];

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .in("team_id", teamIds)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map((row) => mapService(row));
}

export async function adminGetServiceById(id: string): Promise<Service | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapService(data) : null;
}

export async function adminListVisaSubclassesForAdmin(
  adminId: string,
): Promise<VisaSubclass[]> {
  const supabase = createServerSupabaseClient();
  const { teamIds } = await scopeFilter(adminId);

  if (teamIds.length === 0) return [];

  const { data, error } = await supabase
    .from("visa_subclasses")
    .select("*")
    .in("team_id", teamIds)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map((row) => mapVisaSubclass(row));
}

export async function adminGetVisaSubclassById(
  id: string,
): Promise<VisaSubclass | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("visa_subclasses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapVisaSubclass(data) : null;
}

export async function adminListPostsForAdmin(
  adminId: string,
): Promise<Post[]> {
  const supabase = createServerSupabaseClient();
  const { teamIds } = await scopeFilter(adminId);

  if (teamIds.length === 0) return [];

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .in("team_id", teamIds)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapPost(row));
}

export async function adminGetPostById(id: string): Promise<Post | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPost(data) : null;
}

export async function adminListTeamMembersForAdmin(
  adminId: string,
): Promise<TeamMember[]> {
  const supabase = createServerSupabaseClient();
  const { teamIds } = await scopeFilter(adminId);

  if (teamIds.length === 0) return [];

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .in("team_id", teamIds)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map((row) => mapTeamMember(row));
}

export async function adminGetTeamMemberById(
  id: string,
): Promise<TeamMember | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTeamMember(data) : null;
}

export async function adminListAuditLog(
  filters: AuditLogFilters = {},
): Promise<AuditLogRow[]> {
  const supabase = createServerSupabaseClient();
  const limit = filters.limit ?? 100;

  let query = supabase
    .from("audit_log")
    .select(
      "id, action, actor_admin_id, target_table, target_id, before_state, after_state, ip, user_agent, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.actorAdminId) {
    query = query.eq("actor_admin_id", filters.actorAdminId);
  }
  if (filters.targetTable) {
    query = query.eq("target_table", filters.targetTable);
  }
  if (filters.from) {
    query = query.gte("created_at", filters.from);
  }
  if (filters.to) {
    query = query.lte("created_at", filters.to);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const actorIds = [
    ...new Set(
      rows
        .map((row) => row.actor_admin_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const usernameById = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: admins, error: adminsError } = await supabase
      .from("admins")
      .select("id, username")
      .in("id", actorIds);

    if (adminsError) throw adminsError;
    for (const admin of admins ?? []) {
      usernameById.set(admin.id, admin.username);
    }
  }

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    actor_admin_id: row.actor_admin_id,
    actor_username: row.actor_admin_id
      ? (usernameById.get(row.actor_admin_id) ?? null)
      : null,
    target_table: row.target_table,
    target_id: row.target_id,
    before_state: (row.before_state as Record<string, unknown> | null) ?? null,
    after_state: (row.after_state as Record<string, unknown> | null) ?? null,
    ip: row.ip ? String(row.ip) : null,
    user_agent: row.user_agent,
    created_at: row.created_at,
  }));
}

export async function adminListActors(): Promise<
  Array<{ id: string; username: string }>
> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("admins")
    .select("id, username")
    .order("username");

  if (error) throw error;
  return data ?? [];
}
