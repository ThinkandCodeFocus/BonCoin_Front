"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { QrCode, Loader2, BadgeCheck } from "lucide-react"
import { annonceService } from "@/lib/api"
import { resolveStorageUrl } from "@/lib/media"
import { ListingCard, type ListingCardData } from "@/components/listing-card"
import { EmptyState } from "@/components/design-system"
import { BusinessCardDialog } from "@/components/business-card-dialog"
import { SellerReviews } from "@/components/seller-reviews"

interface Seller {
  name: string
  photo?: string
  is_verified?: boolean
}

export default function SellerStorefrontPage() {
  const params = useParams<{ id: string }>()
  const sellerId = Number(params?.id)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [listings, setListings] = useState<ListingCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBusinessCard, setShowBusinessCard] = useState(false)

  useEffect(() => {
    if (!sellerId) return
    setIsLoading(true)
    annonceService.getAll({ user_id: sellerId, page: 1 }).then((result) => {
      if (result.success && (result as any).data) {
        const data = (result as any).data
        const items = data.data || []
        setListings(items)
        if (items.length > 0 && items[0].user) {
          setSeller(items[0].user)
        }
      }
      setIsLoading(false)
    })
  }, [sellerId])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-4">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !seller ? (
            <EmptyState title="Aucune annonce publique pour ce vendeur" />
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={seller.photo ? resolveStorageUrl(seller.photo) : undefined} />
                    <AvatarFallback className="text-lg">{seller.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-lg font-semibold flex items-center gap-1.5">
                      {seller.name}
                      {seller.is_verified && <BadgeCheck className="w-4 h-4 text-primary" aria-label="Vendeur vérifié" />}
                    </h1>
                    <p className="text-sm text-muted-foreground">{listings.length} annonce(s) en ligne</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowBusinessCard(true)}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Carte de la boutique
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              <div className="mt-10 max-w-2xl">
                <h2 className="text-base font-semibold mb-4">Avis</h2>
                <SellerReviews sellerId={sellerId} />
              </div>
            </>
          )}
        </div>
      </main>

      {seller && (
        <BusinessCardDialog
          open={showBusinessCard}
          onOpenChange={setShowBusinessCard}
          title={seller.name}
          subtitle={`${listings.length} annonce(s) en ligne`}
          imageUrl={seller.photo ? resolveStorageUrl(seller.photo) : undefined}
          url={typeof window !== "undefined" ? window.location.href : `/sellers/${sellerId}`}
          fileName={`boutique-${seller.name}.png`}
        />
      )}

      <BottomNav />
    </div>
  )
}
