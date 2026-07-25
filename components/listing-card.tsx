"use client"

import Link from "next/link"
import { MapPin, Star, BadgeCheck } from "lucide-react"
import { resolveStorageUrl } from "@/lib/media"
import { formatPrice, TimeAgo, FavoriteButton, BoostedBadge } from "@/components/design-system"
import { cn } from "@/lib/utils"

export interface ListingCardData {
  id: number
  title: string
  price: number
  city: string
  district?: string
  boosted_until?: string | null
  photos?: string[]
  created_at: string
  user?: {
    name: string
    photo?: string
    rating?: number
    rating_count?: number
    is_verified?: boolean
    is_professional?: boolean
    business_name?: string | null
  }
}

interface ListingCardProps {
  listing: ListingCardData
  isFavorited?: boolean
  onToggleFavorite?: (e: React.MouseEvent, id: number) => void
  isRecentlyAdded?: boolean
  variant?: "grid" | "carousel"
}

export function ListingCard({
  listing,
  isFavorited = false,
  onToggleFavorite,
  isRecentlyAdded,
  variant = "grid",
}: ListingCardProps) {
  const photoUrl = resolveStorageUrl(listing.photos?.[0])
  const isBoosted = !!listing.boosted_until && new Date(listing.boosted_until) > new Date()
  const seller = listing.user

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "block bg-card border-2 border-ink radius-indie overflow-hidden shadow-hard-sm press-hard",
        variant === "carousel" && "w-40 shrink-0 snap-start"
      )}
    >
      <div className="relative aspect-square bg-muted">
        <img
          src={photoUrl}
          alt={listing.title}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg"
          }}
          className="w-full h-full object-cover"
        />
        {seller?.name && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-card/95 border rounded-full pl-1 pr-2 py-1 max-w-[85%]">
            {seller.photo ? (
              <img src={resolveStorageUrl(seller.photo)} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
            ) : (
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-xs font-medium truncate">
              {seller.is_professional && seller.business_name ? seller.business_name : seller.name}
            </span>
            {seller.is_professional && (
              <span className="text-[10px] font-semibold text-muted-foreground border rounded px-1 shrink-0">Pro</span>
            )}
            {seller.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" aria-label="Vendeur vérifié" />}
            {typeof seller.rating === "number" && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
                <Star className="w-3 h-3 fill-current" />
                {seller.rating}
                {typeof seller.rating_count === "number" && ` (${seller.rating_count})`}
              </span>
            )}
          </div>
        )}
        <div className={cn("absolute left-2 flex flex-col gap-1", seller?.name ? "top-10" : "top-2")}>
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
        <p className="font-display text-xl font-semibold">{formatPrice(listing.price)}</p>
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
