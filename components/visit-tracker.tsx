"use client"

import { useEffect } from "react"
import { visitService } from "@/lib/api"

const STORAGE_KEY = "visit-tracked-date"

export function VisitTracker() {
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem(STORAGE_KEY) === today) return

    visitService.track().then((result) => {
      if (result.success) {
        localStorage.setItem(STORAGE_KEY, today)
      }
    })
  }, [])

  return null
}
