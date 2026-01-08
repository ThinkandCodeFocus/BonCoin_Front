"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const listings = [
  {
    id: 1,
    title: "iPhone 14 Pro Max 256GB",
    price: 450000,
    location: "Dakar, Plateau",
    image: "/iphone-14-pro.jpg",
    isUrgent: true,
    isFeatured: false,
  },
  {
    id: 2,
    title: "Appartement F3 à louer",
    price: 250000,
    location: "Dakar, Almadies",
    image: "/modern-apartment-interior.jpg",
    isUrgent: false,
    isFeatured: true,
  },
  {
    id: 3,
    title: "Toyota Corolla 2019",
    price: 8500000,
    location: "Dakar, Liberté",
    image: "/toyota-corolla-silver.jpg",
    isUrgent: false,
    isFeatured: false,
  },
  {
    id: 4,
    title: "MacBook Pro M2 2023",
    price: 1200000,
    location: "Dakar, Point E",
    image: "/macbook-pro.jpg",
    isUrgent: true,
    isFeatured: false,
  },
  {
    id: 5,
    title: "Canapé 3 places comme neuf",
    price: 85000,
    location: "Dakar, Mermoz",
    image: "/modern-grey-sofa.jpg",
    isUrgent: false,
    isFeatured: false,
  },
  {
    id: 6,
    title: "Samsung Galaxy S23 Ultra",
    price: 520000,
    location: "Thiès, Centre",
    image: "/samsung-galaxy-phone.jpg",
    isUrgent: false,
    isFeatured: true,
  },
]

export function FeaturedListings() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {listings.map((listing) => (
        <Link key={listing.id} href={`/listings/${listing.id}`}>
          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-border/50 hover:border-primary/20 hover:-translate-y-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={listing.image || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-4 right-4 rounded-full w-10 h-10 shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault()
                  // Toggle favorite
                }}
              >
                <Heart className="w-4 h-4" />
              </Button>
              {listing.isUrgent && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground shadow-lg">
                  Urgent
                </Badge>
              )}
              {listing.isFeatured && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground shadow-lg font-semibold">
                  En vedette
                </Badge>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <p className="text-2xl font-bold text-primary mb-3">{listing.price.toLocaleString("fr-FR")} FCFA</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{listing.location}</span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
