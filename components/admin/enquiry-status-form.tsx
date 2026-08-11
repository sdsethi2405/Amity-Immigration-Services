"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEnquiryStatusAction } from "@/actions/enquiries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { EnquiryStatus } from "@/lib/schemas/enquiry";

const STATUS_OPTIONS: Array<{ value: EnquiryStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

type EnquiryStatusFormProps = {
  id: string;
  status: EnquiryStatus;
  csrfToken: string;
};

export function EnquiryStatusForm({
  id,
  status,
  csrfToken,
}: EnquiryStatusFormProps) {
  const router = useRouter();
  const [value, setValue] = useState<EnquiryStatus>(status);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateEnquiryStatusAction({
        id,
        status: value,
        csrfToken,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Status updated");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="enquiry-status">Status</Label>
        <select
          id="enquiry-status"
          value={value}
          onChange={(event) => setValue(event.target.value as EnquiryStatus)}
          className="h-8 min-w-[10rem] rounded-lg border border-input bg-transparent px-2.5 text-sm"
          disabled={isPending}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="button"
        size="sm"
        disabled={isPending || value === status}
        onClick={handleSave}
      >
        {isPending ? "Saving…" : "Update status"}
      </Button>
    </div>
  );
}
