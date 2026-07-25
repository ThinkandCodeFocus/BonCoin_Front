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
  'Rufisque': { lat: 14.7167, lng: -17.2667 },
  'Guédiawaye': { lat: 14.7833, lng: -17.4100 },
  'Pikine': { lat: 14.7549, lng: -17.3900 },
  'Touba': { lat: 14.8667, lng: -15.8833 },
  'Mbour': { lat: 14.4198, lng: -16.9645 },
  'Tivaouane': { lat: 14.9500, lng: -16.8167 },
  'Mbacké': { lat: 14.7936, lng: -15.9067 },
  'Bambey': { lat: 14.7000, lng: -16.4500 },
  'Richard-Toll': { lat: 16.4625, lng: -15.7003 },
  'Joal-Fadiouth': { lat: 14.1667, lng: -16.8333 },
  'Diamniadio': { lat: 14.7167, lng: -17.1833 },
  'Dagana': { lat: 16.5167, lng: -15.5000 },
  'Podor': { lat: 16.6500, lng: -14.9667 },
  'Guinguinéo': { lat: 14.2667, lng: -15.9500 },
  'Nioro du Rip': { lat: 13.7500, lng: -15.8000 },
  'Foundiougne': { lat: 14.1333, lng: -16.4667 },
  'Gossas': { lat: 14.4922, lng: -16.0653 },
  'Birkelane': { lat: 14.1167, lng: -15.7333 },
  'Koungheul': { lat: 13.9833, lng: -14.8000 },
  'Bakel': { lat: 14.9000, lng: -12.4667 },
  'Goudiry': { lat: 14.1833, lng: -12.7167 },
  'Salémata': { lat: 12.6333, lng: -12.8500 },
  'Saraya': { lat: 12.8500, lng: -11.7500 },
  'Vélingara': { lat: 13.1500, lng: -14.1167 },
  'Médina Yoro Foula': { lat: 13.5333, lng: -14.9167 },
  'Bounkiling': { lat: 12.8667, lng: -15.6833 },
  'Goudomp': { lat: 12.5167, lng: -15.4333 },
  'Bignona': { lat: 12.8167, lng: -16.2333 },
  'Oussouye': { lat: 12.4850, lng: -16.5478 },
  'Kébémer': { lat: 15.3667, lng: -16.4500 },
  'Linguère': { lat: 15.4000, lng: -15.1167 },
  'Kanel': { lat: 15.4939, lng: -13.1758 },
  'Ranérou': { lat: 15.3000, lng: -13.9667 },
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
