"use client"

import Link from "next/link"
import { MapPin, Star, BadgeCheck } from "lucide-react"
import { resolveStorageUrl } from "@/lib/media"
import { TimeAgo, FavoriteButton, BoostedBadge } from "@/components/design-system"
import { ListingThumbnail } from "@/components/listing-thumbnail"
import { useI18n } from "@/components/I18nProvider"
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
  is_job_listing?: boolean
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
}: ListingCardProps) {
  const { t } = useI18n()
  const photoUrl = resolveStorageUrl(listing.photos?.[0])
  const isBoosted = !!listing.boosted_until && new Date(listing.boosted_until) > new Date()
  const seller = listing.user
  const priceParts = (() => {
    const value = typeof listing.price === "string" ? Number(listing.price) : listing.price
    return Number.isFinite(value) ? new Intl.NumberFormat("fr-FR").format(value) : String(listing.price)
  })()

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "group block bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-shadow hover:shadow-md",
        variant === "carousel" && "w-40 shrink-0 snap-start"
      )}
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        <ListingThumbnail
          src={listing.photos?.[0] ? photoUrl : undefined}
          alt={listing.title}
          isJob={!!listing.is_job_listing}
          className="w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        {seller?.name && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-card/95 border border-border rounded-full pl-1 pr-2 py-1 max-w-[85%] shadow-sm">
            {seller.photo ? (
              <img
                src={resolveStorageUrl(seller.photo)}
                alt=""
                className="w-6 h-6 rounded-full object-cover shrink-0"
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
            {seller.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" aria-label={t("badge.verified_seller")} />}
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
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-card border border-border shadow-sm">
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
        {listing.is_job_listing ? (
          <p className="text-sm font-bold tracking-tight leading-none text-primary">{t("badge.job_offer")}</p>
        ) : (
          <p className="text-lg font-bold tracking-tight tabular-nums leading-none">
            {priceParts}
            <span className="ml-1 text-[11px] font-semibold tracking-wide text-muted-foreground align-super">
              FCFA
            </span>
          </p>
        )}
        <h3 className="text-sm mt-1.5 line-clamp-2 leading-snug text-foreground/90">{listing.title}</h3>
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
