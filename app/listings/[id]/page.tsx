"use client"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Share2, Flag, MapPin, Clock, Eye, Phone, MessageCircle } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()

  const listing = {
    id: params.id,
    title: "iPhone 14 Pro Max 256GB - État neuf",
    price: 450000,
    description:
      "iPhone 14 Pro Max en excellent état, utilisé seulement 3 mois. Aucune rayure, toujours avec protection. Livré avec tous les accessoires d'origine : chargeur, câble, boîte. Facture disponible. Garantie constructeur valable.",
    location: "Dakar, Plateau",
    images: ["/iphone-14-pro-front.jpg", "/iphone-14-pro-back.jpg", "/iphone-14-pro-side.jpg"],
    isUrgent: true,
    date: "15 janvier 2024",
    views: 234,
    seller: {
      name: "Amadou Diallo",
      avatar: "/african-man-portrait.png",
      rating: 4.8,
      reviewCount: 23,
      memberSince: "Membre depuis 2022",
    },
    category: "Téléphones",
    condition: "Comme neuf",
  }

  const handleShare = () => {
    toast({
      title: "Lien copié",
      description: "Le lien de l'annonce a été copié dans le presse-papier.",
    })
  }

  const handleReport = () => {
    toast({
      title: "Signalement envoyé",
      description: "Nous examinerons cette annonce.",
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        <div className="max-w-6xl mx-auto p-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Images and Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <img
                    src={listing.images[0] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {listing.isUrgent && (
                    <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">Urgent</Badge>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? "fill-primary text-primary" : ""}`} />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full" onClick={handleShare}>
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 p-2">
                  {listing.images.slice(1).map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-80">
                      <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Description */}
              <Card className="p-6">
                <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>

                <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {listing.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {listing.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.views} vues
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Catégorie</p>
                    <p className="font-medium">{listing.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">État</p>
                    <p className="font-medium">{listing.condition}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={handleReport}>
                  <Flag className="w-4 h-4 mr-2" />
                  Signaler cette annonce
                </Button>
              </Card>
            </div>

            {/* Right Column - Price and Seller */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="p-6 sticky top-20">
                <p className="text-3xl font-bold text-primary mb-6">{listing.price.toLocaleString("fr-FR")} FCFA</p>

                <div className="space-y-3 mb-6">
                  <Button className="w-full" size="lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Envoyer un message
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Afficher le téléphone
                  </Button>
                </div>

                {/* Seller Info */}
                <div className="pt-6 border-t">
                  <p className="text-sm font-medium mb-3">Vendeur</p>
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={listing.seller.avatar || "/placeholder.svg"} />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{listing.seller.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>⭐ {listing.seller.rating}</span>
                        <span>({listing.seller.reviewCount} avis)</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{listing.seller.memberSince}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    Voir le profil
                  </Button>
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
