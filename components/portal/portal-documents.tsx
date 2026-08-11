"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getMatterDocumentSignedUrlAction,
  uploadMatterDocumentAction,
} from "@/actions/portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MatterDocument } from "@/lib/db/portal-queries";

type PortalDocumentsProps = {
  matterId: string;
  csrfToken: string;
  documents: MatterDocument[];
};

export function PortalDocuments({
  matterId,
  csrfToken,
  documents,
}: PortalDocumentsProps) {
  const [isPending, startTransition] = useTransition();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file to upload");
      return;
    }

    const formData = new FormData();
    formData.set("csrfToken", csrfToken);
    formData.set("matterId", matterId);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadMatterDocumentAction(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Document uploaded");
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleDownload(documentId: string) {
    setDownloadingId(documentId);
    startTransition(async () => {
      const result = await getMatterDocumentSignedUrlAction({ documentId });
      setDownloadingId(null);
      if (!result.success || !result.data?.url) {
        toast.error(result.success ? "Could not open file" : result.error);
        return;
      }
      window.open(result.data.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="space-y-2">
          <Label htmlFor="matter-document">Upload document</Label>
          <Input
            id="matter-document"
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            PDF, Word, JPEG, PNG, or WebP — max 10 MB.
          </p>
        </div>
        <Button type="button" disabled={isPending} onClick={handleUpload}>
          {isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {doc.file_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.created_at).toLocaleString()} · {doc.uploaded_by}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending || downloadingId === doc.id}
                onClick={() => handleDownload(doc.id)}
              >
                {downloadingId === doc.id ? "Opening…" : "Download"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
