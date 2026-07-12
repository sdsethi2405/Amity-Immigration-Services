"use client";

import { motion } from "framer-motion";

import type { IntroBlock } from "@/lib/content/blocks";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";

type ResourcesIntroSectionProps = {
  content: IntroBlock;
};

export function ResourcesIntroSection({ content }: ResourcesIntroSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const variants = withReducedMotion(fadeUp, prefersReducedMotion);

  return (
    <section className="border-b border-border py-16 md:py-20">
      <motion.div
        className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={variants}
      >
        {content.title ? (
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {content.title}
          </h1>
        ) : null}
        {content.body ? (
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.body}
          </p>
        ) : null}
      </motion.div>
    </section>
  );
}
