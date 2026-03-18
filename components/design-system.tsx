"use client"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardGlass, CardGlow } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, Zap, Clock, MapPin, Sparkles } from "lucide-react"

/* ============================================
   DESIGN SYSTEM COMPONENTS
   ============================================ */

/* Feature Card - Used for hero features */
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  className?: string
}

function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn("glass-card rounded-full px-5 py-2.5 flex items-center gap-2.5", className)}>
      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <span className="text-sm font-medium text-foreground">{title}</span>
    </div>
  )
}

/* Price Badge */
interface PriceBadgeProps {
  price: string | number
  className?: string
}

function PriceBadge({ price, className }: PriceBadgeProps) {
  return (
    <div className={cn(
      "rounded-xl bg-white/90 dark:bg-slate-900/90 px-4 py-2.5 backdrop-blur-sm shadow-lg",
      "flex items-center justify-between gap-3",
      className
    )}>
      <p className="text-xs text-muted-foreground">Prix</p>
      <span className="text-lg font-bold text-primary">{price}</span>
    </div>
  )
}

/* Location Chip */
interface LocationChipProps {
  city: string
  district?: string
  className?: string
}

function LocationChip({ city, district, className }: LocationChipProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium",
      className
    )}>
      <MapPin className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{city}{district ? `, ${district}` : ''}</span>
    </span>
  )
}

/* Status Badge */
interface StatusBadgeProps {
  status: 'new' | 'good' | 'used' | string
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap: Record<string, { label: string; variant: 'new' | 'good' | 'used' }> = {
    'Neuf': { label: 'Neuf', variant: 'new' },
    'Bon état': { label: 'Bon état', variant: 'good' },
    'Usagé': { label: 'Occasion', variant: 'used' },
    'new': { label: 'Nouveau', variant: 'new' },
    'good': { label: 'Bon état', variant: 'good' },
    'used': { label: 'Occasion', variant: 'used' },
  }

  const config = statusMap[status] || { label: status, variant: 'new' as const }

  return (
    <Badge variant={config.variant} className={cn("shadow-sm", className)}>
      {config.label}
    </Badge>
  )
}

/* Boosted Badge */
interface BoostedBadgeProps {
  className?: string
}

function BoostedBadge({ className }: BoostedBadgeProps) {
  return (
    <Badge variant="boosted" className={cn("shadow-lg font-semibold flex items-center gap-1", className)}>
      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
      Vedette
    </Badge>
  )
}

/* Time Ago */
interface TimeAgoProps {
  date: string | Date
  className?: string
}

function TimeAgo({ date, className }: TimeAgoProps) {
  const getRelativeTime = (dateString: string | Date) => {
    const dateObj = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `${diffMins}min`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}j`
    return dateObj.toLocaleDateString("fr-FR")
  }

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
      <Clock className="w-3 h-3" />
      <span>Il y a {getRelativeTime(date)}</span>
    </span>
  )
}

/* Favorite Button */
interface FavoriteButtonProps {
  isFavorited: boolean
  onToggle: (e: React.MouseEvent) => void
  className?: string
}

function FavoriteButton({ isFavorited, onToggle, className }: FavoriteButtonProps) {
  return (
    <Button
      size="icon"
      variant="secondary"
      className={cn(
        "rounded-full w-10 h-10 shadow-lg backdrop-blur-sm transition-all duration-300",
        isFavorited 
          ? "bg-destructive text-destructive-foreground scale-110" 
          : "bg-background/80 hover:bg-background",
        className
      )}
      onClick={onToggle}
    >
      <Heart className={cn("w-4 h-4", isFavorited && "fill-current heart-animate")} />
    </Button>
  )
}

/* Hero Section Title */
interface HeroTitleProps {
  children: React.ReactNode
  highlight?: string
  className?: string
}

function HeroTitle({ children, highlight, className }: HeroTitleProps) {
  return (
    <h1 className={cn(
      "display-font text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight",
      highlight && (
        <>
          {' '}
          <span className="text-accent drop-shadow-sm">{highlight}</span>
        </>
      ),
      className
    )}>
      {children}
    </h1>
  )
}

/* CTA Button */
interface CTAButtonProps {
  href?: string
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  variant?: 'primary' | 'secondary' | 'glass'
}

function CTAButton({ 
  href, 
  children, 
  icon: Icon, 
  className, 
  variant = 'primary' 
}: CTAButtonProps) {
  const baseClass = "inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold hover-scale transition-all shadow-lg"
  
  const variants = {
    primary: "bg-accent text-white hover:bg-accent/90",
    secondary: "bg-white/20 backdrop-blur-sm border border-white/30 text-foreground hover:bg-white/30",
    glass: "bg-card/80 backdrop-blur-sm border border-border/60 hover:bg-card"
  }

  const buttonContent = (
    <>
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </>
  )

  if (href) {
    return (
      <a href={href} className={cn(baseClass, variants[variant], className)}>
        {buttonContent}
      </a>
    )
  }

  return (
    <button className={cn(baseClass, variants[variant], className)}>
      {buttonContent}
    </button>
  )
}

/* Stats Card */
interface StatsCardProps {
  value: string | number
  label: string
  className?: string
}

function StatsCard({ value, label, className }: StatsCardProps) {
  return (
    <div className={cn(
      "text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20",
      className
    )}>
      <p className="text-3xl md:text-4xl font-bold text-accent">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

/* Empty State */
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-20", className)}>
      {Icon && (
        <div className={cn(
          "inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4"
        )}>
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <p className="text-lg font-medium text-foreground mb-2">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}

/* Section Header */
interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-12", className)}>
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-lg">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

/* Loading Skeleton */
interface SkeletonCardProps {
  className?: string
}

function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("overflow-hidden border-border/60 bg-card/90 rounded-xl", className)}>
      <div className="relative aspect-4/3 shimmer-card" />
      <div className="p-5 space-y-3">
        <div className="h-6 shimmer-card rounded-md w-3/4" />
        <div className="h-8 shimmer-card rounded-md w-1/2" />
        <div className="h-4 shimmer-card rounded-md w-2/3" />
      </div>
    </div>
  )
}

/* Safe Area Bottom */
function SafeAreaBottom({ className }: { className?: string }) {
  return <div className={cn("pb-safe", className)} />
}

export {
  FeatureCard,
  PriceBadge,
  LocationChip,
  StatusBadge,
  BoostedBadge,
  TimeAgo,
  FavoriteButton,
  HeroTitle,
  CTAButton,
  StatsCard,
  EmptyState,
  SectionHeader,
  SkeletonCard,
  SafeAreaBottom,
}

/* Re-export common UI components */
export { Button, buttonVariants }
export { Card, CardGlass, CardGlow }
export { Badge }

