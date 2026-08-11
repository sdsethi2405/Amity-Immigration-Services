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

export const mediaListSchema = z.object({
  bucket: z.enum(MEDIA_BUCKETS),
});

export const mediaDeleteSchema = z.object({
  csrfToken: z.string().min(1),
  bucket: z.enum(MEDIA_BUCKETS),
  path: z.string().trim().min(1).max(500),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
export type MediaListInput = z.infer<typeof mediaListSchema>;
export type MediaDeleteInput = z.infer<typeof mediaDeleteSchema>;
