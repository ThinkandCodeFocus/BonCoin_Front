"use client"

import { useState } from "react"
import { MapPin, X } from "lucide-react"
import { SuggestInput } from "@/components/suggest-input"
import { useLocationFilter } from "@/hooks/use-location-filter"
import { SENEGAL_CITIES_COORDS } from "@/lib/geolocation"
import { cn } from "@/lib/utils"

const DAKAR_QUARTIERS = [
  "Almadies",
  "Plateau",
  "Médina",
  "Parcelles Assainies",
  "Grand Yoff",
  "Ouakam",
  "Ngor",
  "Yoff",
  "Sacré-Cœur",
  "Liberté",
  "Mermoz",
  "Point E",
  "HLM",
  "Pikine",
  "Guédiawaye",
  "Rufisque",
  "Diamniadio",
  "Keur Massar",
]

const CITY_OPTIONS = Object.keys(SENEGAL_CITIES_COORDS)

export function LocationPicker() {
  const { city, district, setLocation, clearLocation } = useLocationFilter()
  const [query, setQuery] = useState("")

  const activeLabel = district ? `${district}, ${city}` : city

  const commitCity = (value: string) => {
    setLocation(value)
    setQuery("")
  }

  return (
    <div className="border-2 border-ink radius-indie-alt bg-card px-4 py-3.5 shadow-hard-sm">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-semibold truncate">
          {city ? `Annonces à ${activeLabel}` : "Où cherchez-vous ?"}
        </span>
        {city && (
          <button
            type="button"
            onClick={() => {
              clearLocation()
              setQuery("")
            }}
            className="ml-auto flex items-center gap-1 shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
        )}
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-28px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-28px),transparent)]"
      >
        {DAKAR_QUARTIERS.map((quartier) => (
          <button
            key={quartier}
            type="button"
            onClick={() => setLocation("Dakar", quartier)}
            className={cn(
              "shrink-0 snap-start whitespace-nowrap rounded-full border-2 border-ink px-3.5 py-2 text-xs font-semibold press-hard",
              district === quartier ? "bg-primary text-primary-foreground" : "bg-background"
            )}
          >
            {quartier}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <SuggestInput
          placeholder="Ou une autre ville (Thiès, Saint-Louis...)"
          value={query}
          onChange={(value) => {
            setQuery(value)
            const match = CITY_OPTIONS.find((c) => c.toLowerCase() === value.trim().toLowerCase())
            if (match) commitCity(match)
          }}
          options={CITY_OPTIONS}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) commitCity(query.trim())
          }}
          className="rounded-full text-sm h-10"
        />
      </div>
    </div>
  )
}
