export function resolveStorageUrl(path?: string | null): string {
  if (!path) return "/placeholder.svg"

  let cleanPath = path.trim()
  if (!cleanPath) return "/placeholder.svg"

  // Si c'est une URL complète, on extrait seulement ce qui vient après /storage/
  // Cela permet de passer par le proxy de Next.js (plus robuste pour le CORS)
  if (cleanPath.includes('/storage/')) {
    const parts = cleanPath.split('/storage/')
    cleanPath = parts[parts.length - 1]
  } else if (cleanPath.startsWith("http")) {
    // Si c'est une URL externe complète (ex: Unsplash), on la garde telle quelle
    return cleanPath
  }

  // On nettoie les préfixes restants si nécessaire
  if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1)

  // On retourne un chemin relatif que Next.js va proxier (voir next.config.mjs)
  return `/storage/${cleanPath}`
}
