"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin } from "lucide-react"
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

  const isTop = variant === "top"

  return (
    <div
      className={`flex flex-col md:flex-row md:items-stretch border rounded-md bg-card divide-y md:divide-y-0 md:divide-x ${
        isTop ? "" : "max-w-3xl"
      }`}
    >
      <div className="flex-1 flex items-center gap-2 px-3 py-2.5">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          placeholder={t("search.placeholder") || "Que recherchez-vous ?"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          className="border-0 shadow-none px-0 h-auto focus-visible:ring-0"
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 md:w-56">
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          placeholder={t("search.location_placeholder") || "Ville ou code postal"}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          className="border-0 shadow-none px-0 h-auto focus-visible:ring-0"
        />
      </div>
      <div className="p-2">
        <Button className="w-full md:w-auto" onClick={runSearch}>
          {t("search.search_button") || "Rechercher"}
        </Button>
      </div>
    </div>
  )
}
