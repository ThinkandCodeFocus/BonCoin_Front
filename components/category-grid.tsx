"use client"

import { useEffect, useState } from "react"
import {
  Smartphone,
  Home,
  Car,
  Shirt,
  Sofa,
  Briefcase,
  BookOpen,
  Gift,
  Loader2,
  PawPrint,
  Gamepad2,
  Sparkles,
  Building2,
  Leaf,
} from "lucide-react"
import Link from "next/link"
import { categoryService } from "@/lib/api"

const iconMap: Record<string, any> = {
  Smartphone,
  Home,
  Car,
  Shirt,
  Sofa,
  Briefcase,
  BookOpen,
  Gift,
}

interface Category {
  id: number
  name: string
  icon?: string
  annonces_count?: number
}

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    const result = await categoryService.getAll()
    if (result.success && result.data) {
      setCategories(result.data.data || result.data)
    }
    setIsLoading(false)
  }

  const getIcon = (iconName?: string, categoryName?: string) => {
    if (iconName && iconMap[iconName]) return iconMap[iconName]
    const name = (categoryName || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    if (name.includes("vehicul") || name.includes("voiture") || name.includes("auto")) return Car
    if (name.includes("immobilier") || name.includes("habitation")) return Building2
    if (name.includes("maison")) return Home
    if (name.includes("jardin")) return Leaf
    if (name.includes("electron") || name.includes("informat") || name.includes("telephone") || name.includes("mobile"))
      return Smartphone
    if (name.includes("meuble")) return Sofa
    if (name.includes("mode") || name.includes("vetement")) return Shirt
    if (name.includes("beaute") || name.includes("cosmet")) return Sparkles
    if (name.includes("emploi") || name.includes("service") || name.includes("job")) return Briefcase
    if (name.includes("loisir") || name.includes("divert")) return Gamepad2
    if (name.includes("animaux") || name.includes("animal")) return PawPrint
    return Gift
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {categories.map((category) => {
        const Icon = getIcon(category.icon, category.name)
        return (
          <Link key={category.id} href={`/listings?category=${category.id}`} className="group">
            <div className="hex-card">
              <div className="hex-card-inner">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base mb-1">{category.name}</h3>
                    {category.annonces_count !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {category.annonces_count.toLocaleString()} annonces
                      </p>
                    )}
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
