export function resolveStorageUrl(path?: string | null): string {
  if (!path) return "/placeholder.svg"

  let cleanPath = path.trim()
  if (!cleanPath) return "/placeholder.svg"

  // Si c'est une URL externe complète (ex: Unsplash), on la garde telle quelle
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath
  }

  // Si la valeur contient /storage/, on prend la partie après pour normaliser
  if (cleanPath.includes('/storage/')) {
    const parts = cleanPath.split('/storage/')
    cleanPath = parts[parts.length - 1]
  }

  // On nettoie les préfixes restants si nécessaire
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1)

  // Construire la base backend à partir des variables d'environnement
  // NEXT_PUBLIC_API_BASE_URL (recommandé) ou NEXT_PUBLIC_API_URL (qui contient /api)
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  const backendBase = envBase.replace(/\/api\/?$/, '') // enlève /api si présent

  // Retourner une URL relative pour tirer parti des rewrites Next.js (next.config.mjs)
  // Cela évite les problèmes de base URL en prod et fonctionne en dev.
  return `/storage/${cleanPath}`
}
