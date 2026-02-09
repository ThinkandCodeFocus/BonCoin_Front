"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share2, Flag, MapPin, Phone, MessageCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { annonceService, favoriteService, messageService } from "@/lib/api"
import { resolveStorageUrl } from "@/lib/media"
import { useAuth } from "@/contexts/AuthContext"
import { useParams, useRouter } from "next/navigation"
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
  videos?: string[]
  audios?: string[]
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

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [annonce, setAnnonce] = useState<Annonce | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    loadAnnonce()
    if (isAuthenticated) {
      loadFavoriteStatus()
    }
  }, [id, isAuthenticated])

  const loadAnnonce = async () => {
    setIsLoading(true)
    console.log('Loading annonce with ID:', id)
    try {
      const parsedId = Number.parseInt(id as string, 10)
      if (Number.isNaN(parsedId)) {
        toast.error("Annonce introuvable")
        return
      }
      const result = await annonceService.getById(parsedId)
      console.log('API Result:', result)
      if (result.success && result.data) {
        const annonceData = result.data.data || result.data
        console.log('Annonce data:', annonceData)
        console.log('Photos:', annonceData.photos)
        setAnnonce(annonceData)
      } else {
        console.error('Failed to load annonce:', result)
        toast.error(result.message || "Annonce introuvable")
      }
    } catch (error) {
      console.error('Error loading annonce:', error)
      toast.error("Erreur lors du chargement de l'annonce")
    } finally {
      setIsLoading(false)
    }
  }

  const loadFavoriteStatus = async () => {
    const result = await favoriteService.getAll()
    if (result.success && result.data) {
      const favoriteIds = result.data.map((fav: any) => fav.annonce?.id || fav.annonce_id)
      const parsedId = Number.parseInt(id as string, 10)
      setIsFavorite(favoriteIds.includes(parsedId))
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
        toast.success("Retire des favoris")
      } else {
        toast.error(result.message || "Impossible de retirer")
      }
    } else {
      const result = await favoriteService.add(annonce!.id)
      if (result.success) {
        setIsFavorite(true)
        toast.success("Ajoute aux favoris")
      } else {
        toast.error(result.message || "Impossible d'ajouter")
      }
    }
  }

  const contactSeller = async () => {
    if (!isAuthenticated) {
      toast.error("Connexion requise")
      router.push("/auth")
      return
    }

    if (!annonce) return

    try {
      // Créer ou récupérer la conversation
      const result = await messageService.createConversation({
        annonce_id: annonce.id,
        seller_id: annonce.user.id,
      })

      if (result.success && result.data) {
        const conversationId = result.data.conversation?.id || result.data.id
        if (conversationId) {
          // Rediriger vers la conversation
          router.push(`/messages/${conversationId}`)
        } else {
          toast.error("Impossible de créer la conversation")
        }
      } else {
        toast.error(result.message || "Erreur lors de la création de la conversation")
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error("Erreur lors de la création de la conversation")
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

    const photoUrl = resolveStorageUrl(annonce.photos?.[currentPhotoIndex])

  console.log('Current photo URL:', photoUrl)
  console.log('All photos:', annonce.photos)
  console.log('Audios:', annonce.audios)
  console.log('Videos:', annonce.videos)

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
                <img
                  src={photoUrl}
                  alt={annonce.title}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                  className="w-full h-full object-cover"
                />
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
                        src={resolveStorageUrl(photo)}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Vidéos */}
              {annonce.videos && annonce.videos.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold">Vidéos</h3>
                  {annonce.videos.map((video: string, index: number) => (
                    <video
                      key={index}
                      controls
                      className="w-full rounded-lg"
                      src={resolveStorageUrl(video)}
                    >
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
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
                            ? resolveStorageUrl(annonce.user.photo)
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
                    <Button className="w-full" variant="outline" onClick={contactSeller}>
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
                {annonce.description && (
                  <p className="text-muted-foreground whitespace-pre-wrap mb-4">
                    {annonce.description}
                  </p>
                )}
                {annonce.audios && annonce.audios.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Description vocale enregistrée - Écoutez l'audio pour plus de détails
                    </p>
                    {annonce.audios.map((audio: string, index: number) => (
                      <audio
                        key={index}
                        controls
                        className="w-full"
                        src={resolveStorageUrl(audio)}
                      >
                        Votre navigateur ne supporte pas l'élément audio.
                      </audio>
                    ))}
                  </div>
                )}
                {!annonce.description && (!annonce.audios || annonce.audios.length === 0) && (
                  <p className="text-muted-foreground">Aucune description fournie</p>
                )}
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
