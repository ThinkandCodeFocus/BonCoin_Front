"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { AccountLayout } from "@/components/account-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Package, Heart, Loader2, MapPin, Trash2, Edit3 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { resolveStorageUrl } from "@/lib/media"
import { profileService, favoriteService, annonceService } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useFavorites } from "@/contexts/FavoritesContext"
import { formatPrice, EmptyState } from "@/components/design-system"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Annonce {
  id: number
  title: string
  price: number
  photos?: string[]
  status: string
  views: number
  city: string
  district: string
}

interface Favorite {
  id: number
  annonce: Annonce
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") === "favorites" ? "favorites" : "listings"
  const { loadFavorites: reloadFavoritesContext } = useFavorites()
  const [userAnnonces, setUserAnnonces] = useState<Annonce[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoadingAnnonces, setIsLoadingAnnonces] = useState(true)
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    loadUserAnnonces()
    loadFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const loadUserAnnonces = async () => {
    setIsLoadingAnnonces(true)
    const result = await profileService.getAnnonces()
    if (result.success && result.data) {
      setUserAnnonces(result.data)
    }
    setIsLoadingAnnonces(false)
  }

  const loadFavorites = async () => {
    setIsLoadingFavorites(true)
    const result = await favoriteService.getAll()
    if (result.success && result.data) {
      setFavorites(Array.isArray(result.data) ? result.data : [])
    }
    setIsLoadingFavorites(false)
  }

  const removeFavorite = async (annonceId: number) => {
    const result = await favoriteService.remove(annonceId)
    if (result.success) {
      setFavorites((prev) => prev.filter((fav) => fav.annonce?.id !== annonceId))
      toast({ title: "Favori retiré" })
      await reloadFavoritesContext()
    } else {
      toast({ title: "Erreur", description: result.message || "Impossible de retirer le favori", variant: "destructive" })
    }
  }

  const confirmDeleteAnnonce = (annonceId: number) => {
    setDeleteTargetId(annonceId)
  }

  const deleteAnnonce = async () => {
    if (!deleteTargetId) return
    const result = await annonceService.delete(deleteTargetId)
    if (result.success) {
      setUserAnnonces((prev) => prev.filter((a) => a.id !== deleteTargetId))
      toast({ title: "Annonce supprimée" })
    } else {
      toast({ title: "Erreur", description: result.message || "Suppression échouée", variant: "destructive" })
    }
    setDeleteTargetId(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4">
        <div className="max-w-6xl mx-auto px-4 pt-6 flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.photo ? resolveStorageUrl(user.photo) : undefined} />
            <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <AccountLayout>
          {activeTab === "listings" ? (
            <div className="space-y-3">
              <h1 className="text-base font-semibold">Mes annonces ({userAnnonces.length})</h1>
              {isLoadingAnnonces ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : userAnnonces.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="Vous n'avez pas encore d'annonces"
                  action={
                    <Link href="/publish">
                      <Button>Publier une annonce</Button>
                    </Link>
                  }
                />
              ) : (
                userAnnonces.map((listing) => {
                  const photoUrl = resolveStorageUrl(listing.photos?.[0])

                  return (
                    <Card key={listing.id} className="p-3">
                      <div className="flex gap-3">
                        <img
                          src={photoUrl}
                          alt={listing.title}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                          className="w-24 h-24 object-cover rounded-md border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h3 className="font-medium">{listing.title}</h3>
                              <p className="text-lg font-bold">{formatPrice(listing.price)}</p>
                            </div>
                            <Badge variant={listing.status === "Disponible" ? "default" : "secondary"}>
                              {listing.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span>{listing.views || 0} vues</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {listing.city}, {listing.district}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/listings/${listing.id}`}>
                              <Button size="sm" variant="outline">
                                Voir
                              </Button>
                            </Link>
                            <Link href={`/publish?edit=${listing.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit3 className="w-3.5 h-3.5 mr-1" />
                                Modifier
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => confirmDeleteAnnonce(listing.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h1 className="text-base font-semibold">Favoris ({favorites.length})</h1>
              {isLoadingFavorites ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : favorites.length === 0 ? (
                <EmptyState icon={Heart} title="Vous n'avez pas encore de favoris" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((item) => {
                    const annonce = item.annonce
                    const photoUrl = resolveStorageUrl(annonce.photos?.[0])

                    return (
                      <Card key={item.id} className="overflow-hidden p-0">
                        <Link href={`/listings/${annonce.id}`}>
                          <img
                            src={photoUrl}
                            alt={annonce.title}
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                            className="w-full aspect-square object-cover"
                          />
                        </Link>
                        <div className="p-3">
                          <Link href={`/listings/${annonce.id}`}>
                            <h3 className="font-medium mb-1 line-clamp-2 text-sm">{annonce.title}</h3>
                          </Link>
                          <p className="text-lg font-bold mb-1">{formatPrice(annonce.price)}</p>
                          <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            {annonce.city}, {annonce.district}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFavorite(annonce.id)}
                          >
                            Retirer
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </AccountLayout>
      </main>

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'annonce</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. Voulez-vous vraiment supprimer cette annonce ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAnnonce}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  )
}
