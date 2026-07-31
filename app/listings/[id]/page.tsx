import type { Metadata } from "next"
import { ListingDetailClient } from "./listing-detail-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lemarche.xalass.com"

async function fetchAnnonce(id: string) {
  try {
    const res = await fetch(`${API_URL}/annonces/${id}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || json
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const annonce = await fetchAnnonce(id)

  if (!annonce) {
    return { title: "Annonce introuvable | LeMarché" }
  }

  const isJob = !!annonce.apply_url
  const priceLabel = isJob ? "" : ` - ${new Intl.NumberFormat("fr-FR").format(Number(annonce.price) || 0)} FCFA`
  const title = `${annonce.title}${priceLabel} | LeMarché`
  const rawDescription = (annonce.description || "").replace(/\s+/g, " ").trim()
  const description = rawDescription
    ? rawDescription.slice(0, 155)
    : `${annonce.title} à ${annonce.city || "Sénégal"} sur LeMarché.`
  const image: string | undefined = annonce.photos?.[0]
  const url = `${SITE_URL}/listings/${id}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "LeMarché",
      locale: "fr_FR",
      type: "website",
      images: image ? [{ url: image, width: 800, height: 800, alt: annonce.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default function ListingDetailPage() {
  return <ListingDetailClient />
}
