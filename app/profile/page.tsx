"use client"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Star, Package, Heart, LogOut } from "lucide-react"
import Link from "next/link"

const userListings = [
  {
    id: 1,
    title: "iPhone 14 Pro Max",
    price: 450000,
    image: "/modern-smartphone.png",
    status: "active",
    views: 234,
  },
  {
    id: 2,
    title: "MacBook Pro M2",
    price: 1200000,
    image: "/macbook.jpg",
    status: "active",
    views: 156,
  },
]

const favorites = [
  {
    id: 3,
    title: "Toyota Corolla 2019",
    price: 8500000,
    image: "/toyota-corolla.png",
    location: "Dakar",
  },
]

export default function ProfilePage() {
  const user = {
    name: "Amadou Diallo",
    email: "amadou.diallo@example.com",
    phone: "+221 77 123 45 67",
    avatar: "/african-man-portrait.png",
    rating: 4.8,
    reviewCount: 23,
    memberSince: "Janvier 2022",
    activeListings: 2,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        {/* Profile Header */}
        <div className="bg-primary text-primary-foreground py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>
                    {user.rating} ({user.reviewCount} avis)
                  </span>
                </div>
                <span>Membre depuis {user.memberSince}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/profile/settings">
                <Button variant="secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </Link>
              <Button variant="secondary">
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
                Mes annonces ({user.activeListings})
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Heart className="w-4 h-4 mr-2" />
                Favoris
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-4">
              {userListings.map((listing) => (
                <Card key={listing.id} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{listing.title}</h3>
                          <p className="text-xl font-bold text-primary">{listing.price.toLocaleString("fr-FR")} FCFA</p>
                        </div>
                        <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                          {listing.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{listing.views} vues</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline">
                          Statistiques
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive bg-transparent">
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item) => (
                  <Link key={item.id} href={`/listings/${item.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full aspect-[4/3] object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-xl font-bold text-primary mb-1">{item.price.toLocaleString("fr-FR")} FCFA</p>
                        <p className="text-sm text-muted-foreground">{item.location}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
