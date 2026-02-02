"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useFavorites } from "@/contexts/FavoritesContext"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { resolveStorageUrl } from "@/lib/media"

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth()
  const { favoriteItems, removeFavorite } = useFavorites()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    console.log("🎯 FavoritesPage - favoriteItems from context:", favoriteItems)
    if (!isAuthenticated) {
      router.push("/")
      return
    }
  }, [isAuthenticated, router, favoriteItems])

  const handleRemoveFavorite = async (annonceId: number) => {
    await removeFavorite(annonceId)
    toast({ title: "Retire des favoris" })
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

          {favoriteItems.length === 0 ? (
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
              {favoriteItems.map((item) => {
                const photoUrl = resolveStorageUrl(item.annonce?.photos?.[0])

                return (
                  <Link key={item.id} href={`/listings/${item.annonce?.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={photoUrl}
                          alt={item.annonce?.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-3 right-3 rounded-full w-9 h-9"
                          onClick={(e) => {
                            e.preventDefault()
                            handleRemoveFavorite(item.annonce_id)
                          }}
                        >
                          <Heart className="w-4 h-4 fill-current text-destructive" />
                        </Button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.annonce?.title}</h3>
                        <p className="text-2xl font-bold text-primary mb-2">{formatPrice(item.annonce?.price)}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.annonce?.city}, {item.annonce?.district}
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
