"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, Lock, Ban, ServerCrash, Info } from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string; statusCode?: number }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Application error:", error)
  }, [error])

  // Déterminer le type d'erreur et les détails
  const statusCode = (error as any)?.statusCode || (error as any)?.response?.status || 500
  const message = error.message || "Une erreur inattendue s'est produite"

  const getErrorInfo = (code: number) => {
    switch (code) {
      case 400:
        return {
          title: "Requête invalide",
          description: "Les données envoyées ne sont pas valides. Veuillez vérifier vos informations.",
          icon: AlertTriangle,
          color: "bg-accent",
          iconColor: "text-primary",
        }
      case 401:
        return {
          title: "Authentification requise",
          description: "Vous devez être connecté pour accéder à cette page.",
          icon: Lock,
          color: "bg-secondary/15",
          iconColor: "text-secondary",
        }
      case 403:
        return {
          title: "Accès refusé",
          description: "Vous n'avez pas l'autorisation d'accéder à cette ressource.",
          icon: Ban,
          color: "bg-destructive/10",
          iconColor: "text-destructive",
        }
      case 404:
        return {
          title: "Ressource introuvable",
          description: "La page ou la ressource demandée n'existe pas.",
          icon: Info,
          color: "bg-muted",
          iconColor: "text-muted-foreground",
        }
      case 500:
      case 502:
      case 503:
        return {
          title: "Erreur serveur",
          description: "Une erreur s'est produite sur nos serveurs. Veuillez réessayer plus tard.",
          icon: ServerCrash,
          color: "bg-destructive/10",
          iconColor: "text-destructive",
        }
      default:
        return {
          title: "Une erreur s'est produite",
          description: message,
          icon: AlertTriangle,
          color: "bg-destructive/10",
          iconColor: "text-destructive",
        }
    }
  }

  const errorInfo = getErrorInfo(statusCode)
  const Icon = errorInfo.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Code Display */}
        <div className="relative">
          <h1 className="text-[120px] font-bold text-foreground/10 leading-none select-none" aria-hidden="true">
            {statusCode}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 ${errorInfo.color} rounded-full flex items-center justify-center`}>
              <Icon className={`w-12 h-12 ${errorInfo.iconColor}`} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {errorInfo.title}
          </h2>
          <p className="text-muted-foreground">
            {errorInfo.description}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/70 font-mono">
              Code de référence: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={() => reset()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        {/* Support Info */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Le problème persiste?{" "}
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Rafraîchir la page
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

