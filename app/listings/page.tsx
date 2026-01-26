"use client"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
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
  etat: string
  photos?: string[]
  created_at: string
}

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [listings, setListings] = useState<Annonce[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
    loadListings()
    if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated, selectedCategory])

  // Effet séparé pour la recherche avec délai
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadListings()
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const loadListings = async () => {
    setIsLoading(true)
    const params: any = { page: 1 }
    
    if (searchQuery) {
      params.search = searchQuery
    }
    
    if (selectedCategory) {
      params.category = selectedCategory
      console.log('Filtering by category:', selectedCategory)
    }

    // Ajouter la localisation de l'utilisateur
    const savedLocation = localStorage.getItem('userLocation')
    if (savedLocation) {
      const location = JSON.parse(savedLocation)
      params.city = location.city
      params.district = location.district
      console.log('Filtering by location:', location)
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
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-md px-3 py-2">
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
                    <Label htmlFor="location">Localisation</Label>
                    <Input 
                      id="location" 
                      placeholder="Ville ou quartier" 
                      className="mt-2"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="etat">État</Label>
                    <select
                      id="etat"
                      className="w-full mt-2 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      className="flex-1"
                      onClick={() => {
                        setPriceRange([0, 10000000])
                        setLocationFilter("")
                        setEtatFilter("")
                      }}
                    >
                      Réinitialiser
                    </Button>
                    <Button className="flex-1">
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
                {filteredListings.length} annonces trouvées
                {selectedCategory && " dans la catégorie sélectionnée"}
              </p>
              {selectedCategory && (
                <div className="mt-2">
                  <Link href="/listings">
                    <Badge variant="secondary" className="cursor-pointer">
                      Catégorie filtrée ✕
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
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Aucune annonce trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const photoUrl = listing.photos && listing.photos.length > 0 && listing.photos[0]
                  ? (listing.photos[0].startsWith('http') 
                      ? listing.photos[0] 
                      : `http://localhost:8000/storage/${listing.photos[0]}`)
                  : "/placeholder.svg"
                
                console.log('Listing:', listing.title, 'Photo URL:', photoUrl)

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
                            className={`w-4 h-4 ${favorites.includes(listing.id) ? 'fill-current text-destructive' : ''}`} 
                          />
                        </Button>
                        {isUrgent(listing.created_at) && (
                          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">Urgent</Badge>
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
