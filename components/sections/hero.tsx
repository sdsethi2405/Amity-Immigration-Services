"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { JourneyHero } from "@/components/shared/journey-hero";
import { buttonVariants } from "@/components/ui/button";
import type { HeroBlock } from "@/lib/content/home-blocks";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type HeroSectionProps = {
  content: HeroBlock | null;
};

export function HeroSection({ content }: HeroSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const variants = withReducedMotion(fadeUp, prefersReducedMotion);
  const instant = prefersReducedMotion;

  return (
    <section className="relative flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pb-8 pt-24 md:px-6 md:pt-28 lg:px-8">
        {content?.headline ? (
          <motion.h1
            className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl"
            initial="hidden"
            animate="show"
            variants={variants}
            transition={
              instant
                ? { duration: 0 }
                : { type: "spring", stiffness: 200, damping: 20 }
            }
          >
            {content.headline}
          </motion.h1>
        ) : null}

        {content?.subhead ? (
          <motion.p
            className="mt-4 max-w-2xl text-base text-muted-foreground md:mt-6 md:text-lg lg:text-xl"
            initial="hidden"
            animate="show"
            variants={variants}
            transition={
              instant
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.12,
                  }
            }
          >
            {content.subhead}
          </motion.p>
        ) : null}

        <motion.div
          className="mt-8 md:mt-10"
          initial="hidden"
          animate="show"
          variants={variants}
          transition={
            instant
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.32,
                }
          }
        >
          <Link
            href="/contact"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Book a consultation
          </Link>
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 md:px-6 lg:px-8">
        <JourneyHero className="rounded-lg border border-border bg-card" />
      </div>
    </section>
  );
}
