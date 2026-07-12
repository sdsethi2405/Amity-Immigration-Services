import { z } from "zod";

export const MEDIA_BUCKETS = [
  "team-photos",
  "blog-covers",
  "page-images",
] as const;

export type MediaBucket = (typeof MEDIA_BUCKETS)[number];

export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const mediaUploadSchema = z.object({
  csrfToken: z.string().min(1),
  bucket: z.enum(MEDIA_BUCKETS),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
