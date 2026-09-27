"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Devient true la premiere fois que l'element entre dans le viewport, pour
 * declencher une apparition progressive au scroll. Ne se declenche qu'une
 * fois (pas de reveal/hide en boucle en remontant). Si l'utilisateur prefere
 * les animations reduites, le contenu est visible immediatement.
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}
