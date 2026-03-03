"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/I18nProvider"

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
  user_type?: 'buyer' | 'seller' | 'both'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

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
            const data = (result as any).data
            if (data) {
              setUser(data)
            }
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
      
      if (result.success) {
        const data = (result as any).data
        if (data) {
          setUser(data.user)
          toast({
            title: t("toast.login_success") || "Connexion réussie",
            description: `${t("toast.welcome") || "Bienvenue"} ${data.user.name}`,
          })
          return true
        }
      }
      const message = (result as any).message
      toast({
        title: t("toast.login_error") || "Erreur de connexion",
        description: message || t("toast.invalid_credentials") || "Identifiants invalides",
        variant: "destructive",
      })
      return false
    } catch (error) {
      toast({
        title: t("toast.error") || "Erreur",
        description: t("toast.login_exception") || "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      })
      return false
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const result = await authService.register(data)
      
      if (result.success) {
        const respData = (result as any).data
        if (respData) {
          setUser(respData.user)
          toast({
            title: t("toast.register_success") || "Inscription réussie",
            description: t("toast.register_success_desc") || "Votre compte a été créé avec succès",
          })
          return true
        }
      }
      
      const errors = (result as any).errors
      const message = (result as any).message
      const errorMessage = errors 
        ? Object.values(errors).flat().join(', ')
        : message || "Erreur lors de l'inscription"
        
      toast({
        title: t("toast.register_error") || "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } catch (error) {
      toast({
        title: t("toast.error") || "Erreur",
        description: t("toast.register_exception") || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      })
      return false
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    toast({
      title: t("toast.logout") || "Déconnexion",
      description: t("toast.logout_desc") || "Vous avez été déconnecté avec succès",
    })
    router.push("/")
  }

  const refreshUser = async () => {
    const result = await authService.getUser()
    if (result.success) {
      const data = (result as any).data
      if (data) {
        setUser(data)
      }
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
