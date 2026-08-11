const MAX_EDGE = 1920;
const QUALITY = 0.8;

/**
 * Client-side image compress before upload. Skips GIFs (preserve animation).
 * Prefers WebP, falls back to JPEG. Returns the original file if compress fails.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.type === "image/gif") {
    return file;
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const preferWebp = supportsWebpEncoding();
    const mimeType = preferWebp ? "image/webp" : "image/jpeg";
    const blob = await canvasToBlob(canvas, mimeType, QUALITY);

    if (!blob || blob.size === 0) {
      return file;
    }

    // Keep original if compression did not shrink the payload.
    if (blob.size >= file.size && scale === 1) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const extension = preferWebp ? "webp" : "jpg";

    return new File([blob], `${baseName}.${extension}`, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

function supportsWebpEncoding(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}
