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
  const [favorites, setFavorites] = useState<number[]>([])
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadAnnonces()
    if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated])

  const loadAnnonces = async () => {
    setIsLoading(true)
    const result = await annonceService.getAll({ page: 1 })
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
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff <= 2
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {listings.map((listing) => {
        const isFavorited = favorites.includes(listing.id)
        const photoUrl = listing.photos?.[0] 
          ? (listing.photos[0].startsWith('http') 
              ? listing.photos[0] 
              : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${listing.photos[0]}`)
          : "/placeholder.svg"

        return (
          <Link key={listing.id} href={`/listings/${listing.id}`}>
            <Card className="overflow-hidden group cursor-pointer border-border/60 bg-card/90 card-animate">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={photoUrl}
                  alt={listing.title}
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
                {isUrgent(listing.created_at) && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground shadow-lg">
                    Urgent
                  </Badge>
                )}
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
  )
}
