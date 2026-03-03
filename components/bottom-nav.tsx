"use client"

import { Home, Search, PlusCircle, Heart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname.startsWith(path)
  }

  const navItems = [
    { href: "/", icon: Home, label: "Accueil", key: "bottom.home" },
    { href: "/listings", icon: Search, label: "Recherche", key: "bottom.search" },
    { href: "/publish", icon: PlusCircle, label: "Publier", isPrimary: true, key: "bottom.publish" },
    { href: "/favorites", icon: Heart, label: "Favoris", key: "bottom.favorites" },
    { href: "/profile", icon: User, label: "Profil", key: "bottom.profile" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t z-50 pb-safe">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          if (item.isPrimary) {
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="default"
                  size="icon"
                  className="flex flex-col gap-0.5 h-auto py-2 -mt-6 rounded-full w-14 h-14 shadow-xl hover:shadow-2xl transition-all hover-scale"
                >
                  <Icon className="w-6 h-6" />
                </Button>
              </Link>
            )
          }

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="icon"
                className={`flex flex-col gap-0.5 h-auto py-2 px-3 transition-all duration-200 ${
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`} data-i18n={item.key}>
                  {item.label}
                </span>
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

