export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024

export function assertSafeImageFile(file: File, options?: { maxBytes?: number }): void {
  const maxBytes = options?.maxBytes ?? MAX_IMAGE_UPLOAD_BYTES

  if (!file || file.size <= 0) {
    throw new Error("فایل تصویر معتبر نیست.")
  }

  if (file.size > maxBytes) {
    throw new Error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.")
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("فرمت تصویر باید JPG، PNG یا WebP باشد.")
  }
}

export function getSafeImageExtension(file: File): "jpg" | "png" | "webp" {
  if (file.type === "image/png") return "png"
  if (file.type === "image/jpeg") return "jpg"
  return "webp"
}

export function toSafePathSegment(value: string, fallback = "file"): string {
  const safe = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  return safe || fallback
}

export function buildSafeStoragePath(parts: string[]): string {
  return parts.map((part, index) => toSafePathSegment(part, index === parts.length - 1 ? "file" : "folder")).join("/")
}
