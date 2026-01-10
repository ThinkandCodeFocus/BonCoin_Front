"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Smartphone, Home, Car, Shirt, Sofa, Briefcase, BookOpen, Gift, Loader2 } from "lucide-react"
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

  const getIcon = (iconName?: string) => {
    if (!iconName) return Gift
    return iconMap[iconName] || Gift
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {categories.map((category) => {
        const Icon = getIcon(category.icon)
        return (
          <Link key={category.id} href={`/listings?category=${category.id}`}>
            <Card className="p-6 md:p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer group border-border/50 hover:border-primary/20 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">{category.name}</h3>
                  {category.annonces_count !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      {category.annonces_count.toLocaleString()} annonces
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
