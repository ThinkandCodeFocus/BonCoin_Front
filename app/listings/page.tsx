"use client"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Heart, SlidersHorizontal, MapPin, Search } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { useState } from "react"

const listings = [
  {
    id: 1,
    title: "iPhone 14 Pro Max 256GB",
    price: 450000,
    location: "Dakar, Plateau",
    image: "/iphone-14-pro.png",
    isUrgent: true,
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Appartement F3 à louer",
    price: 250000,
    location: "Dakar, Almadies",
    image: "/modern-apartment.jpg",
    isUrgent: false,
    date: "2024-01-14",
  },
  {
    id: 3,
    title: "Toyota Corolla 2019",
    price: 8500000,
    location: "Dakar, Liberté",
    image: "/toyota-corolla.png",
    isUrgent: false,
    date: "2024-01-14",
  },
  // Add more listings...
]

export default function ListingsPage() {
  const [priceRange, setPriceRange] = useState([0, 1000000])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4">
        {/* Search Bar */}
        <div className="bg-card border-b p-4">
          <div className="max-w-6xl mx-auto flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-md px-3 py-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:inline">Filtres</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtres de recherche</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <Label>Prix (FCFA)</Label>
                    <div className="mt-4">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={10000000}
                        step={10000}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{priceRange[0].toLocaleString()}</span>
                        <span>{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Localisation</Label>
                    <Input id="location" placeholder="Ville ou région" className="mt-2" />
                  </div>

                  <Button className="w-full">Appliquer les filtres</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="max-w-6xl mx-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{listings.length} annonces trouvées</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
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
                      <Heart className="w-4 h-4" />
                    </Button>
                    {listing.isUrgent && (
                      <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">Urgent</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
                    <p className="text-2xl font-bold text-primary mb-2">{listing.price.toLocaleString("fr-FR")} FCFA</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.location}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
