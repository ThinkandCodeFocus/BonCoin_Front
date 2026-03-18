"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Heart, Clock } from "lucide-react"
import { 
  Card, 
  CardListing, 
  Badge, 
  Button 
} from "@/components/ui"
import { 
  FavoriteButton, 
  PriceBadge, 
  StatusBadge, 
  BoostedBadge, 
  TimeAgo,
  EmptyState,
  SkeletonCard,
  SectionHeader
} from "@/components/design-system"
import { useAuth } from "@/contexts/AuthContext"
import { useFavorites } from "@/contexts/FavoritesContext"
import { useToast } from "@/hooks/use-toast"
import { resolveStorageUrl } from "@/lib/media"

import { useI18n } from "@/components/I18nProvider"
import { annonceService } from "@/lib/api"

interface Annonce {
  id: number
  title: string
  price: number
  city: string
  district: string
  etat?: string
  boosted_until: string | null
  photos?: string[]
  created_at: string
}

export function FeaturedListings() {
  const [listings, setListings] = useState<Annonce[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [cityFilter, setCityFilter] = useState("")
  const [districtFilter, setDistrictFilter] = useState("")
  
  const { isAuthenticated } = useAuth()
  const { isFavorited, addFavorite, removeFavorite } = useFavorites()
  const { toast } = useToast()
  const { t } = useI18n()

  useEffect(() => {
    const savedCity = localStorage.getItem("location_city") || ""
    const savedDistrict = localStorage.getItem("location_district") || ""
    setCityFilter(savedCity)
    setDistrictFilter(savedDistrict)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    loadAnnonces(1)
  }, [isAuthenticated, cityFilter, districtFilter])

  const loadAnnonces = async (page = currentPage) => {
    setIsLoading(true)
    const params: any = { page }
    if (cityFilter) params.city = cityFilter
    if (districtFilter) params.district = districtFilter
    
    const result = await annonceService.getAll(params)
    if (result.success && (result as any).data) {
      const data = (result as any).data
      setListings(data.data || [])
      const meta = data.meta || data?.data?.meta
      if (meta) {
        setCurrentPage(meta.current_page || page)
        setTotalPages(meta.last_page || 1)
        setTotalItems(meta.total || (data.data || []).length)
      }
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (e: React.MouseEvent, annonceId: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast({
        title: t("toast.login_required"),
        description: t("toast.login_required_desc"),
        variant: "destructive",
      })
      return
    }

    const isFavoritedNow = isFavorited(annonceId)

    if (isFavoritedNow) {
      await removeFavorite(annonceId)
      toast({ title: t("toast.removed_fav") })
    } else {
      await addFavorite(annonceId)
      toast({ title: t("toast.added_fav") })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + "FCFA"
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t("time.just_now") || "À l'instant"
    if (diffMins < 60) return `${t("time.ago") || "Il y a"} ${diffMins}min`
    if (diffHours < 24) return `${t("time.ago") || "Il y a"} ${diffHours}h`
    if (diffDays < 7) return `${t("time.ago") || "Il y a"} ${diffDays}j`
    return date.toLocaleDateString("fr-FR")
  }

  const getStatusBadge = (etat?: string) => {
    if (!etat) return null
    const statusMap: Record<string, { class: string; label: string }> = {
      "Neuf": { class: "status-new", label: "Neuf" },
      "Bon état": { class: "status-good", label: "Bon état" },
      "Usagé": { class: "status-used", label: "Usagé" },
    }
    const status = statusMap[etat] || { class: "bg-muted text-muted-foreground", label: etat }
    return <span className={`status-badge ${status.class}`}>{status.label}</span>
  }

  const isRecentlyAdded = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / 3600000
    return diffHours < 24
  }

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="overflow-hidden group cursor-pointer border-border/60 bg-card/90 rounded-xl">
      <div className="relative aspect-4/3 shimmer-card" />
      <div className="p-5 space-y-3">
        <div className="h-6 shimmer-card rounded-md w-3/4" />
        <div className="h-8 shimmer-card rounded-md w-1/2" />
        <div className="h-4 shimmer-card rounded-md w-2/3" />
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

    if (!listings.length) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <MapPin className="w-8 h-8 text-muted-foreground" />
        </div>
        <p data-i18n="listings.no_results" className="text-muted-foreground text-lg">Aucune annonce disponible pour le moment</p>
        <p data-i18n="listings.no_results_help" className="text-sm text-muted-foreground mt-2">Revenez plus tard ou déposez une annonce</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {listings.map((listing) => {
          const isListingFavorited = isFavorited(listing.id)
          const photoUrl = resolveStorageUrl(listing.photos?.[0])
          const isNew = isRecentlyAdded(listing.created_at)

          return (
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <Card className="overflow-hidden group cursor-pointer border-border/60 bg-card/90 card-lift card-glow rounded-xl">
                <div className="relative aspect-4/3 overflow-hidden bg-muted image-overlay">
                  <img
                    src={photoUrl}
                    alt={listing.title}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Top badges row */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex gap-2">
                                {listing.boosted_until && new Date(listing.boosted_until) > new Date() && (
                                  <Badge className="bg-accent text-accent-foreground shadow-lg font-semibold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span data-i18n="badge.featured">Vedette</span>
                                  </Badge>
                                )}
                                {isNew && !listing.boosted_until && (
                                  <Badge className="bg-emerald-500 text-white shadow-lg font-semibold">
                                    <span data-i18n="badge.new">Nouveau</span>
                                  </Badge>
                                )}
                    </div>
                    
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`rounded-full w-10 h-10 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                        isListingFavorited 
                          ? "bg-destructive text-destructive-foreground scale-110" 
                          : "bg-background/80 hover:bg-background"
                      }`}
                      onClick={(e) => toggleFavorite(e, listing.id)}
                    >
                      <Heart className={`w-4 h-4 ${isListingFavorited ? "fill-current heart-animate" : ""}`} />
                    </Button>
                  </div>

                  {/* Status badge overlay */}
                  {getStatusBadge(listing.etat) && (
                    <div className="absolute bottom-4 left-4">
                      {getStatusBadge(listing.etat)}
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xl font-bold text-primary tracking-tight">{formatPrice(listing.price)}</p>
                    <div className="time-ago">
                      <Clock className="w-3 h-3" />
                      <span>{getRelativeTime(listing.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0 text-accent" />
                    <span className="truncate">{listing.city}, {listing.district}</span>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-8 border-t border-border/60">
          <p className="text-sm text-muted-foreground">
            Page <span className="font-semibold text-foreground">{currentPage}</span> / {totalPages} • {totalItems} <span data-i18n="category.annonces">annonces</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => loadAnnonces(currentPage - 1)}
              className="hover-scale"
            >
              <span data-i18n="pagination.prev">Précédent</span>
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => loadAnnonces(currentPage + 1)}
              className="hover-scale"
            >
              <span data-i18n="pagination.next">Suivant</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
