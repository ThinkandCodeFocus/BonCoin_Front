"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { annonceService } from "@/lib/api"
import { ListingCard, type ListingCardData } from "@/components/listing-card"

interface CategoryCarouselProps {
  categoryId: number
  categoryName: string
}

export function CategoryCarousel({ categoryId, categoryName }: CategoryCarouselProps) {
  const [listings, setListings] = useState<ListingCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    annonceService.getAll({ category: String(categoryId), page: 1 }).then((result) => {
      if (cancelled) return
      if (result.success && (result as any).data) {
        const data = (result as any).data
        setListings(data.data || [])
      }
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [categoryId])

  if (!isLoading && listings.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">{categoryName}</h2>
        <Link
          href={`/listings?category=${categoryId}`}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Voir plus d'annonces
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 snap-x scrollbar-thin">
        {isLoading
          ? [...Array(5)].map((_, i) => (
              <div key={i} className="w-40 shrink-0 border rounded-lg overflow-hidden">
                <div className="aspect-square skeleton" />
                <div className="p-3 space-y-2">
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
            ))
          : listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} variant="carousel" />
            ))}
      </div>
    </div>
  )
}
