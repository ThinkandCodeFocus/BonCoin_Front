export function resolveStorageUrl(path?: string | null): string {
  if (!path) return "/placeholder.svg"

  const trimmed = path.trim()
  if (!trimmed) return "/placeholder.svg"

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://127.0.0.1:8000"

  if (trimmed.startsWith("/storage/")) {
    return `${apiBase}${trimmed}`
  }
  if (trimmed.startsWith("storage/")) {
    return `${apiBase}/${trimmed}`
  }
  if (trimmed.startsWith("/")) {
    return `${apiBase}${trimmed}`
  }

  return `${apiBase}/storage/${trimmed}`
}
