"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateEnquiryNotesAction } from "@/actions/enquiries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EnquiryNotesFormProps = {
  id: string;
  notes: string | null;
  csrfToken: string;
};

export function EnquiryNotesForm({
  id,
  notes,
  csrfToken,
}: EnquiryNotesFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(notes ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateEnquiryNotesAction({
        id,
        notes: value,
        csrfToken,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Notes saved");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="enquiry-notes">Internal notes</Label>
      <Textarea
        id="enquiry-notes"
        rows={5}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={isPending}
        placeholder="Add follow-up notes for this enquiry…"
      />
      <Button
        type="button"
        size="sm"
        disabled={isPending || value === (notes ?? "")}
        onClick={handleSave}
      >
        {isPending ? "Saving…" : "Save notes"}
      </Button>
    </div>
  );
}
