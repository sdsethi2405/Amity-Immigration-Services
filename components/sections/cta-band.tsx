"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { CtaBandBlock } from "@/lib/content/home-blocks";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { slideInFromBottom, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type CtaBandSectionProps = {
  content: CtaBandBlock;
};

export function CtaBandSection({ content }: CtaBandSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const variants = withReducedMotion(slideInFromBottom, prefersReducedMotion);

  return (
    <section className="border-t border-border py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <motion.div
          className="rounded-lg border border-border bg-accent px-6 py-10 text-center md:px-12 md:py-14"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={variants}
        >
          {content.headline ? (
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {content.headline}
            </h2>
          ) : null}

          {content.body ? (
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              {content.body}
            </p>
          ) : null}

          <div className="mt-8">
            <Link
              href="/contact"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Book a consultation
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
