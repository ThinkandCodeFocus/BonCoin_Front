"use client"

import { useCallback, useEffect, useState } from "react"

const CITY_KEY = "location_city"
const DISTRICT_KEY = "location_district"
const CHANGE_EVENT = "location-filter-change"

function readLocation() {
  if (typeof window === "undefined") return { city: "", district: "" }
  return {
    city: localStorage.getItem(CITY_KEY) || "",
    district: localStorage.getItem(DISTRICT_KEY) || "",
  }
}

/** Filtre de localisation partagé (accueil + fil d'annonces), persisté en localStorage. */
export function useLocationFilter() {
  const [location, setLocationState] = useState({ city: "", district: "" })

  useEffect(() => {
    setLocationState(readLocation())
    const onChange = () => setLocationState(readLocation())
    window.addEventListener(CHANGE_EVENT, onChange)
    window.addEventListener("storage", onChange)
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange)
      window.removeEventListener("storage", onChange)
    }
  }, [])

  const setLocation = useCallback((city: string, district?: string) => {
    if (city) localStorage.setItem(CITY_KEY, city)
    else localStorage.removeItem(CITY_KEY)
    if (district) localStorage.setItem(DISTRICT_KEY, district)
    else localStorage.removeItem(DISTRICT_KEY)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  const clearLocation = useCallback(() => {
    localStorage.removeItem(CITY_KEY)
    localStorage.removeItem(DISTRICT_KEY)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return { city: location.city, district: location.district, setLocation, clearLocation }
}
