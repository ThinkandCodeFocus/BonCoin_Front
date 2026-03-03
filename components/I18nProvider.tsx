"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import fr from "../locales/fr.json"
import wo from "../locales/wo.json"

type Lang = "fr" | "wo"

type I18nContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  fr: fr as unknown as Record<string, string>,
  wo: wo as unknown as Record<string, string>,
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const ls = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null
      return (ls as Lang) || "fr"
    } catch (e) {
      return "fr"
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem("lang", lang)
    } catch (e) {
      // ignore
    }
  }, [lang])

  const setLang = (l: Lang) => setLangState(l)

  const t = (key: string) => {
    const v = TRANSLATIONS[lang][key]
    if (v) return v
    // fallback to fr then key
    return TRANSLATIONS["fr"][key] || key
  }

  const pathname = usePathname()

  // Auto-translate elements with data-i18n attribute when language changes or on navigation
  useEffect(() => {
    if (typeof document === "undefined") return
    const nodes = document.querySelectorAll<HTMLElement>("[data-i18n]")
    nodes.forEach((n) => {
      const key = n.getAttribute("data-i18n") || ""
      if (!key) return
      const translated = t(key)
      // Replace only text content to avoid breaking elements with children
      n.textContent = translated
    })
  }, [lang, pathname])

  const value = useMemo(() => ({ lang, setLang, t }), [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}

export default I18nProvider
