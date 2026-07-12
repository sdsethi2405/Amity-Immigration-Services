"use server";

import { randomUUID } from "node:crypto";

import {
  requireAdmin,
  requireCsrf,
  toActionError,
} from "@/lib/auth/access";
import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_MEDIA_BYTES,
  mediaUploadSchema,
  type MediaBucket,
} from "@/lib/schemas/media";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

export type MediaUploadResult = {
  path: string;
  publicUrl: string;
  bucket: MediaBucket;
};

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<ActionResult<MediaUploadResult>> {
  try {
    const csrfToken = String(formData.get("csrfToken") ?? "");
    const bucket = String(formData.get("bucket") ?? "");
    const file = formData.get("file");

    const parsed = mediaUploadSchema.safeParse({ csrfToken, bucket });
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    await requireAdmin();

    if (!(file instanceof File)) {
      return actionFail("A file is required");
    }

    if (file.size <= 0 || file.size > MAX_MEDIA_BYTES) {
      return actionFail("File must be between 1 byte and 5 MB");
    }

    if (
      !ALLOWED_MEDIA_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MEDIA_MIME_TYPES)[number],
      )
    ) {
      return actionFail("Only JPEG, PNG, WebP, and GIF images are allowed");
    }

    const objectName = `${randomUUID()}.${extensionForMime(file.type)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.storage
      .from(parsed.data.bucket)
      .upload(objectName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return actionFail(error.message);
    }

    const storagePath = `${parsed.data.bucket}/${objectName}`;
    const publicUrl = getStoragePublicUrl(storagePath);

    if (!publicUrl) {
      return actionFail("Could not resolve public URL");
    }

    return actionOk({
      path: storagePath,
      publicUrl,
      bucket: parsed.data.bucket,
    });
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
