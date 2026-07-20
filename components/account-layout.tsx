"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Heart, MessageSquare, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/profile?tab=listings", match: "/profile", label: "Mes annonces", icon: Package },
  { href: "/profile?tab=favorites", match: "/profile", label: "Favoris", icon: Heart },
  { href: "/messages", match: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/profile/settings", match: "/profile/settings", label: "Paramètres", icon: Settings },
]

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <aside className="md:sticky md:top-20 md:self-start">
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const active =
              item.match === "/profile/settings"
                ? pathname === "/profile/settings"
                : item.match === "/profile"
                  ? pathname === "/profile"
                  : pathname.startsWith(item.match)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap",
                  active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  )
}
