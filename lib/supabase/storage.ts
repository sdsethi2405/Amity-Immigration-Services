/**
 * Resolve a public Supabase Storage object URL from a bucket path or full URL.
 */
export function getStoragePublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  if (!baseUrl) {
    return null;
  }

  const normalized = path.replace(/^\/+/, "");
  return `${baseUrl}/storage/v1/object/public/${normalized}`;
}
