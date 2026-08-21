"use client"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import { useI18n } from "@/components/I18nProvider"
import fr from "@/locales/fr.json"
import wo from "@/locales/wo.json"

/**
 * getRelativeTime n'est pas un composant : on ne peut pas y appeler
 * useI18n(). On lit la langue directement dans localStorage, comme le
 * fait deja getHeaders() dans lib/api.ts pour Accept-Language.
 */
function tRaw(key: string): string {
  const lang = (typeof window !== "undefined" && localStorage.getItem("lang")) || "fr"
  const dict: Record<string, string> = lang === "wo" ? (wo as Record<string, string>) : (fr as Record<string, string>)
  return dict[key] || (fr as Record<string, string>)[key] || key
}

/* ============================================
   HELPERS
   ============================================ */

/** Format un prix en FCFA, format français : "1 200 fcfa" (espace insécable). */
function formatPrice(price: number | string): string {
  const value = typeof price === "string" ? Number(price) : price
  if (!Number.isFinite(value)) return `${price} fcfa`
  return `${new Intl.NumberFormat("fr-FR").format(value)} fcfa`
}

function getRelativeTime(dateString: string | Date): string {
  const dateObj = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return tRaw("time.just_now")
  if (diffMins < 60) return `${tRaw("time.ago")} ${diffMins} ${tRaw("time.minutes")}`
  if (diffHours < 24) return `${tRaw("time.ago")} ${diffHours} ${tRaw("time.hours")}`
  if (diffDays < 7) return `${tRaw("time.ago")} ${diffDays} ${tRaw("time.days")}`
  return dateObj.toLocaleDateString("fr-FR")
}

/* ============================================
   COMPOSANTS SOBRES
   ============================================ */

/* Statut d'annonce (Neuf / Bon état / Occasion) - texte + bordure fine */
interface StatusBadgeProps {
  status: "new" | "good" | "used" | string
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useI18n()
  const statusMap: Record<string, { label: string; variant: "new" | "good" | "used" }> = {
    "Neuf": { label: t("condition.new"), variant: "new" },
    "Bon état": { label: t("condition.good"), variant: "good" },
    "Usagé": { label: t("condition.used_badge"), variant: "used" },
    new: { label: t("condition.new"), variant: "new" },
    good: { label: t("condition.good"), variant: "good" },
    used: { label: t("condition.used_badge"), variant: "used" },
  }

  const config = statusMap[status] || { label: status, variant: "new" as const }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

/* Badge "Vedette" pour une annonce boostée - discret, texte */
function BoostedBadge({ className }: { className?: string }) {
  const { t } = useI18n()
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground", className)}>
      {t("badge.featured")}
    </span>
  )
}

/* Date relative en français, texte gris sobre */
interface TimeAgoProps {
  date: string | Date
  className?: string
}

function TimeAgo({ date, className }: TimeAgoProps) {
  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      {getRelativeTime(date)}
    </span>
  )
}

/* Bouton favoris - icône coeur simple, sans scale ni animation */
interface FavoriteButtonProps {
  isFavorited: boolean
  onToggle: (e: React.MouseEvent) => void
  className?: string
}

function FavoriteButton({ isFavorited, onToggle, className }: FavoriteButtonProps) {
  const { t } = useI18n()
  return (
    <Button
      size="icon-sm"
      variant="secondary"
      className={cn(
        "border",
        isFavorited && "text-destructive",
        className
      )}
      onClick={onToggle}
      aria-label={isFavorited ? t("favorites.remove") : t("favorites.add")}
    >
      <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
    </Button>
  )
}

/* Etat vide sobre : texte centré, pas d'icone geante */
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {Icon && <Icon className="w-6 h-6 text-muted-foreground mx-auto mb-3" />}
      <p className="font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* En-tete de section compact */
interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

/* Squelette de chargement - blocs gris en pulse d'opacite */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden border rounded-lg", className)}>
      <div className="relative aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-5 skeleton rounded w-1/2" />
        <div className="h-3 skeleton rounded w-2/3" />
      </div>
    </div>
  )
}

/* Safe area bas d'ecran (mobile) */
function SafeAreaBottom({ className }: { className?: string }) {
  return <div className={cn("pb-safe", className)} />
}

export {
  formatPrice,
  getRelativeTime,
  StatusBadge,
  BoostedBadge,
  TimeAgo,
  FavoriteButton,
  EmptyState,
  SectionHeader,
  SkeletonCard,
  SafeAreaBottom,
}

/* Re-export des composants UI courants */
export { Button, buttonVariants }
export { Card }
export { Badge }
