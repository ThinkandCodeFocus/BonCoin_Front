"use client"

import { Bell, Heart, MessageSquare, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
  const [notificationCount] = useState(3)
  const [messageCount] = useState(2)

  return (
    <header className="sticky top-0 z-50 glass-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <span className="font-bold text-xl hidden md:block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Marketplace
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
                <MessageSquare className="w-5 h-5" />
                {messageCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground border-2 border-background">
                    {messageCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground border-2 border-background">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/publish">
              <Button className="font-semibold ml-2 rounded-full px-6 shadow-lg hover:shadow-xl transition-shadow bg-accent text-accent-foreground hover:bg-accent/90">
                Déposer une annonce
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/messages">
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Messages
                      {messageCount > 0 && <Badge className="ml-auto">{messageCount}</Badge>}
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost" className="w-full justify-start">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications
                      {notificationCount > 0 && <Badge className="ml-auto">{notificationCount}</Badge>}
                    </Button>
                  </Link>
                  <Link href="/favorites">
                    <Button variant="ghost" className="w-full justify-start">
                      <Heart className="w-5 h-5 mr-2" />
                      Favoris
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-5 h-5 mr-2" />
                      Mon profil
                    </Button>
                  </Link>
                  <Link href="/publish">
                    <Button className="w-full mt-4">Déposer une annonce</Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
