"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, Lock, Ban, ServerCrash, Info } from "lucide-react"

interface GlobalErrorProps {
  error: Error & { digest?: string; statusCode?: number }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Global application error:", error)
  }, [error])

  // Déterminer le type d'erreur et les détails
  const statusCode = (error as any)?.statusCode || (error as any)?.response?.status || 500
  const message = error.message || "Une erreur critique s'est produite"

  const getErrorInfo = (code: number) => {
    switch (code) {
      case 400:
        return {
          title: "Requête invalide",
          description: "Les données envoyées ne sont pas valides. Veuillez vérifier vos informations.",
          icon: AlertTriangle,
          color: "bg-yellow-100 dark:bg-yellow-900/30",
          iconColor: "text-yellow-500",
        }
      case 401:
        return {
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
          icon: Lock,
          color: "bg-blue-100 dark:bg-blue-900/30",
          iconColor: "text-blue-500",
        }
      case 403:
        return {
          title: "Accès refusé",
          description: "Vous n'avez pas l'autorisation d'accéder à cette ressource.",
          icon: Ban,
          color: "bg-red-100 dark:bg-red-900/30",
          iconColor: "text-red-500",
        }
      case 404:
        return {
          title: "Page introuvable",
          description: "La page que vous recherchez n'existe pas.",
          icon: Info,
          color: "bg-gray-100 dark:bg-gray-900/30",
          iconColor: "text-gray-500",
        }
      case 500:
      case 502:
      case 503:
        return {
          title: "Erreur serveur critique",
          description: "Nos serveurs rencontrent des difficultés. Veuillez réessayer plus tard.",
          icon: ServerCrash,
          color: "bg-red-100 dark:bg-red-900/30",
          iconColor: "text-red-500",
        }
      default:
        return {
          title: "Erreur critique",
          description: message,
          icon: AlertTriangle,
          color: "bg-red-100 dark:bg-red-900/30",
          iconColor: "text-red-500",
        }
    }
  }

  const errorInfo = getErrorInfo(statusCode)
  const Icon = errorInfo.icon

  return (
    <html lang="fr">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
          <div className="text-center space-y-6 max-w-md">
            {/* Error Code Display */}
            <div className="relative">
              <h1 className="text-[120px] font-bold text-gray-200 dark:text-gray-700 leading-none select-none">
                {statusCode}
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-24 h-24 ${errorInfo.color} rounded-full flex items-center justify-center mx-auto`}>
                  <Icon className={`w-12 h-12 ${errorInfo.iconColor}`} />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {errorInfo.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {errorInfo.description}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 font-mono">
                  Code: {error.digest}
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
              <Button 
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

