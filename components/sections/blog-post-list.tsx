"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import type { PublishedPost } from "@/lib/db/queries";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

type BlogPostListSectionProps = {
  posts: PublishedPost[];
  title?: string;
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function BlogPostListSection({ posts, title }: BlogPostListSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerVariants = withReducedMotion(
    {
      hidden: {},
      show: {
        transition: { staggerChildren: prefersReducedMotion ? 0 : 0.1 },
      },
    },
    prefersReducedMotion,
  );
  const itemVariants = withReducedMotion(fadeUp, prefersReducedMotion);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {title ? (
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
        ) : null}

        <motion.ul
          className={title ? "mt-10 grid gap-8 md:grid-cols-2" : "grid gap-8 md:grid-cols-2"}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {posts.map((post) => {
            const coverUrl = getStoragePublicUrl(post.cover_url);
            const publishedLabel = formatDate(post.published_at);

            return (
              <motion.li key={post.slug} variants={itemVariants}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-ring"
                >
                  <div className="relative aspect-[16/9] bg-muted">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    {publishedLabel ? (
                      <time
                        dateTime={post.published_at ?? undefined}
                        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        {publishedLabel}
                      </time>
                    ) : null}
                    <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground group-hover:text-primary">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-3 flex-1 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read article
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
