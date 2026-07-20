"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useFavorites } from "@/contexts/FavoritesContext"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/I18nProvider"
import { annonceService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ListingCard, type ListingCardData } from "@/components/listing-card"
import { SkeletonCard, EmptyState } from "@/components/design-system"

export function FeaturedListings() {
  const [listings, setListings] = useState<ListingCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, cityFilter, districtFilter])

  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadAnnonces = async (page = 1) => {
    if (page === 1) setIsLoading(true)
    else setIsLoadingMore(true)

    const params: any = { page }
    if (cityFilter) params.city = cityFilter
    if (districtFilter) params.district = districtFilter

    const result = await annonceService.getAll(params)
    if (result.success && (result as any).data) {
      const data = (result as any).data
      setListings((prev) => (page === 1 ? data.data || [] : [...prev, ...(data.data || [])]))
      const meta = data.meta || data?.data?.meta
      if (meta) {
        setCurrentPage(meta.current_page || page)
        setTotalPages(meta.last_page || 1)
      }
    }
    setIsLoading(false)
    setIsLoadingMore(false)
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

    if (isFavorited(annonceId)) {
      await removeFavorite(annonceId)
      toast({ title: t("toast.removed_fav") })
    } else {
      await addFavorite(annonceId)
      toast({ title: t("toast.added_fav") })
    }
  }

  const isRecentlyAdded = (dateString: string) => {
    const diffHours = (Date.now() - new Date(dateString).getTime()) / 3600000
    return diffHours < 24
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!listings.length) {
    return <EmptyState title="Aucune annonce disponible pour le moment" description="Revenez plus tard ou déposez une annonce" />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isFavorited={isFavorited(listing.id)}
            onToggleFavorite={toggleFavorite}
            isRecentlyAdded={isRecentlyAdded(listing.created_at)}
          />
        ))}
      </div>

      {currentPage < totalPages && (
        <div className="text-center">
          <Button variant="outline" onClick={() => loadAnnonces(currentPage + 1)} disabled={isLoadingMore}>
            {isLoadingMore ? "Chargement..." : "Charger plus d'annonces"}
          </Button>
        </div>
      )}
    </div>
  )
}
