"use client"

import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

type SearchBarVariant = "hero" | "top"

export function SearchBar({ variant = "hero" }: { variant?: SearchBarVariant }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (location) params.append('location', location)
    
    router.push(`/listings?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const wrapperClassName =
    variant === "top"
      ? "w-full rounded-3xl p-3 md:p-4 bg-card/90 border border-border/60 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
      : "glass-card rounded-3xl p-4 shadow-[0_26px_70px_rgba(15,23,42,0.18)] max-w-4xl"

  return (
    <div className={`flex flex-col md:flex-row gap-3 ${wrapperClassName}`}>
      <div className="flex-1 flex items-center gap-3 bg-background/75 rounded-2xl px-4 py-3.5 border border-border/50 focus-within:border-primary/50 focus-within:shadow-[0_0_0_4px_rgba(15,118,110,0.08)] transition-all">
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Que recherchez-vous ?"
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="flex-1 flex items-center gap-3 bg-background/75 rounded-2xl px-4 py-3.5 border border-border/50 focus-within:border-primary/50 focus-within:shadow-[0_0_0_4px_rgba(15,118,110,0.08)] transition-all">
        <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Ville ou région"
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <Button
        size="lg"
        className="md:w-auto rounded-2xl px-8 font-semibold shadow-lg hover:shadow-xl transition-shadow bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={handleSearch}
      >
        Rechercher
      </Button>
    </div>
  )
}
