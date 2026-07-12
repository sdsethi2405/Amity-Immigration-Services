"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadMediaAction } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { MediaBucket } from "@/lib/schemas/media";

type MediaUploaderProps = {
  csrfToken: string;
  bucket: MediaBucket;
  label?: string;
  onUploaded: (result: { publicUrl: string; path: string }) => void;
};

export function MediaUploader({
  csrfToken,
  bucket,
  label = "Upload image",
  onUploaded,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("csrfToken", csrfToken);
      formData.set("bucket", bucket);
      formData.set("file", file);

      const result = await uploadMediaAction(formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (!result.data) {
        toast.error("Upload succeeded but no URL was returned");
        return;
      }

      toast.success("Image uploaded");
      onUploaded({
        publicUrl: result.data.publicUrl,
        path: result.data.path,
      });
    });
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" aria-hidden />
          {isPending ? "Uploading…" : "Choose file"}
        </Button>
        {fileName ? (
          <span className="truncate text-sm text-muted-foreground">
            {fileName}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP, or GIF · max 5 MB · bucket: {bucket}
      </p>
    </div>
  );
}
