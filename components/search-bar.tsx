"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SuggestInput } from "@/components/suggest-input"
import { useI18n } from "@/components/I18nProvider"
import { useCategories } from "@/hooks/use-categories"

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
  const { categories } = useCategories()

  const runSearch = () => {
    if (query.trim()) pushRecentSearch(query)
    const params = new URLSearchParams()
    if (query.trim()) params.set("search", query.trim())
    const qs = params.toString()
    router.push(qs ? `/listings?${qs}` : "/listings")
  }

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-input bg-background pl-4 shadow-sm transition-shadow focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring ${className}`}
    >
      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
      <SuggestInput
        placeholder={t("search.placeholder") || "Rechercher sur LeMarché"}
        value={query}
        onChange={setQuery}
        options={categories.map((c) => c.name)}
        onKeyDown={(e) => e.key === "Enter" && runSearch()}
        className="border-0 shadow-none focus-visible:ring-0 rounded-none w-full h-11 px-2"
      />
      <Button size="icon" className="rounded-full m-1 shrink-0" onClick={runSearch} aria-label="Rechercher">
        <Search className="w-4 h-4" />
      </Button>
    </div>
  )
}
