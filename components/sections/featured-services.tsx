"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import type { Service } from "@/lib/db/queries";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { scaleIn, withReducedMotion } from "@/lib/motion";

type FeaturedServicesSectionProps = {
  services: Service[];
  title?: string;
};

export function FeaturedServicesSection({
  services,
  title,
}: FeaturedServicesSectionProps) {
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
  const itemVariants = withReducedMotion(scaleIn, prefersReducedMotion);

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {title ? (
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        ) : null}

        <motion.ul
          className={title ? "mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {services.map((service) => (
            <motion.li key={service.id} variants={itemVariants}>
              <Link
                href="/services"
                className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-ring"
              >
                <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary">
                  {service.title}
                </h3>
                {service.summary ? (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.summary}
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Learn more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
