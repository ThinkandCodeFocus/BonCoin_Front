"use client"

import { use, useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share2, Flag, MapPin, Phone, MessageCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { annonceService, favoriteService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface Annonce {
  id: number
  title: string
  description: string | null
  price: number
  negotiable: boolean
  city: string
  district: string
  etat: string
  status: string
  custom_category: string | null
  created_at: string
  photos?: string[]
  user: {
    id: number
    name: string
    phone?: string
    photo?: string
  }
  category: {
    id: number
    name: string
  }
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [annonce, setAnnonce] = useState<Annonce | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    loadAnnonce()
    if (isAuthenticated) {
      loadFavoriteStatus()
    }
  }, [id, isAuthenticated])

  const loadAnnonce = async () => {
    setIsLoading(true)
    const result = await annonceService.getById(parseInt(id))
    if (result.success && result.data) {
      setAnnonce(result.data.data || result.data)
    } else {
      toast.error("Annonce introuvable")
      router.push("/")
    }
    setIsLoading(false)
  }

  const loadFavoriteStatus = async () => {
    const result = await favoriteService.getAll()
    if (result.success && result.data) {
      const favoriteIds = result.data.map((fav: any) => fav.annonce?.id || fav.annonce_id)
      setIsFavorite(favoriteIds.includes(parseInt(id)))
    }
  }

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Connexion requise")
      return
    }

    if (isFavorite) {
      const result = await favoriteService.remove(annonce!.id)
      if (result.success) {
        setIsFavorite(false)
        toast.success("Retiré des favoris")
      }
    } else {
      const result = await favoriteService.add(annonce!.id)
      if (result.success) {
        setIsFavorite(true)
        toast.success("Ajouté aux favoris")
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " FCFA"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const nextPhoto = () => {
    if (annonce?.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % annonce.photos!.length)
    }
  }

  const previousPhoto = () => {
    if (annonce?.photos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + annonce.photos!.length) % annonce.photos!.length)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <BottomNav />
      </div>
    )
  }

  if (!annonce) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Annonce introuvable</p>
        </main>
        <BottomNav />
      </div>
    )
  }

  const photoUrl = annonce.photos?.[currentPhotoIndex]
    ? (annonce.photos[currentPhotoIndex].startsWith('http') 
        ? annonce.photos[currentPhotoIndex] 
        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${annonce.photos[currentPhotoIndex]}`)
    : "/placeholder.svg"

  const isOwner = user?.id === annonce.user.id

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Photos */}
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                <img src={photoUrl} alt={annonce.title} className="w-full h-full object-cover" />
                {annonce.photos && annonce.photos.length > 1 && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      onClick={previousPhoto}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onClick={nextPhoto}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {annonce.photos.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentPhotoIndex ? "bg-primary" : "bg-white/50"
                          }`}
                          onClick={() => setCurrentPhotoIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {annonce.photos && annonce.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {annonce.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden ${
                        index === currentPhotoIndex ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <img
                        src={photo.startsWith('http') 
                          ? photo 
                          : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${photo}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{annonce.title}</h1>
                    <p className="text-4xl font-bold text-primary">{formatPrice(annonce.price)}</p>
                    {annonce.negotiable && (
                      <Badge variant="secondary" className="mt-2">
                        Prix négociable
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={toggleFavorite}>
                      <Heart className={`w-5 h-5 ${isFavorite ? "fill-current text-destructive" : ""}`} />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {annonce.city}, {annonce.district}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(annonce.created_at)}</span>
                </div>
              </div>

              {/* Seller */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={
                          annonce.user.photo
                            ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${annonce.user.photo}`
                            : undefined
                        }
                      />
                      <AvatarFallback>{annonce.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{annonce.user.name}</p>
                      <p className="text-sm text-muted-foreground">Vendeur</p>
                    </div>
                  </div>
                  {!isOwner && (
                    <Button size="icon" variant="outline">
                      <Flag className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {!isOwner && (
                  <div className="space-y-2">
                    {annonce.user.phone && (
                      <Button className="w-full" variant="default">
                        <Phone className="w-4 h-4 mr-2" />
                        {annonce.user.phone}
                      </Button>
                    )}
                    <Button className="w-full" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Envoyer un message
                    </Button>
                  </div>
                )}
                {isOwner && (
                  <div className="space-y-2">
                    <Link href={`/publish?edit=${annonce.id}`}>
                      <Button className="w-full" variant="default">
                        Modifier
                      </Button>
                    </Link>
                    <Button className="w-full" variant="destructive">
                      Supprimer
                    </Button>
                  </div>
                )}
              </Card>

              {/* Description */}
              <Card className="p-4">
                <h2 className="font-semibold text-lg mb-3">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {annonce.description || "Aucune description fournie"}
                </p>
              </Card>

              {/* Details */}
              <Card className="p-4">
                <h2 className="font-semibold text-lg mb-3">Détails</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catégorie</span>
                    <span className="font-medium">
                      {annonce.custom_category || annonce.category.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">État</span>
                    <span className="font-medium">{annonce.etat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge>{annonce.status}</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
