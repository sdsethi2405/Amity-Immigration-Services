/**
 * All Supabase reads and writes. Components never import the client directly.
 * Admin mutations use the service-role client in Server Actions (Stage 7).
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public-server";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type SiteSettingKey =
  | "compliance_footer"
  | "contact_details"
  | "social_links";

export type ContentBlockType =
  | "heading"
  | "richtext"
  | "image"
  | "cta"
  | "callout";

export type ContentBlock = {
  type: ContentBlockType;
  [key: string]: unknown;
};

export type VisaStream =
  | "skilled"
  | "employer"
  | "family"
  | "student"
  | "business"
  | "visitor"
  | "humanitarian"
  | "bridging"
  | "other";

export type VisaType = "temporary" | "permanent";

export type VisaStatus = "active" | "closing" | "closed" | "replaced";

export type RoleScope = "team" | "global";

export type Team = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Role = {
  id: string;
  name: string;
  level: number;
  scope: RoleScope;
  created_at: string;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  blocks: ContentBlock[];
  meta_title: string | null;
  meta_description: string | null;
  team_id: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: ContentBlock[];
  icon: string | null;
  sort_order: number;
  is_published: boolean;
  team_id: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type VisaSubclass = {
  id: string;
  subclass_number: string;
  name: string;
  slug: string;
  stream: VisaStream;
  visa_type: VisaType;
  pr_pathway: boolean;
  status: VisaStatus;
  eligibility_summary: string | null;
  body: ContentBlock[];
  processing_context: string | null;
  sort_order: number;
  is_published: boolean;
  team_id: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: ContentBlock[];
  cover_url: string | null;
  author_name: string | null;
  published_at: string | null;
  is_published: boolean;
  team_id: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type TeamMember = {
  id: string;
  name: string;
  role_title: string | null;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
  is_published: boolean;
  team_id: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type SiteSetting = {
  id: string;
  key: SiteSettingKey;
  value: unknown;
  updated_at: string;
  updated_by: string | null;
};

export type ContactDetails = {
  phone?: string;
  email?: string;
  address?: string;
  office_hours?: string;
};

export type SocialLinks = {
  facebook?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
};

/** Slim post shape for listings and sitemap. */
export type PublishedPost = Pick<
  Post,
  "slug" | "title" | "published_at" | "excerpt" | "cover_url" | "author_name"
>;

/** Slim page shape for legal routes and sitemap. */
export type LegalPage = Pick<Page, "slug" | "title">;

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

function asContentBlocks(value: unknown): ContentBlock[] {
  return Array.isArray(value) ? (value as ContentBlock[]) : [];
}

export function mapPage(row: Record<string, unknown>): Page {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    blocks: asContentBlocks(row.blocks),
    meta_title: (row.meta_title as string | null) ?? null,
    meta_description: (row.meta_description as string | null) ?? null,
    team_id: (row.team_id as string | null) ?? null,
    updated_at: row.updated_at as string,
    updated_by: (row.updated_by as string | null) ?? null,
  };
}

export function mapService(row: Record<string, unknown>): Service {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    summary: (row.summary as string | null) ?? null,
    body: asContentBlocks(row.body),
    icon: (row.icon as string | null) ?? null,
    sort_order: row.sort_order as number,
    is_published: row.is_published as boolean,
    team_id: (row.team_id as string | null) ?? null,
    updated_at: row.updated_at as string,
    updated_by: (row.updated_by as string | null) ?? null,
  };
}

export function mapVisaSubclass(row: Record<string, unknown>): VisaSubclass {
  return {
    id: row.id as string,
    subclass_number: row.subclass_number as string,
    name: row.name as string,
    slug: row.slug as string,
    stream: row.stream as VisaStream,
    visa_type: row.visa_type as VisaType,
    pr_pathway: row.pr_pathway as boolean,
    status: row.status as VisaStatus,
    eligibility_summary: (row.eligibility_summary as string | null) ?? null,
    body: asContentBlocks(row.body),
    processing_context: (row.processing_context as string | null) ?? null,
    sort_order: row.sort_order as number,
    is_published: row.is_published as boolean,
    team_id: (row.team_id as string | null) ?? null,
    updated_at: row.updated_at as string,
    updated_by: (row.updated_by as string | null) ?? null,
  };
}

export function mapPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: (row.excerpt as string | null) ?? null,
    body: asContentBlocks(row.body),
    cover_url: (row.cover_url as string | null) ?? null,
    author_name: (row.author_name as string | null) ?? null,
    published_at: (row.published_at as string | null) ?? null,
    is_published: row.is_published as boolean,
    team_id: (row.team_id as string | null) ?? null,
    updated_at: row.updated_at as string,
    updated_by: (row.updated_by as string | null) ?? null,
  };
}

