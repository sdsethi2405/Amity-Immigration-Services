import type { MetadataRoute } from "next";

import {
  getLegalPages,
  getPublishedPosts,
  getPublishedServices,
  getPublishedVisaSubclasses,
} from "@/lib/db/queries";
import { getSiteUrl } from "@/lib/seo";

/**
 * Public sitemap only. Never enumerate /admin — the CMS is noindex and
 * disallowed in robots.txt.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/services`, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${siteUrl}/services/visa-sub-classes`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/services/points-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${siteUrl}/resources`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.9 },
  ];

  const [posts, legalPages, subclasses, services] = await Promise.all([
    getPublishedPosts(),
    getLegalPages(),
    getPublishedVisaSubclasses(),
    getPublishedServices(),
  ]);

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteUrl}/services/${service.slug}`,
    lastModified: service.updated_at,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const subclassRoutes: MetadataRoute.Sitemap = subclasses.map((subclass) => ({
    url: `${siteUrl}/services/visa-sub-classes/${subclass.slug}`,
    lastModified: subclass.updated_at,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.published_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const legalRoutes: MetadataRoute.Sitemap = legalPages.map((page) => ({
    url: `${siteUrl}/legal/${page.slug}`,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...subclassRoutes,
    ...postRoutes,
    ...legalRoutes,
  ];
}
