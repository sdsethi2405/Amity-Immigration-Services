/**
 * All Supabase reads and writes. Components never import the client directly.
 * TODO(Stage 3): implement typed queries once schema and RLS are in place.
 */

export type SiteSettingKey = "compliance_footer" | "contact_details" | "social_links";

export type PublishedPost = {
  slug: string;
  title: string;
  published_at: string | null;
};

export type LegalPage = {
  slug: string;
  title: string;
};

/** Footer compliance line (MARN identity). Stage 3: read from site_settings. */
export async function getComplianceFooter(): Promise<string> {
  // TODO(Stage 3): SELECT value FROM site_settings WHERE key = 'compliance_footer'
  return "Registered Migration Agent MARN 964861";
}

/** Published blog posts for sitemap and listings. Stage 3: filter is_published. */
export async function getPublishedPosts(): Promise<PublishedPost[]> {
  // TODO(Stage 3): query posts table
  return [];
}

/** Legal pages (privacy, terms) for sitemap and routing. Stage 3: query pages table. */
export async function getLegalPages(): Promise<LegalPage[]> {
  // TODO(Stage 3): query pages table WHERE slug IN ('privacy', 'terms')
  return [];
}

/** Home page blocks. Stage 5: wire to pages + sections. */
export async function getHomePageBlocks(): Promise<unknown[]> {
  // TODO(Stage 5)
  return [];
}

/** Visa subclasses for directory. Stage 5. */
export async function getPublishedVisaSubclasses(): Promise<unknown[]> {
  // TODO(Stage 5)
  return [];
}

/** Full-text search. Stage 8. */
export async function searchContent(query: string): Promise<unknown[]> {
  void query;
  // TODO(Stage 8): Postgres tsvector search
  return [];
}