export function mapTeamMember(row: Record<string, unknown>): TeamMember {
  return {
    id: row.id as string,
    name: row.name as string,
    role_title: (row.role_title as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    photo_url: (row.photo_url as string | null) ?? null,
    sort_order: row.sort_order as number,
    is_published: row.is_published as boolean,
    team_id: (row.team_id as string | null) ?? null,
    updated_at: row.updated_at as string,
    updated_by: (row.updated_by as string | null) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Admin scope helper
// ---------------------------------------------------------------------------

/**
 * Returns team IDs an admin may act within.
 * Global-scope roles receive every team id; team-scope roles receive only their own.
 */
export async function getAccessibleScopes(adminId: string): Promise<string[]> {
  const supabase = createServerSupabaseClient();

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("team_id, role_id")
    .eq("id", adminId)
    .maybeSingle();

  if (adminError) throw adminError;
  if (!admin?.role_id) return admin?.team_id ? [admin.team_id] : [];

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("scope")
    .eq("id", admin.role_id)
    .maybeSingle();

  if (roleError) throw roleError;
  if (!role) return admin.team_id ? [admin.team_id] : [];

  if (role.scope === "global") {
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id");

    if (teamsError) throw teamsError;
    return (teams ?? []).map((team) => team.id);
  }

  return admin.team_id ? [admin.team_id] : [];
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

export async function getSiteSetting(key: SiteSettingKey): Promise<unknown | null> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return data?.value ?? null;
}

export async function getSiteSettings(): Promise<SiteSetting[]> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("id, key, value, updated_at, updated_by")
    .order("key");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key as SiteSettingKey,
    value: row.value,
    updated_at: row.updated_at,
    updated_by: row.updated_by,
  }));
}

/** Footer compliance line (MARN identity). */
export async function getComplianceFooter(): Promise<string> {
  const value = await getSiteSetting("compliance_footer");

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return "Registered Migration Agent MARN 964861";
}

export async function getContactDetails(): Promise<ContactDetails | null> {
  const value = await getSiteSetting("contact_details");
  return value && typeof value === "object" ? (value as ContactDetails) : null;
}

export async function getSocialLinks(): Promise<SocialLinks | null> {
  const value = await getSiteSetting("social_links");
  return value && typeof value === "object" ? (value as SocialLinks) : null;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export async function getPublishedPages(): Promise<Page[]> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("title");

  if (error) throw error;
  return (data ?? []).map((row) => mapPage(row));
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPage(data) : null;
}

/** Home page blocks. */
export async function getHomePageBlocks(): Promise<ContentBlock[]> {
  const page = await getPageBySlug("home");
  return page?.blocks ?? [];
}

/** Legal pages (privacy, terms) for sitemap and routing. */
export async function getLegalPages(): Promise<LegalPage[]> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("pages")
    .select("slug, title")
    .in("slug", ["privacy", "terms"])
    .order("slug");

  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function getPublishedServices(): Promise<Service[]> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map((row) => mapService(row));
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data ? mapService(data) : null;
}

// ---------------------------------------------------------------------------
// Visa subclasses
// ---------------------------------------------------------------------------

export async function getPublishedVisaSubclasses(
  stream?: VisaStream,
): Promise<VisaSubclass[]> {
  const supabase = createPublicSupabaseClient();

  let query = supabase
    .from("visa_subclasses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  if (stream) {
    query = query.eq("stream", stream);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapVisaSubclass(row));
}

export async function getVisaSubclassBySlug(
  slug: string,
): Promise<VisaSubclass | null> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("visa_subclasses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data ? mapVisaSubclass(data) : null;
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function getPublishedPosts(): Promise<PublishedPost[]> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, published_at, excerpt, cover_url, author_name")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Most recent published posts for home and listings. */
export async function getLatestPublishedPosts(
  limit: number,
): Promise<PublishedPost[]> {
  const posts = await getPublishedPosts();
  return posts.slice(0, limit);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPost(data) : null;
}

// ---------------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------------

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map((row) => mapTeamMember(row));
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export type VisaSubclassNavItem = {
  slug: string;
  name: string;
  subclassNumber: string;
};

export type VisaStreamNavGroup = {
  stream: VisaStream;
  label: string;
  subclasses: VisaSubclassNavItem[];
};

/** Published visa subclasses grouped by stream for the site mega-menu. */
export async function getVisaStreamNavGroups(): Promise<VisaStreamNavGroup[]> {
  const { STREAM_ORDER, getStreamLabel } = await import("@/lib/content/visa-streams");
  const subclasses = await getPublishedVisaSubclasses();
  const grouped = new Map<VisaStream, VisaSubclassNavItem[]>();

  for (const subclass of subclasses) {
    const items = grouped.get(subclass.stream) ?? [];
    items.push({
      slug: subclass.slug,
      name: subclass.name,
      subclassNumber: subclass.subclass_number,
    });
    grouped.set(subclass.stream, items);
  }

  return STREAM_ORDER.filter((stream) => grouped.has(stream)).map((stream) => ({
    stream,
    label: getStreamLabel(stream),
    subclasses: grouped.get(stream) ?? [],
  }));
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export type SearchResultType = "service" | "visa_subclass" | "post";

export type SearchResult = {
  type: SearchResultType;
  title: string;
  slug: string;
  snippet: string;
  rank: number;
  href: string;
};

function hrefForSearchResult(type: SearchResultType, slug: string): string {
  switch (type) {
    case "service":
      return "/services";
    case "visa_subclass":
      return `/services/visa-sub-classes/${slug}`;
    case "post":
      return `/blog/${slug}`;
  }
}

/** Full-text search across published services, visa subclasses, and posts. */
export async function searchContent(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase.rpc("search_content", {
    p_query: trimmed,
  });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const type = row.result_type as SearchResultType;
    const slug = row.slug as string;

    return {
      type,
      title: row.title as string,
      slug,
      snippet: (row.snippet as string) ?? "",
      rank: Number(row.rank ?? 0),
      href: hrefForSearchResult(type, slug),
    };
  });
}
