"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/I18nProvider"

type SearchBarVariant = "hero" | "top"

export function SearchBar({ variant = "hero" }: { variant?: SearchBarVariant }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [city, setCity] = useState("")

  useEffect(() => {
    const savedCity = localStorage.getItem("location_city") || ""
    const savedDistrict = localStorage.getItem("location_district") || ""
    const fullCity = savedDistrict ? `${savedCity} - ${savedDistrict}` : savedCity
    setCity(fullCity)
  }, [])

  const { t } = useI18n()

  const runSearch = () => {
    const params = new URLSearchParams()
    if (query.trim()) params.set("search", query.trim())

    const savedCity = localStorage.getItem("location_city") || ""
    const savedDistrict = localStorage.getItem("location_district") || ""
    const typedCity = city.replace(/\s+-\s+.+$/, "").trim()

    if (typedCity) {
      localStorage.setItem("location_city", typedCity)
      localStorage.setItem("location_district", "")
    }

    const finalCity = typedCity || savedCity
    const finalDistrict = typedCity ? "" : savedDistrict
    if (finalCity) params.set("city", finalCity)
    if (finalDistrict) params.set("district", finalDistrict)

    const qs = params.toString()
    router.push(qs ? `/listings?${qs}` : "/listings")
  }

  const wrapperClassName =
    variant === "top"
      ? "w-full rounded-3xl p-3 md:p-4 bg-card/90 border border-border/60 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.12)]"
      : "glass-card rounded-3xl p-4 shadow-[0_26px_70px_rgba(15,23,42,0.18)] max-w-4xl"

  const inputBaseClass = "flex-1 flex items-center gap-3 bg-background/75 rounded-2xl px-4 py-3.5 border border-border/50 transition-all duration-300"

  return (
    <div className={`flex flex-col md:flex-row gap-3 ${wrapperClassName}`}>
      <div className={`${inputBaseClass} focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_rgba(15,118,110,0.08)] focus-within:bg-background`}>
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder={t("search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        />
      </div>
      <div className={`${inputBaseClass} focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_rgba(15,118,110,0.08)] focus-within:bg-background`}>
        <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder={t("search.location_placeholder")}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
        />
      </div>
      <Button
        size="lg"
        className="md:w-auto rounded-2xl px-6 font-semibold shadow-lg hover:shadow-xl transition-all hover-scale bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2"
        onClick={runSearch}
      >
        <span data-i18n="search.search_button">Rechercher</span>
        <ArrowRight className="w-4 h-4 hidden md:inline" />
      </Button>
    </div>
  )
}

