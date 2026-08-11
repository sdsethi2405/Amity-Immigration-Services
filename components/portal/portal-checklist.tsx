"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { toggleChecklistItemAction } from "@/actions/portal";
import type { MatterChecklistItem } from "@/lib/db/portal-queries";
import { cn } from "@/lib/utils";

type PortalChecklistProps = {
  matterId: string;
  csrfToken: string;
  items: MatterChecklistItem[];
};

export function PortalChecklist({
  matterId,
  csrfToken,
  items,
}: PortalChecklistProps) {
  const [isPending, startTransition] = useTransition();

  function toggle(item: MatterChecklistItem) {
    startTransition(async () => {
      const result = await toggleChecklistItemAction({
        csrfToken,
        matterId,
        itemId: item.id,
        isComplete: !item.is_complete,
      });
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No checklist items for this matter yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <label
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5",
              item.is_complete && "bg-muted/40",
            )}
          >
            <input
              type="checkbox"
              className="mt-1 size-4"
              checked={item.is_complete}
              disabled={isPending}
              onChange={() => toggle(item)}
            />
            <span>
              <span className="text-sm font-medium text-foreground">
                {item.label}
              </span>
              {item.is_required ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Required
                </span>
              ) : null}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
