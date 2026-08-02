"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { signupBannerService } from "@/lib/api"
import { Button } from "@/components/ui/button"

const DISMISSED_KEY = "signup-banner-dismissed-version"
const DISPLAY_DURATION = 60_000

export function SignupBanner() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isLoading || isAuthenticated) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    signupBannerService.getVersion().then((result) => {
      if (cancelled || !result.success) return
      const version = (result as any).data?.version ?? 0
      if (version <= 0) return

      const dismissedVersion = Number(localStorage.getItem(DISMISSED_KEY) || 0)
      if (version <= dismissedVersion) return

      // Marque la campagne comme vue des maintenant : la banniere ne doit
      // s'afficher qu'une fois, meme si l'utilisateur change de page avant
      // la fin du delai d'affichage.
      localStorage.setItem(DISMISSED_KEY, String(version))
      setVisible(true)
      timer = setTimeout(() => setVisible(false), DISPLAY_DURATION)
    })

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading])

  if (!visible) return null

  return (
    <div className="fixed top-16 md:top-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-secondary text-secondary-foreground border-2 border-ink radius-indie shadow-hard p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Rejoignez LeMarché</p>
        <p className="text-xs opacity-80 mt-0.5">
          Créez un compte gratuitement pour acheter et vendre en toute sécurité.
        </p>
        <div className="mt-3">
          <Button
            size="sm"
            onClick={() => {
              setVisible(false)
              router.push("/auth")
            }}
          >
            Créer un compte
          </Button>
        </div>
      </div>
      <button onClick={() => setVisible(false)} aria-label="Fermer" className="opacity-70 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
