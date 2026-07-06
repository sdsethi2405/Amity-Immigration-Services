"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { footerNav, primaryNav, type NavItem } from "@/content/nav";
import { cn } from "@/lib/utils";

function MegaMenuPanel({ item }: { item: Extract<NavItem, { type: "mega" }> }) {
  const panelId = useId();

  return (
    <div
      id={panelId}
      role="region"
      aria-label={`${item.label} menu`}
      className="absolute left-0 top-full z-50 hidden w-full border border-border bg-background p-6 shadow-lg group-focus-within:block group-hover:block md:grid md:grid-cols-4 md:gap-6"
    >
      {item.groups.map((group) => (
        <div key={group.stream}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-2">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-medium">{link.label}</span>
                  {link.description ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {link.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          Amity Immigration Services
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {primaryNav.map((item) =>
            item.type === "link" ? (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
                  aria-haspopup="true"
                >
                  {item.label}
                  <ChevronDown className="size-4" aria-hidden />
                </Link>
                <MegaMenuPanel item={item} />
              </div>
            ),
          )}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-border p-2 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? (
            <X className="size-5" aria-hidden />
          ) : (
            <Menu className="size-5" aria-hidden />
          )}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav"
          ref={mobilePanelRef}
          className="border-t border-border bg-background px-4 py-4 md:hidden"
        >
          <ul className="space-y-2">
            {primaryNav.map((item) =>
              item.type === "link" ? (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-2 py-2 text-sm font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li key={item.label}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm font-medium"
                    aria-expanded={openMega === item.label}
                    onClick={() =>
                      setOpenMega((current) =>
                        current === item.label ? null : item.label,
                      )
                    }
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        openMega === item.label && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {openMega === item.label ? (
                    <div className="mt-2 space-y-4 border-l border-border pl-4">
                      {item.groups.map((group) => (
                        <div key={group.stream}>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {group.label}
                          </p>
                          <ul className="space-y-1">
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className="block py-1 text-sm"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooterLegalLinks() {
  return (
    <nav aria-label="Legal">
      <ul className="flex flex-wrap gap-4 text-sm">
        {footerNav.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
