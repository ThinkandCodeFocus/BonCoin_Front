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
import { ReportListingButton } from "@/components/report-listing-button"
import { formatPrice } from "@/components/design-system"
import { ListingCard, type ListingCardData } from "@/components/listing-card"

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
  const [isContacting, setIsContacting] = useState(false)
  const [similarListings, setSimilarListings] = useState<ListingCardData[]>([])

  useEffect(() => {
    if (!id) return
    loadAnnonce()
    if (isAuthenticated) {
      loadFavoriteStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated])

  const loadAnnonce = async () => {
    setIsLoading(true)
    try {
      const parsedId = Number.parseInt(id as string, 10)
      if (Number.isNaN(parsedId)) {
        toast.error("Annonce introuvable")
        return
      }
      const result = await annonceService.getById(parsedId)
      if (result.success && result.data) {
        const annonceData = result.data.data || result.data
        setAnnonce(annonceData)
        loadSimilarListings(annonceData.category?.id, parsedId)
      } else {
        toast.error(result.message || "Annonce introuvable")
      }
    } catch (error) {
      toast.error("Erreur lors du chargement de l'annonce")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSimilarListings = async (categoryId: number | undefined, excludeId: number) => {
    if (!categoryId) return
    const result = await annonceService.getAll({ category: categoryId, page: 1 })
    if (result.success && (result as any).data) {
      const data = (result as any).data
      const items = (data.data || []).filter((item: ListingCardData) => item.id !== excludeId).slice(0, 4)
      setSimilarListings(items)
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
        toast.success("Retiré des favoris")
      } else {
        toast.error(result.message || "Impossible de retirer")
      }
    } else {
      const result = await favoriteService.add(annonce!.id)
      if (result.success) {
        setIsFavorite(true)
        toast.success("Ajouté aux favoris")
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

    setIsContacting(true)
    toast.info("Création de la conversation...")

    try {
      const result = await messageService.createConversation({
        annonce_id: annonce.id,
        seller_id: annonce.user.id,
      }) as any

      if (result.success && result.data) {
        const conversationData = result.data.data?.conversation || result.data.conversation || result.data.data || result.data
        const conversationId = conversationData?.id

        if (conversationId) {
          toast.success("Conversation créée !")
          router.push(`/messages/${conversationId}`)
          return
        }
      }

      const errorMessage = result.message || result.errors?.annonce_id || "Erreur lors de la création de la conversation"
      toast.error(errorMessage)
    } catch (error) {
      toast.error("Erreur lors de la création de la conversation")
    } finally {
      setIsContacting(false)
    }
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
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
  const isOwner = user?.id === annonce.user.id

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-16 md:pb-4">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Galerie photos */}
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3 border">
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
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      onClick={previousPhoto}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={nextPhoto}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {annonce.photos.map((_, index) => (
                        <button
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full ${index === currentPhotoIndex ? "bg-primary" : "bg-white/60"}`}
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
                      className={`aspect-square rounded-md overflow-hidden border ${index === currentPhotoIndex ? "ring-2 ring-primary" : ""}`}
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

              {annonce.videos && annonce.videos.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold text-sm">Vidéos</h3>
                  {annonce.videos.map((video: string, index: number) => (
                    <video key={index} controls className="w-full rounded-md" src={resolveStorageUrl(video)}>
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  ))}
                </div>
              )}
            </div>

            {/* Détails / colonne sticky */}
            <div className="space-y-4 md:sticky md:top-20 md:self-start">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h1 className="text-xl font-semibold mb-1">{annonce.title}</h1>
                    <p className="text-2xl font-bold">{formatPrice(annonce.price)}</p>
                    {annonce.negotiable && (
                      <Badge variant="secondary" className="mt-2">
                        Prix négociable
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="icon" variant="outline" onClick={toggleFavorite}>
                      <Heart className={`w-4 h-4 ${isFavorite ? "fill-current text-destructive" : ""}`} />
                    </Button>
                    <Button size="icon" variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {annonce.city}, {annonce.district}
                  </span>
                  <span>·</span>
                  <span>{formatDate(annonce.created_at)}</span>
                </div>
              </div>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={annonce.user.photo ? resolveStorageUrl(annonce.user.photo) : undefined} />
                      <AvatarFallback>{annonce.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{annonce.user.name}</p>
                      <p className="text-xs text-muted-foreground">Vendeur</p>
                    </div>
                  </div>
                  {!isOwner && (
                    <ReportListingButton annonceId={annonce.id} annonceTitle={annonce.title}>
                      <Button size="icon" variant="outline">
                        <Flag className="w-4 h-4" />
                      </Button>
                    </ReportListingButton>
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
                    <Button className="w-full" variant="outline" onClick={contactSeller} disabled={isContacting}>
                      {isContacting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      {isContacting ? "Création..." : "Envoyer un message"}
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

              <Card className="p-4">
                <h2 className="font-semibold text-sm mb-2">Description</h2>
                {annonce.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                    {annonce.description}
                  </p>
                )}
                {annonce.audios && annonce.audios.length > 0 && (
                  <div className="space-y-3 mt-3">
                    <p className="text-xs text-muted-foreground">Description vocale enregistrée</p>
                    {annonce.audios.map((audio: string, index: number) => (
                      <audio key={index} controls className="w-full" src={resolveStorageUrl(audio)}>
                        Votre navigateur ne supporte pas l'élément audio.
                      </audio>
                    ))}
                  </div>
                )}
                {!annonce.description && (!annonce.audios || annonce.audios.length === 0) && (
                  <p className="text-sm text-muted-foreground">Aucune description fournie</p>
                )}
              </Card>

              <Card className="p-4">
                <h2 className="font-semibold text-sm mb-2">Détails</h2>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catégorie</span>
                    <span className="font-medium">{annonce.custom_category || annonce.category.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">État</span>
                    <span className="font-medium">{annonce.etat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant="outline">{annonce.status}</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {similarListings.length > 0 && (
            <div className="mt-10">
              <h2 className="text-base font-semibold mb-3">Annonces similaires</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {similarListings.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
