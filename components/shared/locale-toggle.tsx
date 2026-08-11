"use client";

import { useTransition } from "react";

import { setLocaleAction } from "@/actions/locale";
import type { Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type LocaleToggleProps = {
  locale: Locale;
  className?: string;
};

export function LocaleToggle({ locale, className }: LocaleToggleProps) {
  const [isPending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        disabled={isPending}
        className={cn(
          "rounded px-1.5 py-0.5",
          locale === "en"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
      <span className="text-muted-foreground" aria-hidden>
        |
      </span>
      <button
        type="button"
        disabled={isPending}
        className={cn(
          "rounded px-1.5 py-0.5",
          locale === "zh"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => setLocale("zh")}
      >
        中文
      </button>
    </div>
  );
}
