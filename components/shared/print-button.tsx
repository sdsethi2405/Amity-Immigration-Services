"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "outline" }))}
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}
