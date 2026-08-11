import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { listMediaObjectsAction, type MediaObject } from "@/actions/media";
import { MediaPageClient } from "@/components/admin/media-page-client";
import { getCsrfTokenForForms } from "@/lib/admin/csrf";
import { ROLE_LEVEL } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";
import { MEDIA_BUCKETS, type MediaBucket } from "@/lib/schemas/media";

export const metadata: Metadata = {
  title: "Media · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const csrfToken = await getCsrfTokenForForms();
  const canDelete = admin.role.level >= ROLE_LEVEL.EDITOR;

  const initialLists = {} as Partial<Record<MediaBucket, MediaObject[]>>;
  await Promise.all(
    MEDIA_BUCKETS.map(async (bucket) => {
      const result = await listMediaObjectsAction(bucket);
      if (result.success && result.data) {
        initialLists[bucket] = result.data;
      } else {
        initialLists[bucket] = [];
      }
    }),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Media
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload images for team photos, blog covers, and page content.
        </p>
      </div>

      <MediaPageClient
        csrfToken={csrfToken}
        canDelete={canDelete}
        initialLists={initialLists}
      />
    </div>
  );
}
