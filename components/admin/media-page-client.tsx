"use client";

import { Copy, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteMediaAction,
  listMediaObjectsAction,
  type MediaObject,
} from "@/actions/media";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/ui/button";
import { MEDIA_BUCKETS, type MediaBucket } from "@/lib/schemas/media";

type BucketLists = Record<MediaBucket, MediaObject[]>;

type MediaPageClientProps = {
  csrfToken: string;
  canDelete: boolean;
  initialLists?: Partial<BucketLists>;
};

function emptyLists(): BucketLists {
  return {
    "team-photos": [],
    "blog-covers": [],
    "page-images": [],
  };
}

export function MediaPageClient({
  csrfToken,
  canDelete,
  initialLists,
}: MediaPageClientProps) {
  const [lists, setLists] = useState<BucketLists>(() => ({
    ...emptyLists(),
    ...initialLists,
  }));
  const [loading, setLoading] = useState(!initialLists);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialLists) return;

    let cancelled = false;

    async function loadAll() {
      const next = emptyLists();

      await Promise.all(
        MEDIA_BUCKETS.map(async (bucket) => {
          const result = await listMediaObjectsAction(bucket);
          if (result.success && result.data) {
            next[bucket] = result.data;
          }
        }),
      );

      if (!cancelled) {
        setLists(next);
        setLoading(false);
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, [initialLists]);

  function prependObject(bucket: MediaBucket, object: MediaObject) {
    setLists((prev) => ({
      ...prev,
      [bucket]: [object, ...prev[bucket].filter((item) => item.path !== object.path)],
    }));
  }

  function removeObject(bucket: MediaBucket, path: string) {
    setLists((prev) => ({
      ...prev,
      [bucket]: prev[bucket].filter((item) => item.path !== path),
    }));
  }

  function handleCopy(url: string) {
    void navigator.clipboard.writeText(url).then(
      () => toast.success("URL copied"),
      () => toast.error("Could not copy URL"),
    );
  }

  function handleDelete(bucket: MediaBucket, path: string) {
    startTransition(async () => {
      const result = await deleteMediaAction({ bucket, path, csrfToken });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      removeObject(bucket, path);
      toast.success("Image deleted");
    });
  }

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
                prependObject(bucket, {
                  name: path.split("/").pop() ?? path,
                  path,
                  publicUrl,
                  updatedAt: new Date().toISOString(),
                });
              }}
            />
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading images…</p>
            ) : lists[bucket].length === 0 ? (
              <p className="text-sm text-muted-foreground">No images yet.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {lists[bucket].map((item) => (
                  <li
                    key={item.path}
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.publicUrl}
                      alt=""
                      className="aspect-video w-full object-cover bg-muted"
                    />
                    <div className="space-y-2 p-3">
                      <p className="break-all text-xs text-muted-foreground">
                        {item.path}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(item.publicUrl)}
                        >
                          <Copy className="size-3.5" aria-hidden />
                          Copy URL
                        </Button>
                        {canDelete ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleDelete(bucket, item.path)}
                          >
                            <Trash2 className="size-3.5 text-destructive" aria-hidden />
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
