"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const DISMISS_KEY = "pwa-install-dismissed"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    if (isStandalone || localStorage.getItem(DISMISS_KEY)) return

    const iOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent)

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    if (iOS) {
      setIsIOS(true)
      setShowBanner(true)
    } else {
      window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
  }, [])

  const dismiss = () => {
    setShowBanner(false)
    localStorage.setItem(DISMISS_KEY, "1")
  }

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    dismiss()
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-card border-2 border-ink radius-indie shadow-hard p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Download className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Installer LeMarché</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isIOS
            ? 'Appuyez sur Partager puis "Sur l\'écran d\'accueil" pour installer l\'application.'
            : "Ajoutez LeMarché à votre écran d'accueil pour un accès rapide, comme une application."}
        </p>
        {!isIOS && (
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={install}>
              Installer
            </Button>
            <Button size="sm" variant="outline" onClick={dismiss}>
              Plus tard
            </Button>
          </div>
        )}
      </div>
      <button onClick={dismiss} aria-label="Fermer" className="text-muted-foreground shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
