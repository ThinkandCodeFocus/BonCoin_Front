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
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/listings", icon: Search, label: "Recherche" },
    { href: "/publish", icon: PlusCircle, label: "Publier", isPrimary: true },
    { href: "/favorites", icon: Heart, label: "Favoris" },
    { href: "/profile", icon: User, label: "Profil" },
  ]

return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-card/95 backdrop-blur-lg border-t border-border/60">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          if (item.isPrimary) {
            return (
              <Link key={item.href} href={item.href} className="relative -top-3">
                <Button
                  variant="default"
                  size="icon"
                  className="w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all hover-scale flex flex-col items-center justify-center gap-0.5 bg-accent text-accent-foreground"
                >
                  <Icon className="w-6 h-6" />
                </Button>
              </Link>
            )
          }

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant="ghost"
                className={`w-full h-12 flex flex-col items-center justify-center gap-0.5 rounded-none transition-all duration-200 tap-target ${
                  active 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
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

