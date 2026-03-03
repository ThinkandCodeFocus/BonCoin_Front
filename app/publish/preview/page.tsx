"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { annonceService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/I18nProvider"
import { getUserLocation, getCityCoordinates } from "@/lib/geolocation"

interface PreviewAnnonce {
  title: string
  description: string
  price: string
  negotiable: boolean
  categoryId: string
  customCategory?: string
  city: string
  district: string
  etat: string
  photos: string[]
  hasVideo: boolean
  hasAudio: boolean
  videoPreview?: string
}

interface PublishDraft {
  imageFiles: File[]
  videoFile: File | null
  audioBlob: Blob | null
  descriptionMode: "text" | "voice"
}

export default function PublishPreviewPage() {
  const router = useRouter()
  const [data, setData] = useState<PreviewAnnonce | null>(null)
  const [draft, setDraft] = useState<PublishDraft | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { t } = useI18n()

  useEffect(() => {
    const raw = sessionStorage.getItem("preview_annonce")
    if (raw) {
      setData(JSON.parse(raw))
    }
    setDraft((window as any).__publishDraft || null)
  }, [])

  const handlePublish = async () => {
    if (!data || !draft) {
      toast({
        title: t("publish.error_missing_draft") || "Brouillon manquant",
        description: t("publish.error_missing_draft_desc") || "Retournez a la publication pour recharger les fichiers.",
        variant: "destructive",
      })
      return
    }

    if (!isAuthenticated) {
      toast({
        title: t("toast.login_required") || "Connexion requise",
        description: t("toast.login_required_desc") || "Vous devez etre connecte pour publier une annonce",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    if (!draft.imageFiles || draft.imageFiles.length < 2) {
      toast({
        title: t("publish.photos_required") || "Photos obligatoires",
        description: t("publish.photos_required_desc") || "Veuillez ajouter au moins 2 photos",
        variant: "destructive",
      })
      router.push("/publish")
      return
    }

    setIsLoading(true)
    try {
      let latitude: number | undefined
      let longitude: number | undefined

      const userLocation = await getUserLocation()
      if (userLocation) {
        latitude = userLocation.lat
        longitude = userLocation.lng
      } else if (data.city) {
        const cityCoords = getCityCoordinates(data.city)
        if (cityCoords) {
          latitude = cityCoords.lat
          longitude = cityCoords.lng
        }
      }

      const annonceData: any = {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        negotiable: data.negotiable,
        category_id: parseInt(data.categoryId),
        custom_category: data.customCategory || null,
        city: data.city,
        district: data.district,
        etat: data.etat,
      }

      if (latitude !== undefined && longitude !== undefined) {
        annonceData.latitude = latitude
        annonceData.longitude = longitude
      }

      const result = await annonceService.create(annonceData)
      const annonceId = result.data?.data?.id || result.data?.id
      if (!result.success && !annonceId) {
        const errorMessage = result.errors
          ? Object.entries(result.errors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
              .join("\n")
          : result.message || "Erreur lors de la creation"
        toast({
          title: t("publish.create_error") || "Erreur de creation",
          description: errorMessage,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (draft.imageFiles.length > 0 && annonceId) {
        const uploadResult = await annonceService.uploadPhotos(annonceId, draft.imageFiles)
        if (!uploadResult.success) {
          toast({
            title: t("publish.warning") || "Avertissement",
            description: t("publish.upload_photos_error") || "Annonce creee mais erreur lors de l'upload des photos",
          })
        }
      }

      if (draft.audioBlob && annonceId) {
        const audioFile = new File([draft.audioBlob], `description_${annonceId}.webm`, { type: "audio/webm" })
        const formData = new FormData()
        formData.append("audio", audioFile)
        const audioUploadResult = await annonceService.uploadAudio(annonceId, formData)
        if (!audioUploadResult.success) {
          toast({
            title: t("publish.warning") || "Avertissement",
            description: t("publish.upload_audio_error") || "Annonce creee mais erreur lors de l'upload de l'audio",
          })
        }
      }

      if (draft.videoFile && annonceId) {
        const formData = new FormData()
        formData.append("video", draft.videoFile)
        const videoUploadResult = await annonceService.uploadVideo(annonceId, formData)
        if (!videoUploadResult.success) {
          toast({
            title: t("publish.warning") || "Avertissement",
            description: t("publish.upload_video_error") || "Annonce creee mais erreur lors de l'upload de la video",
          })
        }
      }

      ;(window as any).__publishDraft = null
      toast({
        title: t("publish.create_success") || "Creation avec succes",
        description: t("publish.create_success_desc") || "Votre annonce est maintenant en ligne",
      })
      router.push(`/listings/${annonceId}`)
    } catch (error) {
      toast({
        title: t("toast.error") || "Erreur",
        description: t("publish.create_exception") || "Une erreur est survenue lors de la publication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Apercu indisponible</p>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-4">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" data-i18n="publish.preview_title">Previsualisation</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                <span data-i18n="actions.back">Retour</span>
              </Button>
              <Button onClick={() => router.push("/publish")}>
                <span data-i18n="actions.edit">Modifier</span>
              </Button>
              <Button onClick={handlePublish} disabled={isLoading || !draft}>
                <span>{isLoading ? (t("publish.publishing") || "Publication...") : (t("publish.publish_button") || "Publier")}</span>
              </Button>
            </div>
          </div>

          <Card className="p-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  {data.videoPreview ? (
                    <video className="w-full h-full object-cover" controls src={data.videoPreview} />
                  ) : (
                    <img
                      src={data.photos?.[0] || "/placeholder.svg"}
                      alt={data.title}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {data.photos?.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {data.photos.slice(0, 4).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                        className="aspect-square rounded-md object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">{data.title}</h2>
                  <p className="text-3xl font-bold text-primary mt-2">{data.price} FCFA</p>
                  {data.negotiable && <Badge className="mt-2">Prix negociable</Badge>}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{data.city}, {data.district}</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Etat</p>
                  <p className="font-medium">{data.etat}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="whitespace-pre-wrap">{data.description}</p>
                </div>
                <div className="flex gap-2">
                  {data.hasVideo && <Badge variant="secondary">Video</Badge>}
                  {data.hasAudio && <Badge variant="secondary">Audio</Badge>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
