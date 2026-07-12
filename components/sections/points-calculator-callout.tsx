"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { CalloutBlock } from "@/lib/content/blocks";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PointsCalculatorCalloutSectionProps = {
  content: CalloutBlock;
};

export function PointsCalculatorCalloutSection({
  content,
}: PointsCalculatorCalloutSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const variants = withReducedMotion(fadeUp, prefersReducedMotion);

  return (
    <section className="border-t border-border bg-secondary py-16 md:py-20">
      <motion.div
        className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={variants}
      >
        <div className="rounded-lg border border-border bg-card px-6 py-8 md:flex md:items-center md:justify-between md:gap-8 md:px-8">
          <div className="max-w-2xl">
            {content.title ? (
              <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
                {content.title}
              </h2>
            ) : null}
            {content.body ? (
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                {content.body}
              </p>
            ) : null}
          </div>
          <Link
            href="/services/points-calculator"
            className={cn(buttonVariants(), "mt-6 inline-flex shrink-0 md:mt-0")}
          >
            Open points calculator
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
