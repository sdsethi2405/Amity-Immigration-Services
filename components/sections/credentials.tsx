"use client";

import { motion } from "framer-motion";

import type { CredentialsBlock } from "@/lib/content/blocks";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";

type CredentialsSectionProps = {
  content: CredentialsBlock;
};

export function CredentialsSection({ content }: CredentialsSectionProps) {
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

  if (content.items.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border bg-secondary py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {content.title ? (
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {content.title}
          </h2>
        ) : null}

        <motion.ul
          className={content.title ? "mt-10 grid gap-6 md:grid-cols-2" : "grid gap-6 md:grid-cols-2"}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {content.items.map((item) => (
            <motion.li
              key={item.title}
              variants={itemVariants}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              {item.body ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              ) : null}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
