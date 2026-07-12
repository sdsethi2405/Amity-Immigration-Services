"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import type { ResourceLinksBlock } from "@/lib/content/blocks";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";

type ResourceLinksSectionProps = {
  content: ResourceLinksBlock;
};

export function ResourceLinksSection({ content }: ResourceLinksSectionProps) {
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

  if (content.links.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {content.title ? (
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {content.title}
          </h2>
        ) : null}

        <motion.ul
          className={content.title ? "mt-10 grid gap-4 md:grid-cols-2" : "grid gap-4 md:grid-cols-2"}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {content.links.map((link) => (
            <motion.li key={link.href + link.label} variants={itemVariants}>
              <Link
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-ring hover:bg-secondary"
              >
                <span className="inline-flex items-center gap-2 font-medium text-foreground group-hover:text-primary">
                  {link.label}
                  {link.external ? (
                    <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
                  ) : null}
                </span>
                {link.description ? (
                  <span className="mt-2 text-sm text-muted-foreground">
                    {link.description}
                  </span>
                ) : null}
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
