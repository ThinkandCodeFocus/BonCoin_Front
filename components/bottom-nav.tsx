"use client"

import { Home, Search, PlusCircle, Heart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex items-center justify-around py-2">
        <Link href="/">
          <Button variant={isActive("/") ? "default" : "ghost"} size="icon" className="flex flex-col gap-1 h-auto py-2">
            <Home className="w-5 h-5" />
            <span className="text-xs">Accueil</span>
          </Button>
        </Link>
        <Link href="/listings">
          <Button
            variant={isActive("/listings") ? "default" : "ghost"}
            size="icon"
            className="flex flex-col gap-1 h-auto py-2"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Recherche</span>
          </Button>
        </Link>
        <Link href="/publish">
          <Button
            variant="default"
            size="icon"
            className="flex flex-col gap-1 h-auto py-2 -mt-6 rounded-full w-14 h-14"
          >
            <PlusCircle className="w-6 h-6" />
          </Button>
        </Link>
        <Link href="/favorites">
          <Button
            variant={isActive("/favorites") ? "default" : "ghost"}
            size="icon"
            className="flex flex-col gap-1 h-auto py-2"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">Favoris</span>
          </Button>
        </Link>
        <Link href="/profile">
          <Button
            variant={isActive("/profile") ? "default" : "ghost"}
            size="icon"
            className="flex flex-col gap-1 h-auto py-2"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profil</span>
          </Button>
        </Link>
      </div>
    </nav>
  )
}
