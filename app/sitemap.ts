import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lemarche.xalass.com"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
const MAX_PAGES = 100 // garde-fou, largement au-dessus du volume actuel d'annonces

interface AnnonceListItem {
  id: number
  updated_at?: string
}

async function fetchAllAnnonces(): Promise<AnnonceListItem[]> {
  const items: AnnonceListItem[] = []

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(`${API_URL}/annonces?page=${page}`, { next: { revalidate: 3600 } })
      if (!res.ok) break

      const json = await res.json()
      const pageItems: AnnonceListItem[] = json.data || []
      items.push(...pageItems)

      const lastPage = json.last_page || page
      if (page >= lastPage) break
    }
  } catch {
    // Le sitemap se dégrade simplement aux pages statiques en cas d'erreur réseau.
  }

  return items
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/listings`, changeFrequency: "hourly", priority: 0.9 },
  ]

  const annonces = await fetchAllAnnonces()
  const listingPages: MetadataRoute.Sitemap = annonces.map((item) => ({
    url: `${SITE_URL}/listings/${item.id}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticPages, ...listingPages]
}
