"use client"

import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBar() {
  return (
    <div className="flex flex-col md:flex-row gap-3 glass-card rounded-2xl p-4 shadow-2xl max-w-4xl">
      <div className="flex-1 flex items-center gap-3 bg-background/80 rounded-xl px-4 py-3.5 border border-border/50 focus-within:border-primary/50 transition-colors">
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Que recherchez-vous ?"
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        />
      </div>
      <div className="flex-1 flex items-center gap-3 bg-background/80 rounded-xl px-4 py-3.5 border border-border/50 focus-within:border-primary/50 transition-colors">
        <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Ville ou région"
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        />
      </div>
      <Button
        size="lg"
        className="md:w-auto rounded-xl px-8 font-semibold shadow-lg hover:shadow-xl transition-shadow bg-accent text-accent-foreground hover:bg-accent/90"
      >
        Rechercher
      </Button>
    </div>
  )
}
