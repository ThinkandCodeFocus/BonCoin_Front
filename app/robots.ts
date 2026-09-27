import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lemarche.xalass.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/publish", "/messages", "/profile", "/notifications", "/auth"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
