"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { favoriteService } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface FavoritesContextType {
  favorites: number[]
  favoriteCount: number
  favoriteItems: any[] // Données complètes des favoris
  isFavorited: (annonceId: number) => boolean
  addFavorite: (annonceId: number) => Promise<void>
  removeFavorite: (annonceId: number) => Promise<void>
  loadFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<number[]>([])
  const [favoriteItems, setFavoriteItems] = useState<any[]>([])
  const [favoriteCount, setFavoriteCount] = useState(0)
  const loadFavoritesRef = useRef<(() => Promise<void>) | null>(null)

  // Fonction pour charger les favoris - SANS dépendances circulaires
  const loadFavorites = useCallback(async () => {
    console.log("📥 FavoritesContext.loadFavorites() called")
    console.log("🔐 isAuthenticated:", isAuthenticated)
    
    if (!isAuthenticated) {
      console.log("⚠️ User not authenticated, skipping load")
      return
    }
    
    try {
      const result = await favoriteService.getAll()
      console.log("📦 API Response in loadFavorites:", result)
      
      // Gérer l'erreur 401 - utilisateur non autorisé
      if (!result.success && (result as any).status === 401) {
        console.log("⚠️ 401 Unauthorized - Token may be expired")
        return
      }
      
      if (result.success && 'data' in result && Array.isArray((result as any).data)) {
        const data = (result as any).data
        console.log("✅ Got array of favorites:", data.length, "items")
        const ids = data.map((fav: any) => {
          const id = fav.annonce?.id || fav.annonce_id
          console.log("   - Favorite ID:", id, "Full object:", fav)
          return id
        })
        
        console.log("✅ Setting state - IDs:", ids)
        console.log("✅ Setting state - favoriteItems:", data)
        
        setFavorites(ids)
        setFavoriteItems(data)
        setFavoriteCount(ids.length)
      } else {
        console.error("⚠️ Unexpected API response format:", result)
        // Ne pas clear les favoris en cas d'erreur de format
        // setFavorites([])
        // setFavoriteItems([])
        // setFavoriteCount(0)
      }
    } catch (error: any) {
      console.error("❌ Error loading favorites:", error)
      // Gérer les erreurs 401 silencieusement
      if (error.status === 401 || error.statusCode === 401) {
        console.log("⚠️ 401 Unauthorized - Clearing favorites")
        setFavorites([])
        setFavoriteItems([])
        setFavoriteCount(0)
      }
      // Ne pas propager l'erreur pour ne pas crash l'app
    }
  }, [isAuthenticated]) // ONLY depends on isAuthenticated, not on itself!

  // Store loadFavorites in ref so addFavorite and removeFavorite can call it without circular deps
  useEffect(() => {
    loadFavoritesRef.current = loadFavorites
  }, [loadFavorites])

  // Charger les favoris au montage et quand l'authentification change
  useEffect(() => {
    console.log("🔄 FavoritesContext.useEffect - isAuthenticated changed to:", isAuthenticated)
    
    if (isAuthenticated) {
      console.log("📲 User authenticated, loading favorites...")
      loadFavorites()
      
      // Recharger toutes les 30 secondes
      const interval = setInterval(() => {
        console.log("⏰ Auto-reloading favorites (30s interval)")
        loadFavorites()
      }, 60000)
      
      return () => clearInterval(interval)
    } else {
      console.log("🔐 User not authenticated, clearing favorites")
      setFavorites([])
      setFavoriteItems([])
      setFavoriteCount(0)
    }
  }, [isAuthenticated, loadFavorites])

  const isFavorited = useCallback((annonceId: number) => {
    const result = favorites.includes(annonceId)
    console.log("❓ isFavorited(" + annonceId + "):", result)
    return result
  }, [favorites])

  const addFavorite = useCallback(async (annonceId: number) => {
    console.log("❤️ addFavorite called for:", annonceId)
    try {
      const result = await favoriteService.add(annonceId)
      console.log("➕ API response:", result)
      
      if (result.success) {
        console.log("✅ Successfully added to favorites")
        // Update local state immediately for UI responsiveness
        setFavorites((prev) => [...prev, annonceId])
        setFavoriteCount((prev) => prev + 1)
        
        // Then reload from server to get complete data
        console.log("🔄 Reloading favorites to get complete data...")
        if (loadFavoritesRef.current) {
          await loadFavoritesRef.current()
        }
      } else {
        console.error("❌ Failed to add favorite:", result)
      }
    } catch (error) {
      console.error("❌ Error in addFavorite:", error)
    }
  }, [])

  const removeFavorite = useCallback(async (annonceId: number) => {
    console.log("💔 removeFavorite called for:", annonceId)
    try {
      const result = await favoriteService.remove(annonceId)
      console.log("➖ API response:", result)
      
      if (result.success) {
        console.log("✅ Successfully removed from favorites")
        setFavorites((prev) => prev.filter((id) => id !== annonceId))
        setFavoriteItems((prev) => prev.filter((item) => item.annonce?.id !== annonceId))
        setFavoriteCount((prev) => Math.max(0, prev - 1))
      } else {
        console.error("❌ Failed to remove favorite:", result)
      }
    } catch (error) {
      console.error("❌ Error in removeFavorite:", error)
    }
  }, [])

  const value: FavoritesContextType = {
    favorites,
    favoriteCount,
    favoriteItems,
    isFavorited,
    addFavorite,
    removeFavorite,
    loadFavorites,
  }

  console.log("🎨 FavoritesContext value:", value)

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
