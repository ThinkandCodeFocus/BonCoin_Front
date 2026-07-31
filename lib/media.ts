function getBackendHost(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
  try {
    return new URL(apiUrl).host
  } catch {
    return ""
  }
}

export function resolveStorageUrl(path?: string | null): string {
  if (!path) return "/placeholder.svg"

  let cleanPath = path.trim()
  if (!cleanPath) return "/placeholder.svg"

  if (cleanPath.startsWith("http")) {
    let urlHost = ""
    try {
      urlHost = new URL(cleanPath).host
    } catch {}

    // URL externe qui n'appartient pas à notre backend (ex: T-Express, Unsplash) :
    // on la garde telle quelle, pas de proxy possible/nécessaire.
    if (urlHost !== getBackendHost()) {
      return cleanPath
    }

    // URL de notre propre backend : on extrait ce qui suit /storage/ pour
    // passer par le proxy de Next.js (plus robuste pour le CORS).
    if (cleanPath.includes("/storage/")) {
      const parts = cleanPath.split("/storage/")
      cleanPath = parts[parts.length - 1]
    }
  }

  // On nettoie les préfixes restants si nécessaire
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1)

  // On retourne un chemin relatif que Next.js va proxier (voir next.config.mjs)
  return `/storage/${cleanPath}`
}
