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
  type Role,
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

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  visa_interest: string | null;
  message: string;
  status: "new" | "in_progress" | "closed";
  source_page: string | null;
  notes: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export type EnquiryListFilters = {
  status?: Enquiry["status"];
  limit?: number;
};

function mapEnquiry(row: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  visa_interest: string | null;
  message: string;
  status: string;
  source_page: string | null;
  notes?: string | null;
  read_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}): Enquiry {
  const status =
    row.status === "in_progress" || row.status === "closed"
      ? row.status
      : "new";

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    visa_interest: row.visa_interest,
    message: row.message,
    status,
    source_page: row.source_page,
    notes: row.notes ?? null,
    read_at: row.read_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at ?? null,
  };
}

/** Contact / consult form submissions — global, not team-scoped. */
export async function adminListEnquiries(
  filters: EnquiryListFilters = {},
): Promise<Enquiry[]> {
  const supabase = createServerSupabaseClient();
  const limit = filters.limit ?? 200;

  let query = supabase
    .from("enquiries")
    .select(
      "id, name, email, phone, visa_interest, message, status, source_page, notes, read_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapEnquiry(row));
}

export async function adminGetEnquiryById(
  id: string,
): Promise<Enquiry | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select(
      "id, name, email, phone, visa_interest, message, status, source_page, notes, read_at, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapEnquiry(data) : null;
}

export async function adminCountEnquiriesByStatus(): Promise<
  Record<Enquiry["status"], number>
> {
  const supabase = createServerSupabaseClient();
  const counts: Record<Enquiry["status"], number> = {
    new: 0,
    in_progress: 0,
    closed: 0,
  };

  const { data, error } = await supabase.from("enquiries").select("status");
  if (error) throw error;

  for (const row of data ?? []) {
    const status = String(row.status);
    if (status === "new" || status === "in_progress" || status === "closed") {
      counts[status] += 1;
    }
  }

  return counts;
}

export type AdminAccountRow = {
  id: string;
  username: string;
  is_active: boolean;
  role_id: string | null;
  team_id: string | null;
  role_name: string | null;
  role_level: number | null;
  role_scope: "team" | "global" | null;
  team_name: string | null;
  created_at: string;
  last_login_at: string | null;
};

export async function adminListRoles(): Promise<Role[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, level, scope, created_at")
    .order("level", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    level: row.level,
    scope: row.scope === "global" ? "global" : "team",
    created_at: row.created_at,
  }));
}

export async function adminListAdmins(): Promise<AdminAccountRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("admins")
    .select(
      "id, username, is_active, role_id, team_id, created_at, last_login_at, roles ( name, level, scope ), teams ( name )",
    )
    .order("username");

  if (error) throw error;

  return (data ?? []).map((row) => {
    const roleRaw = row.roles;
    const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;
    const teamRaw = row.teams;
    const team = Array.isArray(teamRaw) ? teamRaw[0] : teamRaw;

    return {
      id: row.id,
      username: row.username,
      is_active: row.is_active,
      role_id: row.role_id,
      team_id: row.team_id,
      role_name: role?.name ?? null,
      role_level: role?.level ?? null,
      role_scope:
        role?.scope === "global" || role?.scope === "team" ? role.scope : null,
      team_name: team?.name ?? null,
      created_at: row.created_at,
      last_login_at: row.last_login_at,
    };
  });
}

export async function adminGetAdminById(
  id: string,
): Promise<AdminAccountRow | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("admins")
    .select(
      "id, username, is_active, role_id, team_id, created_at, last_login_at, roles ( name, level, scope ), teams ( name )",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const roleRaw = data.roles;
  const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;
  const teamRaw = data.teams;
  const team = Array.isArray(teamRaw) ? teamRaw[0] : teamRaw;

  return {
    id: data.id,
    username: data.username,
    is_active: data.is_active,
    role_id: data.role_id,
    team_id: data.team_id,
    role_name: role?.name ?? null,
    role_level: role?.level ?? null,
    role_scope:
      role?.scope === "global" || role?.scope === "team" ? role.scope : null,
    team_name: team?.name ?? null,
    created_at: data.created_at,
    last_login_at: data.last_login_at,
  };
}

export type VisaInterestCount = {
  visa_interest: string;
  count: number;
};

export type EnquiryDayCount = {
  day: string;
  count: number;
};

/** Top visa_interest values from enquiries created in the last N days. */
export async function adminTopVisaInterests(
  days = 90,
  limit = 10,
): Promise<VisaInterestCount[]> {
  const supabase = createServerSupabaseClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("enquiries")
    .select("visa_interest")
    .gte("created_at", since.toISOString())
    .not("visa_interest", "is", null);

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const value = row.visa_interest?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([visa_interest, count]) => ({ visa_interest, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Enquiry volume by calendar day for the last N days (UTC date keys). */
export async function adminEnquiryVolumeByDay(
  days = 90,
): Promise<EnquiryDayCount[]> {
  const supabase = createServerSupabaseClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("enquiries")
    .select("created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    if (byDay.has(day)) {
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
  }

  return [...byDay.entries()].map(([day, count]) => ({ day, count }));
}
