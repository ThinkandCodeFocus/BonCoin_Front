export function resolveStorageUrl(path?: string | null): string {
  if (!path) return "/placeholder.svg"

  const trimmed = path.trim()
  if (!trimmed) return "/placeholder.svg"

  // Already a full URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  // Use relative path for images - let Next.js serve them directly from public folder
  // This is MUCH faster than going through Laravel/PHP
  if (trimmed.startsWith("/storage/")) {
    return trimmed  // Return relative path, Next.js will proxy
  }
  if (trimmed.startsWith("storage/")) {
    return `/${trimmed}`
  }
  if (trimmed.startsWith("/")) {
    return trimmed
  }

  return `/storage/${trimmed}`
}
