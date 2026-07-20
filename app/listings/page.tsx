"use client"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal, Search, LayoutGrid, List as ListIcon } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { annonceService, favoriteService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { getUserLocation, getCityCoordinates } from "@/lib/geolocation"
import { ListingCard, type ListingCardData } from "@/components/listing-card"
import { ListingRow } from "@/components/listing-row"
import { ListingPagination } from "@/components/listing-pagination"
import { SkeletonCard, EmptyState } from "@/components/design-system"

type SortOption = "recent" | "price_asc" | "price_desc"

function FiltersForm({
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  locationFilter,
  setLocationFilter,
  etatFilter,
  setEtatFilter,
  radiusKm,
  setRadiusKm,
  onReset,
  onApply,
}: {
  priceMin: string
  setPriceMin: (v: string) => void
  priceMax: string
  setPriceMax: (v: string) => void
  locationFilter: string
  setLocationFilter: (v: string) => void
  etatFilter: string
  setEtatFilter: (v: string) => void
  radiusKm: string
  setRadiusKm: (v: string) => void
  onReset: () => void
  onApply: () => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label>Prix</Label>
        <div className="flex items-center gap-2 mt-2">
          <Input placeholder="Min" type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
          <span className="text-muted-foreground text-sm">à</span>
          <Input placeholder="Max" type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Localisation</Label>
        <Input
          id="location"
          placeholder="Ville ou code postal"
          className="mt-2"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="etat">État</Label>
        <Select value={etatFilter || "all"} onValueChange={(v) => setEtatFilter(v === "all" ? "" : v)}>
          <SelectTrigger id="etat" className="mt-2">
            <SelectValue placeholder="Tous les états" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les états</SelectItem>
            <SelectItem value="Neuf">Neuf</SelectItem>
            <SelectItem value="Bon état">Bon état</SelectItem>
            <SelectItem value="Usagé">Usagé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="radius">Rayon</Label>
        <Select value={radiusKm} onValueChange={setRadiusKm}>
          <SelectTrigger id="radius" className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 km</SelectItem>
            <SelectItem value="10">10 km</SelectItem>
            <SelectItem value="20">20 km</SelectItem>
            <SelectItem value="50">50 km</SelectItem>
            <SelectItem value="0">Toute la France</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onReset}>
          Réinitialiser
        </Button>
        <Button className="flex-1" onClick={onApply}>
          Appliquer
        </Button>
      </div>
    </div>
  )
}

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [listings, setListings] = useState<ListingCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [etatFilter, setEtatFilter] = useState("")
  const [radiusKm, setRadiusKm] = useState("10")
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [favorites, setFavorites] = useState<number[]>([])
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  const selectedCategory = searchParams.get("category") || ""
  const urlLocation = searchParams.get("location") || ""
  const urlSearch = searchParams.get("search") || ""

  useEffect(() => {
    if (urlLocation) setLocationFilter(urlLocation)
    if (urlSearch) setSearchQuery(urlSearch)
  }, [urlLocation, urlSearch])

  useEffect(() => {
    setCurrentPage(1)
    loadListings(1)
    if (isAuthenticated) {
      loadFavorites()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedCategory])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1)
      loadListings(1)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const loadListings = async (page = currentPage) => {
    setIsLoading(true)
    const params: any = { page }

    if (searchQuery) params.search = searchQuery
    if (selectedCategory) params.category = selectedCategory

    try {
      const userLocation = await getUserLocation()
      const radius = Number(radiusKm)
      if (radius > 0) {
        if (userLocation) {
          params.user_lat = userLocation.lat
          params.user_lng = userLocation.lng
          params.distance_km = radius
        } else {
          const savedCity = localStorage.getItem("location_city")
          if (savedCity) {
            const cityCoords = getCityCoordinates(savedCity)
            if (cityCoords) {
              params.user_lat = cityCoords.lat
              params.user_lng = cityCoords.lng
              params.distance_km = radius
            }
          }
        }
      }
    } catch {
      // géolocalisation indisponible, on continue sans filtre de distance
    }

    const result = await annonceService.getAll(params)
    if (result.success && result.data) {
      const listingsData = result.data.data || []
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
      } else {
        toast({ title: "Erreur", description: result.message || "Impossible de retirer", variant: "destructive" })
      }
    } else {
      const result = await favoriteService.add(annonceId)
      if (result.success) {
        setFavorites((prev) => [...prev, annonceId])
        toast({ title: "Ajouté aux favoris" })
      } else {
        toast({ title: "Erreur", description: result.message || "Impossible d'ajouter", variant: "destructive" })
      }
    }
  }

  const resetFilters = () => {
    setPriceMin("")
    setPriceMax("")
    setLocationFilter("")
    setEtatFilter("")
    setRadiusKm("10")
    setCurrentPage(1)
    loadListings(1)
  }

  const filteredListings = listings
    .filter((listing: any) => {
      if (priceMin && listing.price < Number(priceMin)) return false
      if (priceMax && listing.price > Number(priceMax)) return false

      if (locationFilter) {
        const location = locationFilter.toLowerCase()
        const cityMatch = listing.city?.toLowerCase().includes(location)
        const districtMatch = listing.district?.toLowerCase().includes(location)
        if (!cityMatch && !districtMatch) return false
      }

      if (etatFilter && listing.etat !== etatFilter) return false

      return true
    })
    .sort((a: any, b: any) => {
      if (sortBy === "price_asc") return a.price - b.price
      if (sortBy === "price_desc") return b.price - a.price
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4">
        <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">Accueil</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Annonces</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 border rounded-md px-3 py-2 bg-card">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadListings()}
                className="border-0 shadow-none px-0 h-auto focus-visible:ring-0"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Filtres</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtres de recherche</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersForm
                    priceMin={priceMin}
                    setPriceMin={setPriceMin}
                    priceMax={priceMax}
                    setPriceMax={setPriceMax}
                    locationFilter={locationFilter}
                    setLocationFilter={setLocationFilter}
                    etatFilter={etatFilter}
                    setEtatFilter={setEtatFilter}
                    radiusKm={radiusKm}
                    setRadiusKm={setRadiusKm}
                    onReset={resetFilters}
                    onApply={() => loadListings(1)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="hidden lg:block">
            <div className="border rounded-md p-4 bg-card sticky top-20">
              <h2 className="font-semibold text-sm mb-4">Filtres</h2>
              <FiltersForm
                priceMin={priceMin}
                setPriceMin={setPriceMin}
                priceMax={priceMax}
                setPriceMax={setPriceMax}
                locationFilter={locationFilter}
                setLocationFilter={setLocationFilter}
                etatFilter={etatFilter}
                setEtatFilter={setEtatFilter}
                radiusKm={radiusKm}
                setRadiusKm={setRadiusKm}
                onReset={resetFilters}
                onApply={() => loadListings(1)}
              />
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Chargement..." : `${totalItems || filteredListings.length} annonces`}
                </p>
                {selectedCategory && (
                  <Link href="/listings">
                    <Badge variant="secondary" className="mt-1 cursor-pointer">
                      Catégorie filtrée ✕
                    </Badge>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Le plus récent</SelectItem>
                    <SelectItem value="price_asc">Prix croissant</SelectItem>
                    <SelectItem value="price_desc">Prix décroissant</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon-sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode("list")}
                    aria-label="Vue liste"
                  >
                    <ListIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon-sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode("grid")}
                    aria-label="Vue grille"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Aucune annonce ne correspond à votre recherche"
                description="Essayez de modifier vos critères de recherche"
              />
            ) : (
              <div className="space-y-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        isFavorited={favorites.includes(listing.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredListings.map((listing) => (
                      <ListingRow
                        key={listing.id}
                        listing={listing}
                        isFavorited={favorites.includes(listing.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                )}

                <ListingPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => loadListings(page)}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
