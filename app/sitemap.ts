import type { MetadataRoute } from "next";
import { getLegalPages, getPublishedPosts } from "@/lib/db/queries";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://amity-immigration.vercel.app";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, legalPages] = await Promise.all([
    getPublishedPosts(),
    getLegalPages(),
  ]);

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

  return [...staticRoutes, ...postRoutes, ...legalRoutes];
}
