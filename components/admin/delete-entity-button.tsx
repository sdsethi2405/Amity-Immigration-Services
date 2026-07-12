"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Button } from "@/components/ui/button";

type DeleteEntityButtonProps = {
  id: string;
  csrfToken: string;
  label?: string;
  entityLabel?: string;
  deleteAction: (input: {
    id: string;
    csrfToken: string;
  }) => Promise<{ success: true } | { success: false; error: string }>;
};

export function DeleteEntityButton({
  id,
  csrfToken,
  label = "Delete",
  entityLabel = "item",
  deleteAction,
}: DeleteEntityButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete this ${entityLabel}?`}
        description="This action cannot be undone."
        onConfirm={async () => {
          const result = await deleteAction({ id, csrfToken });
          if (!result.success) {
            toast.error(result.error);
            throw new Error(result.error);
          }
          toast.success(`${entityLabel} deleted`);
          router.refresh();
        }}
      />
    </>
  );
}
