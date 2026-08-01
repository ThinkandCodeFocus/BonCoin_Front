import { NextRequest, NextResponse } from "next/server"
import dns from "node:dns/promises"
import net from "node:net"

export const runtime = "nodejs"

const MAX_BYTES = 10 * 1024 * 1024

function isPrivateIp(ip: string): boolean {
  if (net.isIPv6(ip)) {
    return ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")
  }
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true
  const [a, b] = parts
  return (
    a === 127 ||
    a === 10 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  )
}

/**
 * Recharge cote serveur une image externe (produit scrape) pour contourner
 * le CORS qui bloque son chargement dans un <canvas> (carte de visite).
 * L'IP resolue est verifiee pour eviter qu'un appel direct a cette route
 * serve a sonder le reseau interne (SSRF) via un hostname arbitraire.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 })
  }

  if (["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 })
  }

  try {
    const { address } = await dns.lookup(parsed.hostname)
    if (isPrivateIp(address)) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Host not resolvable" }, { status: 400 })
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      // Certains sites fournisseurs (Cloudflare/WAF) bloquent les
      // User-Agent trop generiques : on imite un navigateur reel.
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    })

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 })
    }

    const contentType = upstream.headers.get("content-type") || ""
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 415 })
    }

    const contentLength = Number(upstream.headers.get("content-length") || "0")
    if (contentLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 })
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch {
    return NextResponse.json({ error: "Proxy error" }, { status: 502 })
  }
}
