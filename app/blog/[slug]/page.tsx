import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentBlockRenderer } from "@/components/shared/content-block-renderer";
import { getPostBySlug, getPublishedPosts } from "@/lib/db/queries";
import { buildBreadcrumbJsonLd, getSiteUrl } from "@/lib/seo";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  const description =
    post.excerpt ??
    `Insights from Amity Immigration Services on Australian visas and migration pathways.`;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      authors: post.author_name ? [post.author_name] : undefined,
    },
  };
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const coverUrl = getStoragePublicUrl(post.cover_url);
  const publishedLabel = formatDate(post.published_at);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: post.author_name
      ? { "@type": "Person", name: post.author_name }
      : { "@type": "Organization", name: "Amity Immigration Services" },
    image: coverUrl ?? `${siteUrl}/opengraph-image`,
    publisher: {
      "@type": "Organization",
      name: "Amity Immigration Services",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ]);

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 lg:py-16">
        <header>
          {publishedLabel ? (
            <time
              dateTime={post.published_at ?? undefined}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              {publishedLabel}
            </time>
          ) : null}
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
          ) : null}
        </header>

        <ContentBlockRenderer blocks={post.body} className="mt-10" />
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
