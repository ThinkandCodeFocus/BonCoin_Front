"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  name: string
  email: string
  phone?: string
  photo?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (login: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  language?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          // Rafraîchir les données utilisateur
          const result = await authService.getUser()
          if (result.success) {
            setUser(result.data)
          }
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (login: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.login(login, password)
      
      if (result.success && result.data) {
        setUser(result.data.user)
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${result.data.user.name}`,
        })
        return true
      } else {
        toast({
          title: "Erreur de connexion",
          description: result.message || "Identifiants invalides",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      })
      return false
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const result = await authService.register(data)
      
      if (result.success && result.data) {
        setUser(result.data.user)
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès",
        })
        return true
      } else {
        const errorMessage = result.errors 
          ? Object.values(result.errors).flat().join(', ')
          : result.message || "Erreur lors de l'inscription"
        
        toast({
          title: "Erreur d'inscription",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      })
      return false
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    })
    router.push("/")
  }

  const refreshUser = async () => {
    const result = await authService.getUser()
    if (result.success) {
      setUser(result.data)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
