"use server";

import { randomUUID } from "node:crypto";

import {
  requireAdmin,
  requireCanDelete,
  requireCsrf,
  toActionError,
} from "@/lib/auth/access";
import { actionFail, actionOk, type ActionResult } from "@/lib/admin/action-result";
import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_MEDIA_BYTES,
  mediaDeleteSchema,
  mediaListSchema,
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

export type MediaObject = {
  name: string;
  path: string;
  publicUrl: string;
  updatedAt: string | null;
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

function objectNameFromPath(bucket: MediaBucket, path: string): string | null {
  const normalized = path.replace(/^\/+/, "");
  const prefix = `${bucket}/`;

  if (normalized.startsWith(prefix)) {
    const name = normalized.slice(prefix.length);
    return name.length > 0 && !name.includes("..") ? name : null;
  }

  if (!normalized.includes("/") && !normalized.includes("..")) {
    return normalized;
  }

  return null;
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

export async function listMediaObjectsAction(
  bucket: unknown,
): Promise<ActionResult<MediaObject[]>> {
  try {
    const parsed = mediaListSchema.safeParse(
      typeof bucket === "string" ? { bucket } : bucket,
    );
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireAdmin();

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.storage
      .from(parsed.data.bucket)
      .list("", {
        limit: 100,
        sortBy: { column: "updated_at", order: "desc" },
      });

    if (error) {
      return actionFail(error.message);
    }

    const objects: MediaObject[] = (data ?? [])
      .filter((item) => Boolean(item.name) && !item.name.endsWith("/"))
      .map((item) => {
        const path = `${parsed.data.bucket}/${item.name}`;
        return {
          name: item.name,
          path,
          publicUrl: getStoragePublicUrl(path) ?? "",
          updatedAt: item.updated_at ?? null,
        };
      })
      .filter((item) => item.publicUrl.length > 0);

    return actionOk(objects);
  } catch (error) {
    return actionFail(toActionError(error));
  }
}

export async function deleteMediaAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = mediaDeleteSchema.safeParse(input);
    if (!parsed.success) {
      return actionFail(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await requireCsrf(parsed.data.csrfToken);
    const admin = await requireAdmin();
    requireCanDelete(admin);

    const objectName = objectNameFromPath(
      parsed.data.bucket,
      parsed.data.path,
    );
    if (!objectName) {
      return actionFail("Invalid media path");
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase.storage
      .from(parsed.data.bucket)
      .remove([objectName]);

    if (error) {
      return actionFail(error.message);
    }

    return actionOk();
  } catch (error) {
    return actionFail(toActionError(error));
  }
}
