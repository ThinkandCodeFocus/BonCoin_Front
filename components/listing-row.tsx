"use client"

import Link from "next/link"
import { resolveStorageUrl } from "@/lib/media"
import { formatPrice, TimeAgo, FavoriteButton, BoostedBadge } from "@/components/design-system"
import { ListingThumbnail } from "@/components/listing-thumbnail"
import type { ListingCardData } from "@/components/listing-card"
import { useI18n } from "@/components/I18nProvider"

interface ListingRowProps {
  listing: ListingCardData
  isFavorited?: boolean
  onToggleFavorite?: (e: React.MouseEvent, id: number) => void
}

export function ListingRow({ listing, isFavorited = false, onToggleFavorite }: ListingRowProps) {
  const { t } = useI18n()
  const photoUrl = resolveStorageUrl(listing.photos?.[0])
  const isBoosted = !!listing.boosted_until && new Date(listing.boosted_until) > new Date()

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex gap-4 border rounded-lg p-3 bg-card card-interactive"
    >
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 bg-muted rounded-md overflow-hidden">
        <ListingThumbnail
          src={listing.photos?.[0] ? photoUrl : undefined}
          alt={listing.title}
          isJob={!!listing.is_job_listing}
          className="w-full h-full"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="font-medium line-clamp-1">{listing.title}</h3>
          {listing.is_job_listing ? (
            <p className="text-sm font-bold mt-1 text-primary">{t("badge.job_offer")}</p>
          ) : (
            <p className="text-lg font-bold mt-1">{formatPrice(listing.price)}</p>
          )}
          {isBoosted && (
            <div className="mt-1">
              <BoostedBadge />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span className="truncate">
            {listing.city}
            {listing.district ? ` (${listing.district})` : ""}
          </span>
          <TimeAgo date={listing.created_at} />
        </div>
      </div>

      {onToggleFavorite && (
        <div className="shrink-0">
          <FavoriteButton isFavorited={isFavorited} onToggle={(e) => onToggleFavorite(e, listing.id)} />
        </div>
      )}
    </Link>
  )
}
