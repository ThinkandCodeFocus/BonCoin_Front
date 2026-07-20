"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"
import { resolveStorageUrl } from "@/lib/media"
import { formatPrice, TimeAgo, FavoriteButton, BoostedBadge } from "@/components/design-system"

export interface ListingCardData {
  id: number
  title: string
  price: number
  city: string
  district?: string
  boosted_until?: string | null
  photos?: string[]
  created_at: string
}

interface ListingCardProps {
  listing: ListingCardData
  isFavorited?: boolean
  onToggleFavorite?: (e: React.MouseEvent, id: number) => void
  isRecentlyAdded?: boolean
}

export function ListingCard({ listing, isFavorited = false, onToggleFavorite, isRecentlyAdded }: ListingCardProps) {
  const photoUrl = resolveStorageUrl(listing.photos?.[0])
  const isBoosted = !!listing.boosted_until && new Date(listing.boosted_until) > new Date()

  return (
    <Link href={`/listings/${listing.id}`} className="block border rounded-lg overflow-hidden card-interactive">
      <div className="relative aspect-square bg-muted">
        <img
          src={photoUrl}
          alt={listing.title}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg"
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isBoosted && <BoostedBadge />}
          {isRecentlyAdded && !isBoosted && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-card border">
              Urgent
            </span>
          )}
        </div>
        {onToggleFavorite && (
          <div className="absolute top-2 right-2">
            <FavoriteButton isFavorited={isFavorited} onToggle={(e) => onToggleFavorite(e, listing.id)} />
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-lg font-bold">{formatPrice(listing.price)}</p>
        <h3 className="text-sm mt-0.5 line-clamp-2 leading-snug">{listing.title}</h3>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {listing.city}
              {listing.district ? ` (${listing.district})` : ""}
            </span>
          </span>
          <TimeAgo date={listing.created_at} />
        </div>
      </div>
    </Link>
  )
}
