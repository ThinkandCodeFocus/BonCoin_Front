"use client"

import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

interface Location {
  city: string
  district: string
}

export function LocationSelector() {
  const [location, setLocation] = useState<Location>({ city: "Dakar", district: "Ouakam" })
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState(location.city)
  const [selectedDistrict, setSelectedDistrict] = useState(location.district)

  const cities = [
    "Dakar",
    "Thiès",
    "Kaolack",
    "Saint-Louis",
    "Ziguinchor",
    "Tambacounda",
    "Diourbel",
    "Louga",
    "Fatick",
    "Kolda",
    "Matam",
    "Kaffrine",
    "Kédougou",
    "Sédhiou"
  ]

  const districtsByCity: Record<string, string[]> = {
    "Dakar": ["Plateau", "Medina", "Ouakam", "Almadies", "Parcelles Assainies", "Grand Yoff", "HLM", "Sacré-Coeur"],
    "Thiès": ["Thiès Est", "Thiès Ouest", "Thiès Nord"],
    // Ajoutez d'autres quartiers selon les besoins
  }

  const districts = districtsByCity[selectedCity] || []

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation')
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation))
    }
  }, [])

  const handleSave = () => {
    const newLocation = { city: selectedCity, district: selectedDistrict }
    setLocation(newLocation)
    localStorage.setItem('userLocation', JSON.stringify(newLocation))
    setIsOpen(false)
  }

  return (
    <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full border border-background/15">
      <MapPin className="w-4 h-4 text-accent" />
      <span className="text-sm font-medium">
        {location.city}, {location.district}
      </span>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs hover:bg-background/20"
          >
            Changer
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choisir votre localisation</DialogTitle>
            <DialogDescription>
              Sélectionnez votre ville et votre quartier pour voir les annonces proches
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="city">Ville</Label>
              <select
                id="city"
                className="w-full mt-2 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  setSelectedDistrict(districtsByCity[e.target.value]?.[0] || "")
                }}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="district">Quartier</Label>
              <select
                id="district"
                className="w-full mt-2 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {districts.length > 0 ? (
                  districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))
                ) : (
                  <option value="">Tous les quartiers</option>
                )}
              </select>
            </div>
            <Button onClick={handleSave} className="w-full">
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
