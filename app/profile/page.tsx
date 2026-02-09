"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Star, Package, Heart, LogOut, Loader2, MapPin, Trash2, Edit3 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { resolveStorageUrl } from "@/lib/media"
import { profileService, favoriteService, annonceService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useFavorites } from "@/contexts/FavoritesContext"
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
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleSwitchAccount = async () => {
    await logout()
    router.push("/auth")
  }

  const removeFavorite = async (annonceId: number) => {
    const result = await favoriteService.remove(annonceId)
    if (result.success) {
      setFavorites((prev) => prev.filter((fav) => fav.annonce?.id !== annonceId))
      toast({ title: "Favori retire" })
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
      toast({ title: "Annonce supprimee" })
    } else {
      toast({ title: "Erreur", description: result.message || "Suppression echouee", variant: "destructive" })
    }
    setDeleteTargetId(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        {/* Profile Header */}
        <div className="bg-primary text-primary-foreground py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage 
                src={user.photo ? resolveStorageUrl(user.photo) : undefined} 
              />
              <AvatarFallback className="text-4xl">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                <span>{user.email}</span>
                {user.phone && <span>{user.phone}</span>}
                <span>Membre depuis {formatDate(user.created_at)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/profile/settings">
                <Button variant="secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto p-4">
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="listings">
                <Package className="w-4 h-4 mr-2" />
                Mes annonces ({userAnnonces.length})
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="w-4 h-4 mr-2" />
                Favoris ({favorites.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-4">
              {isLoadingAnnonces ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : userAnnonces.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore d'annonces</p>
                  <Link href="/publish">
                    <Button>Publier une annonce</Button>
                  </Link>
                </Card>
              ) : (
                userAnnonces.map((listing) => {
                  const photoUrl = resolveStorageUrl(listing.photos?.[0])

                  return (
                    <Card key={listing.id} className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={photoUrl}
                          alt={listing.title}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{listing.title}</h3>
                              <p className="text-xl font-bold text-primary">{formatPrice(listing.price)}</p>
                            </div>
                            <Badge variant={listing.status === "Disponible" ? "default" : "secondary"}>
                              {listing.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>{listing.views || 0} vues</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {listing.city}, {listing.district}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/listings/${listing.id}`}>
                              <Button size="sm" variant="outline">
                                Voir
                              </Button>
                            </Link>
                            <Link href={`/publish?edit=${listing.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit3 className="w-4 h-4 mr-1" />
                                Modifier
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" className="text-destructive bg-transparent" onClick={() => confirmDeleteAnnonce(listing.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {isLoadingFavorites ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : favorites.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Vous n'avez pas encore de favoris</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((item) => {
                    const annonce = item.annonce
                    const photoUrl = resolveStorageUrl(annonce.photos?.[0])

                    return (
                      <Link key={item.id} href={`/listings/${annonce.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <img
                            src={photoUrl}
                            alt={annonce.title}
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                            className="w-full aspect-4/3 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold mb-2 line-clamp-2">{annonce.title}</h3>
                            <p className="text-xl font-bold text-primary mb-2">{formatPrice(annonce.price)}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-1" />
                              {annonce.city}, {annonce.district}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={(e) => {
                                e.preventDefault()
                                removeFavorite(annonce.id)
                              }}
                            >
                              Retirer
                            </Button>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'annonce</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est definitive. Voulez-vous vraiment supprimer cette annonce ?
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
