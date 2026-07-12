"use client";

import { Label } from "@/components/ui/label";

type PublishToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  canPublish: boolean;
  id?: string;
};

export function PublishToggle({
  checked,
  onCheckedChange,
  canPublish,
  id = "is_published",
}: PublishToggleProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          className="size-4 rounded border-input accent-primary"
          checked={checked}
          disabled={!canPublish}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        <Label htmlFor={id} className={!canPublish ? "opacity-60" : undefined}>
          Publish
        </Label>
      </div>
      {!canPublish ? (
        <p className="text-xs text-muted-foreground">
          Editors and above can publish. Your draft will stay unpublished.
        </p>
      ) : null}
    </div>
  );
}
