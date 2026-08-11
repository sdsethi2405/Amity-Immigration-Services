"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateMatterStatusAction } from "@/actions/matters";
import { Button } from "@/components/ui/button";
import type { MatterStatus } from "@/lib/schemas/matters";

type MatterStatusFormProps = {
  csrfToken: string;
  matterId: string;
  status: MatterStatus;
};

const STATUSES: MatterStatus[] = ["open", "in_progress", "closed"];

const LABELS: Record<MatterStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

export function MatterStatusForm({
  csrfToken,
  matterId,
  status,
}: MatterStatusFormProps) {
  const [isPending, startTransition] = useTransition();

  function setStatus(next: MatterStatus) {
    if (next === status) return;
    startTransition(async () => {
      const result = await updateMatterStatusAction({
        csrfToken,
        id: matterId,
        status: next,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Status updated");
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((value) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={value === status ? "default" : "outline"}
          disabled={isPending}
          onClick={() => setStatus(value)}
        >
          {LABELS[value]}
        </Button>
      ))}
    </div>
  );
}
