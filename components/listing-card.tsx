"use client"

import Link from "next/link"
import { MapPin, Star, BadgeCheck } from "lucide-react"
import { resolveStorageUrl } from "@/lib/media"
import { TimeAgo, FavoriteButton, BoostedBadge } from "@/components/design-system"
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
  apply_url?: string | null
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
  index?: number
}

export function ListingCard({
  listing,
  isFavorited = false,
  onToggleFavorite,
  isRecentlyAdded,
  variant = "grid",
  index,
}: ListingCardProps) {
  const photoUrl = resolveStorageUrl(listing.photos?.[0])
  const isBoosted = !!listing.boosted_until && new Date(listing.boosted_until) > new Date()
  const seller = listing.user
  const tilt =
    variant === "grid" && typeof index === "number"
      ? index % 3 === 1
        ? "md:-rotate-[0.35deg]"
        : index % 3 === 2
          ? "md:rotate-[0.35deg]"
          : ""
      : ""
  const priceParts = (() => {
    const value = typeof listing.price === "string" ? Number(listing.price) : listing.price
    return Number.isFinite(value) ? new Intl.NumberFormat("fr-FR").format(value) : String(listing.price)
  })()

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "block bg-card border-2 border-ink radius-indie overflow-hidden shadow-hard-sm press-hard",
        variant === "carousel" && "w-40 shrink-0 snap-start",
        tilt
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
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-card/95 border-2 border-ink rounded-full pl-1 pr-2 py-1 max-w-[85%] shadow-hard-sm">
            {seller.photo ? (
              <img
                src={resolveStorageUrl(seller.photo)}
                alt=""
                className="w-6 h-6 rounded-full object-cover shrink-0 border border-ink/20"
              />
            ) : (
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-bold shrink-0">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-xs font-semibold truncate">
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
        {listing.apply_url ? (
          <p className="font-display text-sm font-bold tracking-tight leading-none text-primary">Offre d'emploi</p>
        ) : (
          <p className="font-display text-2xl font-bold tracking-tight tabular-nums leading-none">
            {priceParts}
            <span className="ml-1 font-sans text-[11px] font-semibold tracking-wide text-muted-foreground align-super">
              FCFA
            </span>
          </p>
        )}
        <h3 className="text-sm mt-1.5 line-clamp-2 leading-snug">{listing.title}</h3>
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
