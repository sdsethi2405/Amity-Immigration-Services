"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import type { PublishedPost } from "@/lib/db/queries";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";

type LatestInsightsSectionProps = {
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

export function LatestInsightsSection({
  posts,
  title,
}: LatestInsightsSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerVariants = withReducedMotion(
    {
      hidden: {},
      show: {
        transition: {
          staggerChildren: prefersReducedMotion ? 0 : 0.1,
        },
      },
    },
    prefersReducedMotion,
  );
  const itemVariants = withReducedMotion(fadeUp, prefersReducedMotion);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {title ? (
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        ) : null}

        <motion.ul
          className={title ? "mt-10 grid gap-6 lg:grid-cols-3 lg:gap-8" : "grid gap-6 lg:grid-cols-3 lg:gap-8"}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {posts.map((post) => {
            const publishedLabel = formatDate(post.published_at);

            return (
              <motion.li key={post.slug} variants={itemVariants}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-ring"
                >
                  {publishedLabel ? (
                    <time
                      dateTime={post.published_at ?? undefined}
                      className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {publishedLabel}
                    </time>
                  ) : null}
                  <h3 className="mt-3 font-heading text-xl font-semibold text-foreground group-hover:text-primary">
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read article
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
