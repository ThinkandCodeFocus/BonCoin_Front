// Coordonnées des principales villes du Sénégal
export const SENEGAL_CITIES_COORDS: Record<string, { lat: number; lng: number }> = {
  'Dakar': { lat: 14.6937, lng: -17.4441 },
  'Thiès': { lat: 14.7886, lng: -16.9260 },
  'Kaolack': { lat: 14.1522, lng: -16.0759 },
  'Saint-Louis': { lat: 16.0179, lng: -16.4897 },
  'Ziguinchor': { lat: 12.5834, lng: -16.2659 },
  'Tambacounda': { lat: 13.7703, lng: -13.6677 },
  'Diourbel': { lat: 14.6563, lng: -16.2310 },
  'Louga': { lat: 15.6158, lng: -16.2265 },
  'Fatick': { lat: 14.3386, lng: -16.4113 },
  'Kolda': { lat: 12.9082, lng: -14.9508 },
  'Matam': { lat: 15.6558, lng: -13.2558 },
  'Kaffrine': { lat: 14.1064, lng: -15.5503 },
  'Kédougou': { lat: 12.5578, lng: -12.1744 },
  'Sédhiou': { lat: 12.7077, lng: -15.5567 },
}

/**
 * Obtenir les coordonnées approximatives d'une ville
 */
export function getCityCoordinates(city: string): { lat: number; lng: number } | null {
  for (const [cityName, coords] of Object.entries(SENEGAL_CITIES_COORDS)) {
    if (city.toLowerCase().includes(cityName.toLowerCase()) || cityName.toLowerCase().includes(city.toLowerCase())) {
      return coords
    }
  }
  return null
}

/**
 * Calculer la distance entre deux points (formule de Haversine)
 * Retourne la distance en kilomètres
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Rayon de la Terre en km

  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Obtenir la géolocalisation de l'utilisateur
 */
export async function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported')
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        console.warn('Error getting location:', error)
        resolve(null)
      },
      {
        timeout: 5000,
        maximumAge: 60000,
      }
    )
  })
}
