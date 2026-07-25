"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SuggestInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange"> {
  value: string
  onChange: (value: string) => void
  options: string[]
  maxSuggestions?: number
}

/**
 * Champ texte avec suggestions filtrées au fur et à mesure de la saisie
 * (ex: catégories pour la barre de recherche, villes pour la localisation).
 */
export function SuggestInput({
  value,
  onChange,
  options,
  maxSuggestions = 6,
  className,
  ...inputProps
}: SuggestInputProps) {
  const [isOpen, setIsOpen] = useState(false)

  const query = value.trim().toLowerCase()
  const suggestions =
    query.length > 0
      ? options.filter((o) => o.toLowerCase().includes(query) && o.toLowerCase() !== query).slice(0, maxSuggestions)
      : []

  const showSuggestions = isOpen && suggestions.length > 0

  return (
    <div className="relative flex-1 min-w-0 w-full">
      <Input
        {...inputProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className={className}
      />
      {showSuggestions && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 border rounded-md bg-card shadow-md overflow-hidden">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(suggestion)
                setIsOpen(false)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
