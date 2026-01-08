"use client"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MapPin } from "lucide-react"
import Link from "next/link"

const favorites = [
  {
    id: 1,
    title: "Toyota Corolla 2019",
    price: 8500000,
    location: "Dakar, Liberté",
    image: "/toyota-corolla.png",
  },
  {
    id: 2,
    title: "Appartement F3 à louer",
    price: 250000,
    location: "Dakar, Almadies",
    image: "/modern-apartment.jpg",
  },
  {
    id: 3,
    title: "Samsung Galaxy S23 Ultra",
    price: 520000,
    location: "Thiès, Centre",
    image: "/samsung-galaxy-smartphone.png",
  },
]

export default function FavoritesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mes Favoris</h1>

          {favorites.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Aucun favori</h2>
              <p className="text-muted-foreground mb-6">Commencez à ajouter des annonces à vos favoris</p>
              <Link href="/listings">
                <Button>Parcourir les annonces</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((item) => (
                <Link key={item.id} href={`/listings/${item.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-3 right-3 rounded-full w-9 h-9"
                        onClick={(e) => {
                          e.preventDefault()
                        }}
                      >
                        <Heart className="w-4 h-4 fill-primary text-primary" />
                      </Button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-2xl font-bold text-primary mb-2">{item.price.toLocaleString("fr-FR")} FCFA</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
