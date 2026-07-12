"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import type { VisaStream, VisaSubclass } from "@/lib/db/queries";
import {
  STREAM_ORDER,
  getStatusRibbonLabel,
  getStreamLabel,
  isVisaStream,
} from "@/lib/content/visa-streams";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

type SubclassDirectorySectionProps = {
  subclasses: VisaSubclass[];
  initialStream?: string;
};

const cardFadeUp = {
  hidden: { opacity: 1, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

export function SubclassDirectorySection({
  subclasses,
  initialStream,
}: SubclassDirectorySectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  const availableStreams = useMemo(() => {
    const present = new Set(subclasses.map((item) => item.stream));
    return STREAM_ORDER.filter((stream) => present.has(stream));
  }, [subclasses]);

  const resolvedInitial: VisaStream | "all" = isVisaStream(initialStream)
    ? initialStream
    : "all";

  const [activeStream, setActiveStream] = useState<VisaStream | "all">(
    resolvedInitial === "all" || availableStreams.includes(resolvedInitial)
      ? resolvedInitial
      : "all",
  );

  const filtered = useMemo(() => {
    if (activeStream === "all") return subclasses;
    return subclasses.filter((item) => item.stream === activeStream);
  }, [activeStream, subclasses]);

  const containerVariants = prefersReducedMotion
    ? { hidden: {}, show: {} }
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.04 },
        },
      };

  const itemVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : cardFadeUp;

  function selectStream(stream: VisaStream | "all") {
    setActiveStream(stream);

    const params = new URLSearchParams();
    if (stream !== "all") {
      params.set("stream", stream);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const tabs: Array<{ id: VisaStream | "all"; label: string }> = [
    { id: "all", label: "All" },
    ...availableStreams.map((stream) => ({
      id: stream,
      label: getStreamLabel(stream),
    })),
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <header className="max-w-3xl">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Visa sub-classes
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Browse published Australian visa sub-classes by migration stream.
            Requirements change — always verify details with the Department of
            Home Affairs and seek registered migration advice for your
            circumstances.
          </p>
        </header>

        <div
          className="mt-10 overflow-x-auto border-b border-border"
          role="tablist"
          aria-label="Filter by visa stream"
        >
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => {
              const isActive = activeStream === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`stream-tab-${tab.id}`}
                  className={cn(
                    "relative px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => selectStream(tab.id)}
                >
                  {tab.label}
                  {isActive ? (
                    prefersReducedMotion ? (
                      <span
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                        aria-hidden
                      />
                    ) : (
                      <motion.span
                        layoutId="stream-tab-underline"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        aria-hidden
                      />
                    )
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No published visa sub-classes in this stream.
          </p>
        ) : (
          <motion.ul
            key={activeStream}
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={containerVariants}
            role="tabpanel"
            aria-labelledby={`stream-tab-${activeStream}`}
          >
            {filtered.map((subclass) => {
              const statusLabel = getStatusRibbonLabel(subclass.status);

              return (
                <motion.li key={subclass.id} variants={itemVariants}>
                  <Link
                    href={`/services/visa-sub-classes/${subclass.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-ring hover:bg-secondary"
                  >
                    {statusLabel ? (
                      <span className="absolute top-0 right-0 rounded-bl-md bg-muted px-2 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                        {statusLabel}
                      </span>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2 pr-16">
                      <span className="inline-flex rounded-md bg-accent px-2 py-1 font-mono text-xs font-semibold text-accent-foreground">
                        {subclass.subclass_number}
                      </span>
                      <span className="rounded-md border border-border px-2 py-0.5 text-xs capitalize text-muted-foreground">
                        {subclass.visa_type}
                      </span>
                      {subclass.pr_pathway ? (
                        <span className="rounded-md border border-border px-2 py-0.5 text-xs text-primary">
                          PR pathway
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-4 font-heading text-xl font-semibold text-foreground group-hover:text-primary">
                      {subclass.name}
                    </h2>

                    {subclass.eligibility_summary ? (
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {subclass.eligibility_summary}
                      </p>
                    ) : null}
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
