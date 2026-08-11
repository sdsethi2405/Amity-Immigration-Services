const DEFAULT_SITE_URL = "https://ais-project-gamma.vercel.app";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}

/** Local search terms for home and services metadata only. */
export const LOCAL_SEO_KEYWORDS = [
  "migration agent Bundoora",
  "migration agent Melbourne",
  "Australian visa advice Victoria",
] as const;

const BRAND_TITLE_SUFFIX = /\s*\|\s*Amity Immigration Services\s*$/i;

/**
 * Strip a trailing brand suffix so the root layout template
 * (`%s | Amity Immigration Services`) does not double the brand.
 */
export function formatPageTitle(title: string): string {
  return title.replace(BRAND_TITLE_SUFFIX, "").trim() || title;
}

export type BreadcrumbItem = {
  name: string;
  href: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http")
        ? item.href
        : `${siteUrl}${item.href}`,
    })),
  };
}
