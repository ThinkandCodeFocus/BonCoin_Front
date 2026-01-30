"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { annonceService, favoriteService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { resolveStorageUrl } from "@/lib/media"

interface Annonce {
  id: number
  title: string
  price: number
  city: string
  district: string
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
  const [favorites, setFavorites] = useState<number[]>([])
  const [cityFilter, setCityFilter] = useState("")
  const [districtFilter, setDistrictFilter] = useState("")
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const savedCity = localStorage.getItem("location_city") || ""
    const savedDistrict = localStorage.getItem("location_district") || ""
    setCityFilter(savedCity)
    setDistrictFilter(savedDistrict)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    loadAnnonces(1)
    if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated, cityFilter, districtFilter])

  const loadAnnonces = async (page = currentPage) => {
    setIsLoading(true)
    const params: any = { page }
    if (cityFilter) params.city = cityFilter
    if (districtFilter) params.district = districtFilter
    const result = await annonceService.getAll(params)
    if (result.success && result.data) {
      setListings(result.data.data || [])
      const meta = result.data.meta || result.data?.data?.meta
      if (meta) {
        setCurrentPage(meta.current_page || page)
        setTotalPages(meta.last_page || 1)
        setTotalItems(meta.total || (result.data.data || []).length)
      } else {
        setCurrentPage(page)
        setTotalPages(1)
        setTotalItems((result.data.data || []).length)
      }
    }
    setIsLoading(false)
  }

  const loadFavorites = async () => {
    const result = await favoriteService.getAll()
    if (result.success && result.data) {
      const favoriteIds = result.data.map((fav: any) => fav.annonce?.id || fav.annonce_id)
      setFavorites(favoriteIds)
    }
  }

  const toggleFavorite = async (e: React.MouseEvent, annonceId: number) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour ajouter aux favoris",
        variant: "destructive",
      })
      return
    }

    const isFavorite = favorites.includes(annonceId)

    if (isFavorite) {
      const result = await favoriteService.remove(annonceId)
      if (result.success) {
        setFavorites(favorites.filter((id) => id !== annonceId))
        toast({ title: "Retiré des favoris" })
      }
    } else {
      const result = await favoriteService.add(annonceId)
      if (result.success) {
        setFavorites([...favorites, annonceId])
        toast({ title: "Ajouté aux favoris" })
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA"
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!listings.length) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Aucune annonce disponible pour le moment</p>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {listings.map((listing) => {
          const isFavorited = favorites.includes(listing.id)
          const photoUrl = resolveStorageUrl(listing.photos?.[0])

          return (
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <Card className="overflow-hidden group cursor-pointer border-border/60 bg-card/90 card-animate">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={photoUrl}
                    alt={listing.title}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Button
                    size="icon"
                    variant="secondary"
                    className={`absolute top-4 right-4 rounded-full w-10 h-10 shadow-lg backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                      isFavorited ? "bg-destructive text-destructive-foreground" : "bg-background/80"
                    }`}
                    onClick={(e) => toggleFavorite(e, listing.id)}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                  </Button>
                  {listing.boosted_until && new Date(listing.boosted_until) > new Date() && (
                    <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground shadow-lg font-semibold">
                      En vedette
                    </Badge>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-3 tracking-tight">{formatPrice(listing.price)}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{listing.city}, {listing.district}</span>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} / {totalPages} - {totalItems} annonces
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => loadAnnonces(currentPage - 1)}
            >
              Precedent
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => loadAnnonces(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
