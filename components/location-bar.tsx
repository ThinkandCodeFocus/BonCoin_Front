"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/components/I18nProvider"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LocationBar() {
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const { t } = useI18n()

  useEffect(() => {
    const savedCity = localStorage.getItem("location_city") || ""
    const savedDistrict = localStorage.getItem("location_district") || ""
    setCity(savedCity)
    setDistrict(savedDistrict)
  }, [])

  const handleSave = () => {
    localStorage.setItem("location_city", city.trim())
    localStorage.setItem("location_district", district.trim())
    setIsEditing(false)
  }

  return (
    <div className="mt-4">
      {!isEditing ? (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {city || district ? `${city || t("location.city")}${district ? `, ${district}` : ""}` : t("location.city") + ", " + t("location.district")}
            </span>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsEditing(true)}>
            <span data-i18n="location.change">Changer</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto] rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
          <Input
            placeholder={t("location.city") + " (ex: Dakar)"}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            placeholder={t("location.district") + " (ex: Ouakam)"}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <Button className="rounded-full" onClick={handleSave}>
            <span data-i18n="location.save">Enregistrer</span>
          </Button>
        </div>
      )}
    </div>
  )
}
