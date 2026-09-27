"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void | Promise<void>
}

/**
 * Bouton "Continuer avec Google" (Google Identity Services). Gère le cas où
 * le script est déjà chargé (dialog rouverte) et celui où il vient de charger.
 */
export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const [scriptReady, setScriptReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      setScriptReady(true)
    }
  }, [])

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!scriptReady || !clientId || !containerRef.current || !window.google) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => onCredential(response.credential),
    })
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      locale: "fr",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="flex justify-center" />
    </>
  )
}
