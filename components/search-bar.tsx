"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/I18nProvider"

const RECENT_SEARCHES_KEY = "recent_searches"
const MAX_RECENT_SEARCHES = 5

export function pushRecentSearch(query: string) {
  if (!query.trim()) return
  const existing = getRecentSearches()
  const next = [query.trim(), ...existing.filter((q) => q.toLowerCase() !== query.trim().toLowerCase())].slice(
    0,
    MAX_RECENT_SEARCHES
  )
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
}

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const { t } = useI18n()

  const runSearch = () => {
    if (query.trim()) pushRecentSearch(query)
    const params = new URLSearchParams()
    if (query.trim()) params.set("search", query.trim())
    const qs = params.toString()
    router.push(qs ? `/listings?${qs}` : "/listings")
  }

  return (
    <div className={`flex items-center border rounded-full bg-background overflow-hidden ${className}`}>
      <Input
        placeholder={t("search.placeholder") || "Rechercher sur LeMarché"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && runSearch()}
        className="border-0 shadow-none focus-visible:ring-0 rounded-none"
      />
      <Button size="icon" className="rounded-full m-1 shrink-0" onClick={runSearch} aria-label="Rechercher">
        <Search className="w-4 h-4" />
      </Button>
    </div>
  )
}
