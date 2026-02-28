"use client"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Heart, SlidersHorizontal, MapPin, Search, Loader2, Clock } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { annonceService, favoriteService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { getUserLocation, getCityCoordinates } from "@/lib/geolocation"
import { resolveStorageUrl } from "@/lib/media"

interface Annonce {
  id: number
  title: string
  price: number
  city: string
  district: string
  etat?: string
  photos?: string[]
  created_at: string
}

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [listings, setListings] = useState<Annonce[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [etatFilter, setEtatFilter] = useState("")
  const [favorites, setFavorites] = useState<number[]>([])
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Récupérer la catégorie depuis l'URL
  const selectedCategory = searchParams.get('category') || ''
  const urlLocation = searchParams.get('location') || ''
  const urlSearch = searchParams.get('search') || ''

  // Initialiser les valeurs depuis l'URL
  useEffect(() => {
    if (urlLocation) setLocationFilter(urlLocation)
    if (urlSearch) setSearchQuery(urlSearch)
  }, [urlLocation, urlSearch])

  useEffect(() => {
    console.log('Selected category:', selectedCategory)
    setCurrentPage(1)
    loadListings(1)
    if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated, selectedCategory])

  // Effet séparé pour la recherche avec délai
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1)
        loadListings(1)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const loadListings = async (page = currentPage) => {
    setIsLoading(true)
    const params: any = { page }
    
    if (searchQuery) {
      params.search = searchQuery
    }
    
    if (selectedCategory) {
      params.category = selectedCategory
      console.log('Filtering by category:', selectedCategory)
    }

    // Ajouter la géolocalisation pour le filtrage par distance
    try {
      const userLocation = await getUserLocation()
      if (userLocation) {
        params.user_lat = userLocation.lat
        params.user_lng = userLocation.lng
        params.distance_km = 10 // 10 km par défaut
        console.log('Using GPS location:', userLocation)
      } else {
        // Si pas de GPS, essayer d'utiliser la ville sauvegardée
        const savedCity = localStorage.getItem('location_city')
        if (savedCity) {
          const cityCoords = getCityCoordinates(savedCity)
          if (cityCoords) {
            params.user_lat = cityCoords.lat
            params.user_lng = cityCoords.lng
            params.distance_km = 20 // 20 km pour les villes
            console.log('Using city coords:', cityCoords)
          }
        }
      }
    } catch (error) {
      console.warn('Could not get location:', error)
    }
    
    console.log('API params:', params)
    const result = await annonceService.getAll(params)
    console.log('Listings API result:', result)
    if (result.success && result.data) {
      const listingsData = result.data.data || []
      console.log('Listings data:', listingsData)
      console.log('Number of listings:', listingsData.length)
      if (listingsData.length > 0) {
        console.log('First listing photos:', listingsData[0].photos)
      }
      setListings(listingsData)
      const meta = result.data.meta || result.data?.data?.meta
      if (meta) {
        setCurrentPage(meta.current_page || page)
        setTotalPages(meta.last_page || 1)
        setTotalItems(meta.total || listingsData.length)
      } else {
        setCurrentPage(page)
        setTotalPages(1)
        setTotalItems(listingsData.length)
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
        setFavorites((prev) => prev.filter((id) => id !== annonceId))
        toast({ title: "Retiré des favoris" })
        await loadFavorites()
      } else {
        toast({ title: "Erreur", description: result.message || "Impossible de retirer", variant: "destructive" })
      }
    } else {
      const result = await favoriteService.add(annonceId)
      if (result.success) {
        setFavorites((prev) => [...prev, annonceId])
        toast({ title: "Ajouté aux favoris" })
        await loadFavorites()
      } else {
        toast({ title: "Erreur", description: result.message || "Impossible d'ajouter", variant: "destructive" })
      }
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

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins}min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
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

  // Skeleton card for loading state
  const SkeletonCard = () => (
    <div className="overflow-hidden group cursor-pointer border-border/60 bg-card/90 rounded-xl">
      <div className="relative aspect-[4/3] shimmer-card" />
      <div className="p-5 space-y-3">
        <div className="h-6 shimmer-card rounded-md w-3/4" />
        <div className="h-8 shimmer-card rounded-md w-1/2" />
        <div className="h-4 shimmer-card rounded-md w-2/3" />
      </div>
    </div>
  )

  const filteredListings = listings.filter((listing) => {
    // Filtre par prix
    if (listing.price < priceRange[0] || listing.price > priceRange[1]) {
      return false
    }
    
    // Filtre par localisation
    if (locationFilter) {
      const location = locationFilter.toLowerCase()
      const cityMatch = listing.city?.toLowerCase().includes(location)
      const districtMatch = listing.district?.toLowerCase().includes(location)
      if (!cityMatch && !districtMatch) {
        return false
      }
    }
    
    // Filtre par état
    if (etatFilter && listing.etat !== etatFilter) {
      return false
    }
    
    return true
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        {/* Search Bar */}
        <div className="bg-card border-b p-4">
          <div className="max-w-6xl mx-auto flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadListings()}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  <SlidersHorizontal className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:inline">Filtres</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtres de recherche</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <Label>Prix (FCFA)</Label>
                    <div className="mt-4">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={10000000}
                        step={10000}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{priceRange[0].toLocaleString()}</span>
                        <span>{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Localisation</Label>
                    <Input 
                      id="location" 
                      placeholder="Ville ou quartier" 
                      className="mt-2 rounded-xl"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="etat">État</Label>
                    <select
                      id="etat"
                      className="w-full mt-2 flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={etatFilter}
                      onChange={(e) => setEtatFilter(e.target.value)}
                    >
                      <option value="">Tous les états</option>
                      <option value="Neuf">Neuf</option>
                      <option value="Bon état">Bon état</option>
                      <option value="Usagé">Usagé</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl"
                      onClick={() => {
                        setPriceRange([0, 10000000])
                        setLocationFilter("")
                        setEtatFilter("")
                      }}
                    >
                      Réinitialiser
                    </Button>
                    <Button className="flex-1 rounded-xl">
                      {filteredListings.length} résultats
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="max-w-6xl mx-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Chargement..." : `${filteredListings.length} annonces trouvées`}
                {selectedCategory && " dans la catégorie sélectionnée"}
              </p>
              {selectedCategory && (
                <div className="mt-2">
                  <Link href="/listings">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                      Catégorie filtrée ✕
                    </Badge>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">Aucune annonce trouvée</p>
              <p className="text-sm text-muted-foreground mt-2">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => {
                  const photoUrl = resolveStorageUrl(listing.photos?.[0])
                  const isFavorite = favorites.includes(listing.id)
                  const isNew = isRecentlyAdded(listing.created_at)
                  
                  console.log('Listing:', listing.title, 'Photo URL:', photoUrl)

                  return (
                    <Link key={listing.id} href={`/listings/${listing.id}`}>
                      <Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer card-lift card-glow rounded-xl">
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted image-overlay">
                          <img
                            src={photoUrl}
                            alt={listing.title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Badges row */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <div className="flex gap-2">
                              {isNew && (
                                <Badge className="bg-emerald-500 text-white shadow-lg font-semibold">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                            
                            <Button
                              size="icon"
                              variant="secondary"
                              className={`rounded-full w-9 h-9 transition-all duration-300 ${
                                isFavorite 
                                  ? "bg-destructive text-destructive-foreground scale-110" 
                                  : "bg-background/80 hover:bg-background"
                              }`}
                              onClick={(e) => toggleFavorite(e, listing.id)}
                            >
                              <Heart 
                                className={`w-4 h-4 ${isFavorite ? "fill-current heart-animate" : ""}`} 
                              />
                            </Button>
                          </div>

                          {/* Status badge */}
                          {getStatusBadge(listing.etat) && (
                            <div className="absolute bottom-3 left-3">
                              {getStatusBadge(listing.etat)}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {listing.title}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-2xl font-bold text-primary tracking-tight">{formatPrice(listing.price)}</p>
                            <div className="time-ago flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{getRelativeTime(listing.created_at)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1 text-accent flex-shrink-0" />
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
                    Page <span className="font-semibold text-foreground">{currentPage}</span> / {totalPages} • {totalItems} annonces
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage <= 1 || isLoading}
                      onClick={() => loadListings(currentPage - 1)}
                      className="rounded-xl hover-scale"
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      disabled={currentPage >= totalPages || isLoading}
                      onClick={() => loadListings(currentPage + 1)}
                      className="rounded-xl hover-scale"
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
