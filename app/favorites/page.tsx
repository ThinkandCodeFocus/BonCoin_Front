"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { favoriteService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Favorite {
  id: number
  annonce_id: number
  annonce: {
    id: number
    title: string
    price: number
    city: string
    district: string
    photos?: string[]
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    loadFavorites()
  }, [isAuthenticated])

  const loadFavorites = async () => {
    setIsLoading(true)
    const result = await favoriteService.getAll()
    if (result.success && result.data) {
      setFavorites(Array.isArray(result.data) ? result.data : [])
    }
    setIsLoading(false)
  }

  const removeFavorite = async (annonceId: number) => {
    const result = await favoriteService.remove(annonceId)
    if (result.success) {
      setFavorites(favorites.filter((fav) => fav.annonce_id !== annonceId))
      toast({ title: "Retiré des favoris" })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA"
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mes Favoris</h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : favorites.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Aucun favori</h2>
              <p className="text-muted-foreground mb-6">Commencez à ajouter des annonces à vos favoris</p>
              <Link href="/listings">
                <Button>Parcourir les annonces</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((item) => {
                const photoUrl = item.annonce.photos?.[0]
                  ? (item.annonce.photos[0].startsWith('http') 
                      ? item.annonce.photos[0] 
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${item.annonce.photos[0]}`)
                  : "/placeholder.svg"

                return (
                  <Link key={item.id} href={`/listings/${item.annonce.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={photoUrl}
                          alt={item.annonce.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-3 right-3 rounded-full w-9 h-9"
                          onClick={(e) => {
                            e.preventDefault()
                            removeFavorite(item.annonce_id)
                          }}
                        >
                          <Heart className="w-4 h-4 fill-current text-destructive" />
                        </Button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.annonce.title}</h3>
                        <p className="text-2xl font-bold text-primary mb-2">{formatPrice(item.annonce.price)}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.annonce.city}, {item.annonce.district}
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
