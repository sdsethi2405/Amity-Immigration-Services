"use client";

import {
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  Landmark,
  Plane,
  Route,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import type { StreamsOverviewBlock } from "@/lib/content/home-blocks";
import type { VisaStream } from "@/lib/db/queries";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { fadeUp, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STREAM_ICONS: Record<VisaStream, typeof Briefcase> = {
  skilled: Briefcase,
  employer: Users,
  family: Heart,
  student: GraduationCap,
  business: Building2,
  visitor: Plane,
  humanitarian: Landmark,
  bridging: Route,
  other: Briefcase,
};

type StreamsOverviewSectionProps = {
  content: StreamsOverviewBlock;
};

export function StreamsOverviewSection({ content }: StreamsOverviewSectionProps) {
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

  if (!content.streams?.length) {
    return null;
  }

  return (
    <section className="border-t border-border bg-background py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {content.title ? (
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {content.title}
          </h2>
        ) : null}

        <motion.ul
          className={cn(
            "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
            content.title ? "mt-10" : "mt-0",
          )}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {content.streams.map((stream) => {
            const Icon = STREAM_ICONS[stream.stream];

            return (
              <motion.li key={stream.stream} variants={itemVariants}>
                <Link
                  href={`/services/visa-sub-classes?stream=${stream.stream}`}
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-ring hover:bg-secondary md:p-6"
                >
                  <span className="mb-4 inline-flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-heading text-lg font-semibold text-foreground group-hover:text-primary">
                    {stream.label}
                  </span>
                  {stream.description ? (
                    <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {stream.description}
                    </span>
                  ) : null}
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
