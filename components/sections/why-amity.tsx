"use client";

import { motion } from "framer-motion";

import type { WhyAmityBlock } from "@/lib/content/home-blocks";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type WhyAmitySectionProps = {
  content: WhyAmityBlock;
};

export function WhyAmitySection({ content }: WhyAmitySectionProps) {
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

  if ((content.points ?? []).length === 0) {
    return null;
  }

  return (
    <section className="bg-secondary py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {content.title ? (
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {content.title}
          </h2>
        ) : null}

        <motion.ul
          className={cn(
            "grid gap-6 md:grid-cols-2 lg:gap-8",
            content.title ? "mt-10" : "mt-0",
          )}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {(content.points ?? []).map((point) => (
            <motion.li
              key={point.title}
              variants={itemVariants}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {point.title}
              </h3>
              {point.body ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {point.body}
                </p>
              ) : null}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
