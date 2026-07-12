"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import type { SearchResult, SearchResultType } from "@/lib/db/queries";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

const GROUP_ORDER: Array<{
  type: SearchResultType;
  label: string;
}> = [
  { type: "service", label: "Services" },
  { type: "visa_subclass", label: "Visa Sub-Classes" },
  { type: "post", label: "Insights" },
];

type SiteSearchProps = {
  className?: string;
  compact?: boolean;
};

export function SiteSearch({ className, compact = false }: SiteSearchProps) {
  const inputId = useId();
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          setResults([]);
          return;
        }
        const data = (await response.json()) as { results?: SearchResult[] };
        setResults(data.results ?? []);
        setOpen(true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setResults([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const grouped = GROUP_ORDER.map((group) => ({
    ...group,
    items: results.filter((item) => item.type === group.type),
  })).filter((group) => group.items.length > 0);

  const showPanel = open && (loading || debouncedQuery.length > 0);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <label htmlFor={inputId} className="sr-only">
        Search the site
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          id={inputId}
          type="search"
          value={query}
          placeholder="Search…"
          autoComplete="off"
          aria-controls={panelId}
          aria-expanded={showPanel}
          aria-autocomplete="list"
          className={cn(
            "w-full rounded-md border border-input bg-background py-2 pr-8 pl-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
            compact ? "h-9" : "h-10 md:w-48 lg:w-56",
          )}
          onChange={(event) => {
            setQuery(event.target.value);
            if (event.target.value.trim()) {
              setOpen(true);
            }
          }}
          onFocus={() => {
            if (debouncedQuery || results.length > 0) {
              setOpen(true);
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setResults([]);
              setOpen(false);
            }}
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {showPanel ? (
          <motion.div
            id={panelId}
            role="listbox"
            aria-label="Search results"
            className="absolute top-full right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-lg border border-border bg-background shadow-lg"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.15, ease: "easeOut" }
            }
          >
            <div className="max-h-80 overflow-y-auto p-3">
              {loading ? (
                <p className="px-1 py-2 text-sm text-muted-foreground">
                  Searching…
                </p>
              ) : null}

              {!loading && debouncedQuery && grouped.length === 0 ? (
                <p className="px-1 py-2 text-sm text-muted-foreground">
                  No published results for “{debouncedQuery}”.
                </p>
              ) : null}

              {!loading
                ? grouped.map((group) => (
                    <div key={group.type} className="mb-3 last:mb-0">
                      <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {group.label}
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {group.items.map((item) => (
                          <li key={`${item.type}-${item.slug}`}>
                            <Link
                              href={item.href}
                              className="block rounded-md px-2 py-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              onClick={() => setOpen(false)}
                            >
                              <span className="block text-sm font-medium text-foreground">
                                {item.title}
                              </span>
                              {item.snippet ? (
                                <span
                                  className="mt-0.5 block text-xs text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground"
                                  dangerouslySetInnerHTML={{
                                    __html: item.snippet,
                                  }}
                                />
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
