"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useFavorites } from "@/contexts/FavoritesContext"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ListingCard } from "@/components/listing-card"
import { EmptyState } from "@/components/design-system"

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth()
  const { favoriteItems, removeFavorite } = useFavorites()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleRemoveFavorite = async (e: React.MouseEvent, annonceId: number) => {
    e.preventDefault()
    await removeFavorite(annonceId)
    toast({ title: "Retiré des favoris" })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Mes favoris</h1>

          {favoriteItems.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Aucun favori"
              description="Commencez à ajouter des annonces à vos favoris"
              action={
                <Link href="/listings">
                  <Button>Parcourir les annonces</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteItems.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={{
                    id: item.annonce?.id,
                    title: item.annonce?.title,
                    price: item.annonce?.price,
                    city: item.annonce?.city,
                    district: item.annonce?.district,
                    photos: item.annonce?.photos,
                    created_at: item.annonce?.created_at || item.created_at,
                  }}
                  isFavorited
                  onToggleFavorite={handleRemoveFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
