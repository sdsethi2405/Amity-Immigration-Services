"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import type { Service } from "@/lib/db/queries";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";

type ServicesListSectionProps = {
  services: Service[];
  title?: string;
};

export function ServicesListSection({
  services,
  title,
}: ServicesListSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerVariants = withReducedMotion(
    {
      hidden: {},
      show: {
        transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 },
      },
    },
    prefersReducedMotion,
  );
  const itemVariants = withReducedMotion(fadeUp, prefersReducedMotion);

  if (services.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {title ? (
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        ) : null}

        <motion.ul
          className={title ? "mt-10 divide-y divide-border rounded-lg border border-border" : "divide-y divide-border rounded-lg border border-border"}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {services.map((service) => (
            <motion.li key={service.id} variants={itemVariants}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex flex-col gap-2 px-5 py-6 transition-colors hover:bg-secondary md:flex-row md:items-center md:justify-between md:px-6"
              >
                <div>
                  <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary">
                    {service.title}
                  </h3>
                  {service.summary ? (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      {service.summary}
                    </p>
                  ) : null}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Learn more
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
