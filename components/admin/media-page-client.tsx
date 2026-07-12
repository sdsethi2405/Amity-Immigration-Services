"use client";

import { useState } from "react";

import { MediaUploader } from "@/components/admin/media-uploader";
import { MEDIA_BUCKETS, type MediaBucket } from "@/lib/schemas/media";

type UploadResult = {
  bucket: MediaBucket;
  publicUrl: string;
  path: string;
};

type MediaPageClientProps = {
  csrfToken: string;
};

export function MediaPageClient({ csrfToken }: MediaPageClientProps) {
  const [results, setResults] = useState<UploadResult[]>([]);

  return (
    <div className="space-y-8">
      {MEDIA_BUCKETS.map((bucket) => (
        <section
          key={bucket}
          className="rounded-xl border border-border p-4 md:p-5"
        >
          <h2 className="font-heading text-xl font-semibold capitalize">
            {bucket.replace(/-/g, " ")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload to the <code className="text-xs">{bucket}</code> bucket.
          </p>
          <div className="mt-4">
            <MediaUploader
              csrfToken={csrfToken}
              bucket={bucket}
              onUploaded={({ publicUrl, path }) => {
                setResults((prev) => [
                  { bucket, publicUrl, path },
                  ...prev,
                ]);
              }}
            />
          </div>
        </section>
      ))}

      {results.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">
            Recent uploads
          </h2>
          <ul className="space-y-3">
            {results.map((result) => (
              <li
                key={`${result.path}-${result.publicUrl}`}
                className="rounded-lg border border-border p-3"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {result.bucket}
                </p>
                <p className="mt-1 break-all text-sm">{result.publicUrl}</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  {result.path}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.publicUrl}
                  alt=""
                  className="mt-3 h-28 w-auto max-w-full rounded-md object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
