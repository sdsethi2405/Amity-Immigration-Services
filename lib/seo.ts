const DEFAULT_SITE_URL = "https://ais-project-gamma.vercel.app";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}

/** Local search terms for home and services metadata only. */
export const LOCAL_SEO_KEYWORDS = [
  "immigration lawyer Bundoora",
  "migration agent Melbourne",
  "Australian visa advice Victoria",
] as const;

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
