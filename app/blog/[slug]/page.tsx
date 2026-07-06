import type { Metadata } from "next";
import { notFound } from "next/navigation";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  // TODO(Stage 5): return published post slugs from getPublishedPosts()
  return [];
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  // TODO(Stage 5): fetch post meta from DB
  return {
    title: slug,
    description: "Amity Immigration Services blog post.",
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // TODO(Stage 5): fetch post by slug; Article JSON-LD
  if (!slug) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-heading text-4xl font-semibold capitalize">
        {slug.replace(/-/g, " ")}
      </h1>
      {/* TODO(Stage 5): typed block renderer */}
    </article>
  );
}
