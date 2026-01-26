"use client"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, SlidersHorizontal, MapPin, Search, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { annonceService, favoriteService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Annonce {
  id: number
  title: string
  price: number
  city: string
  district: string
  photos?: string[]
  created_at: string
}

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category") || ""
  const initialSearch = searchParams.get("search") || ""

  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [listings, setListings] = useState<Annonce[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [favorites, setFavorites] = useState<number[]>([])
  const [cityFilter, setCityFilter] = useState(searchParams.get("city") || "")
  const [districtFilter, setDistrictFilter] = useState(searchParams.get("district") || "")
  const [etatFilter, setEtatFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [distanceKm, setDistanceKm] = useState(5)
  const [filtersVersion, setFiltersVersion] = useState(0)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setSearchQuery(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    setCityFilter(searchParams.get("city") || "")
    setDistrictFilter(searchParams.get("district") || "")
  }, [searchParams])

  useEffect(() => {
    loadListings()
    if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated, selectedCategory, filtersVersion])

  const applyFilters = () => setFiltersVersion((v) => v + 1)

  const loadListings = async () => {
    setIsLoading(true)
    const params: any = { page: 1 }

    if (searchQuery.trim()) params.search = searchQuery.trim()
    if (selectedCategory) params.category = selectedCategory

    params.min_price = priceRange[0]
    params.max_price = priceRange[1]
    if (etatFilter) params.etat = etatFilter
    if (statusFilter) params.status = statusFilter
    if (cityFilter) params.city = cityFilter
    if (districtFilter) params.district = districtFilter
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (distanceKm) params.distance_km = distanceKm

    const result = await annonceService.getAll(params)
    if (result.success && result.data) {
      setListings(result.data.data || [])
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

  const isUrgent = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const hoursDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    return hoursDiff <= 48
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        <div className="bg-card border-b p-4">
          <div className="max-w-6xl mx-auto flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-md px-3 py-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
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
                    <Label>Localisation</Label>
                    <div className="grid gap-2 mt-2">
                      <Input
                        placeholder="Ville (ex: Dakar)"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                      />
                      <Input
                        placeholder="Quartier (ex: Ouakam)"
                        value={districtFilter}
                        onChange={(e) => setDistrictFilter(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Etat</Label>
                    <Select value={etatFilter} onValueChange={setEtatFilter}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Tous les etats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Neuf">Neuf</SelectItem>
                        <SelectItem value="Bon état">Bon état</SelectItem>
                        <SelectItem value="Usagé">Usagé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Disponibilite</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Réservé">Réservé</SelectItem>
                        <SelectItem value="Vendu">Vendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date de publication</Label>
                    <div className="grid gap-2 mt-2">
                      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                      <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label>Distance (km)</Label>
                    <div className="mt-4">
                      <Slider
                        value={[distanceKm]}
                        onValueChange={(value) => setDistanceKm(value[0])}
                        max={50}
                        step={1}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0 km</span>
                        <span>{distanceKm} km</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={applyFilters}>
                    Appliquer les filtres
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {listings.length} annonces trouvées
                {selectedCategory && " dans la catégorie sélectionnée"}
              </p>
              {selectedCategory && (
                <div className="mt-2">
                  <Link href="/listings">
                    <Badge variant="secondary" className="cursor-pointer">
                      Catégorie filtrée ✖
                    </Badge>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Aucune annonce trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => {
                const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"
                const photoUrl =
                  listing.photos && listing.photos.length > 0 && listing.photos[0]
                    ? listing.photos[0].startsWith("http")
                      ? listing.photos[0]
                      : `${apiBase}/storage/${listing.photos[0]}`
                    : "/placeholder.svg"

                return (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={photoUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-3 right-3 rounded-full w-9 h-9"
                          onClick={(e) => toggleFavorite(e, listing.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${favorites.includes(listing.id) ? "fill-current text-destructive" : ""}`}
                          />
                        </Button>
                        {isUrgent(listing.created_at) && (
                          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
                        <p className="text-2xl font-bold text-primary mb-2">{formatPrice(listing.price)}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {listing.city}, {listing.district}
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
