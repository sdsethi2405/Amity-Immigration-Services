"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { footerNav, type NavItem } from "@/content/nav";
import { SiteSearch } from "@/components/shared/site-search";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { menuScaleIn, withReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

type SiteHeaderProps = {
  primaryNav: NavItem[];
};

function trapFocus(container: HTMLElement, event: KeyboardEvent) {
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function MegaMenuPanel({
  item,
  isOpen,
  onClose,
}: {
  item: Extract<NavItem, { type: "mega" }>;
  isOpen: boolean;
  onClose: () => void;
}) {
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const variants = withReducedMotion(menuScaleIn, prefersReducedMotion);

  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        trapFocus(panel, event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const firstLink = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstLink?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div
      ref={panelRef}
      id={panelId}
      role="region"
      aria-label={`${item.label} menu`}
      className="absolute left-0 top-full z-50 w-full border border-border bg-background p-6 shadow-lg md:grid md:grid-cols-4 md:gap-6"
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={variants}
    >
      <div className="mb-6 border-b border-border pb-6 md:col-span-4 md:mb-0 md:border-b-0 md:pb-0">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Quick links
        </p>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
          {item.utilityLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex flex-col rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={onClose}
              >
                <span className="font-medium">{link.label}</span>
                {link.description ? (
                  <span className="text-xs text-muted-foreground">
                    {link.description}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>

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
                  onClick={onClose}
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
    </motion.div>
  );
}

export function SiteHeader({ primaryNav }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [desktopMega, setDesktopMega] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const closeDesktopMega = useCallback(() => setDesktopMega(null), []);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!desktopMega) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        closeDesktopMega();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [desktopMega, closeDesktopMega]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur"
    >
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
              <div key={item.label} className="relative">
                <div className="inline-flex items-center gap-1">
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    className="inline-flex rounded-md p-0.5 text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-haspopup="true"
                    aria-expanded={desktopMega === item.label}
                    aria-label={`${item.label} sub-menu`}
                    onClick={() =>
                      setDesktopMega((current) =>
                        current === item.label ? null : item.label,
                      )
                    }
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        desktopMega === item.label && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                </div>
                <AnimatePresence>
                  {desktopMega === item.label ? (
                    <MegaMenuPanel
                      item={item}
                      isOpen
                      onClose={closeDesktopMega}
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <SiteSearch className="hidden md:block" />

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
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-background px-4 py-4 md:hidden"
        >
          <SiteSearch className="mb-4" compact />
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
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Quick links
                        </p>
                        <ul className="space-y-1">
                          {item.utilityLinks.map((link) => (
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
