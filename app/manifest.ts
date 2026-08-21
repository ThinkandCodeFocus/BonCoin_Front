import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LeMarché - Petites annonces au Sénégal",
    short_name: "LeMarché",
    description: "Achat et vente de particulier à particulier au Sénégal",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f1e5",
    theme_color: "#2f4a3a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
