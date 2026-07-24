"use client"

import { useEffect, useState } from "react"
import { categoryService } from "@/lib/api"

export interface Category {
  id: number
  name: string
  icon?: string
  annonces_count?: number
}

/**
 * Catégories réelles depuis le backend (`GET /categories`).
 *
 * Ne jamais coder en dur des ids de catégorie côté front : ils ne correspondent
 * pas forcément à l'ordre "attendu" et un lien vers la mauvaise catégorie fait
 * disparaître silencieusement les annonces de l'utilisateur des résultats.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await categoryService.getAll()
      if (cancelled) return

      if (result.success && result.data) {
        let data: any = (result.data as any).data ?? result.data
        if (data?.data && Array.isArray(data.data)) data = data.data
        setCategories(Array.isArray(data) ? data : [])
      }
      setIsLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { categories, isLoading }
}
