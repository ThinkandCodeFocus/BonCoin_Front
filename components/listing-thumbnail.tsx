"use client"

import { Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

interface ListingThumbnailProps {
  src?: string
  alt: string
  isJob?: boolean
  className?: string
}

/**
 * Affiche la photo d'une annonce, ou une icône dédiée pour les offres
 * d'emploi (qui n'ont pas de vraie photo côté source) plutôt que le
 * placeholder générique.
 */
export function ListingThumbnail({ src, alt, isJob, className }: ListingThumbnailProps) {
  if (!src && isJob) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
        <Briefcase className="w-8 h-8" />
      </div>
    )
  }

  return (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      onError={(e) => {
        e.currentTarget.src = "/placeholder.svg"
      }}
      className={cn("object-cover", className)}
    />
  )
}
