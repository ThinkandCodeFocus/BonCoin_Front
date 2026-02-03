
"use client"

import {
  Smartphone,
  Home,
  Car,
  Shirt,
  Sofa,
  Briefcase,
  Gift,
  PawPrint,
  Gamepad2,
  Sparkles,
  Building2,
  Leaf,
} from "lucide-react"
import Link from "next/link"

// Default categories
const defaultCategories = [
  { id: 1, name: "Téléphones", icon: "Smartphone", annonces_count: 1250 },
  { id: 2, name: "Immobilier", icon: "Building2", annonces_count: 856 },
  { id: 3, name: "Véhicules", icon: "Car", annonces_count: 543 },
  { id: 4, name: "Meubles", icon: "Sofa", annonces_count: 432 },
  { id: 5, name: "Mode", icon: "Shirt", annonces_count: 1200 },
  { id: 6, name: "Électronique", icon: "Smartphone", annonces_count: 789 },
  { id: 7, name: "Services", icon: "Briefcase", annonces_count: 234 },
  { id: 8, name: "Loisirs", icon: "Gamepad2", annonces_count: 567 },
]

interface Category {
  id: number
  name: string
  icon?: string
  annonces_count?: number
}

// Icon mapping
const getIconForName = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes("vehicul") || n.includes("voiture") || n.includes("auto")) return Car
  if (n.includes("immobilier") || n.includes("habitation")) return Building2
  if (n.includes("maison")) return Home
  if (n.includes("jardin")) return Leaf
  if (n.includes("electron") || n.includes("informat") || n.includes("telephone") || n.includes("mobile")) return Smartphone
  if (n.includes("meuble")) return Sofa
  if (n.includes("mode") || n.includes("vetement")) return Shirt
  if (n.includes("beaute") || n.includes("cosmet")) return Sparkles
  if (n.includes("emploi") || n.includes("service") || n.includes("job")) return Briefcase
  if (n.includes("loisir") || n.includes("divert")) return Gamepad2
  if (n.includes("animal")) return PawPrint
  return Gift
}

export function CategoryGrid() {
  // Skeleton loading
  const SkeletonCategory = () => (
    <div className="category-card">
      <div className="hex-card">
        <div className="hex-card-inner">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 shimmer-card rounded-2xl" />
            <div className="space-y-2">
              <div className="h-4 shimmer-card rounded-md w-20" />
              <div className="h-3 shimmer-card rounded-md w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {defaultCategories.map((category) => {
        const Icon = getIconForName(category.name)
        const count = category.annonces_count || 0
        
        return (
          <Link key={category.id} href={`/listings?category=${category.id}`} className="group">
            <div className="category-card">
              <div className="hex-card">
                <div className="hex-card-inner">
                  <div className="flex flex-col items-center text-center gap-3 relative z-10">
                    <div className="relative">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm md:text-base mb-1 group-hover:text-accent transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
                        {count.toLocaleString()} annonces
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

