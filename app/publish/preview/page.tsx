"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

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
}

export default function PublishPreviewPage() {
  const router = useRouter()
  const [data, setData] = useState<PreviewAnnonce | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem("preview_annonce")
    if (raw) {
      setData(JSON.parse(raw))
    }
  }, [])

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
            <h1 className="text-2xl font-bold">Previsualisation</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Retour
              </Button>
              <Button onClick={() => router.push("/publish")}>
                Modifier
              </Button>
            </div>
          </div>

          <Card className="p-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                  <img
                    src={data.photos?.[0] || "/placeholder.svg"}
                    alt={data.title}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                    className="w-full h-full object-cover"
                  />
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
