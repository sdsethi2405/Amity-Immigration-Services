import type { Metadata } from "next";

import { BlogPostListSection } from "@/components/sections/blog-post-list";
import { getPublishedPosts } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on Australian visas, migration pathways, and policy updates.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return <BlogPostListSection posts={posts} title="Insights" />;
}
