"use client"

import { Home, Search, PlusCircle, Heart, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

export function BottomNav() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const canSell = isAuthenticated && user?.user_type !== "buyer"

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  const navItems = [
    { href: "/", icon: Home, label: "Accueil", key: "bottom.home" },
    { href: "/listings", icon: Search, label: "Recherche", key: "bottom.search" },
    ...(canSell ? [{ href: "/publish", icon: PlusCircle, label: "Publier", key: "bottom.publish" }] : []),
    { href: "/favorites", icon: Heart, label: "Favoris", key: "bottom.favorites" },
    { href: "/profile", icon: User, label: "Profil", key: "bottom.profile" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-card border-t-2 border-ink">
      <div className="flex items-stretch h-14">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground",
                active && "text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium" data-i18n={item.key}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
