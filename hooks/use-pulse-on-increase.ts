"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Retourne true brièvement quand `value` augmente (ex: un compteur de
 * notifications non lues) — pour déclencher une micro-interaction ponctuelle
 * sur un badge, jamais une animation en boucle.
 */
export function usePulseOnIncrease(value: number, durationMs = 420) {
  const [pulsing, setPulsing] = useState(false)
  const previous = useRef(value)

  useEffect(() => {
    if (value > previous.current) {
      setPulsing(true)
      const timeout = setTimeout(() => setPulsing(false), durationMs)
      previous.current = value
      return () => clearTimeout(timeout)
    }
    previous.current = value
  }, [value, durationMs])

  return pulsing
}
