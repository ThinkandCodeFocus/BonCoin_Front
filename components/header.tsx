"use client"

import { Bell, Heart, MessageSquare, User, Menu, LogOut, LogIn, Moon, Sun, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useAuth } from "@/contexts/AuthContext"
import { useFavorites } from "@/contexts/FavoritesContext"
import { AuthDialog } from "@/components/auth-dialog"
import { useTheme } from "next-themes"
import { resolveStorageUrl } from "@/lib/media"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { notificationService, messageService } from "@/lib/api"

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { favoriteCount } = useFavorites()
  const [notificationCount, setNotificationCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authTab, setAuthTab] = useState<"login" | "register">("login")
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Charger les compteurs de notifications et messages
  useEffect(() => {
    if (isAuthenticated) {
      loadCounts()
      // Recharger toutes les 30 secondes
      const interval = setInterval(loadCounts, 30000)
      return () => clearInterval(interval)
    } else {
      setNotificationCount(0)
      setMessageCount(0)
    }
  }, [isAuthenticated])

  const loadCounts = async () => {
    const [notifResult, messageResult] = await Promise.all([
      notificationService.getUnreadCount(),
      messageService.getUnreadCount(),
    ])

    if (notifResult.success) {
      setNotificationCount(notifResult.data)
    }
    if (messageResult.success) {
      setMessageCount(messageResult.data)
    }
  }

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/70">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary via-primary/80 to-accent/80 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/30 group-hover:shadow-xl transition-shadow">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <span className="display-font font-bold text-xl hidden md:block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Marketplace
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" title="Accueil">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Basculer le thème"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            
            {isAuthenticated ? (
              <>
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
                  <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
                    <Heart className="w-5 h-5" />
                    {favoriteCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground border-2 border-background">
                        {favoriteCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                        <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={user?.photo ? resolveStorageUrl(user.photo) : undefined} 
                        />
                        <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Mon profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/annonces">Mes annonces</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link href="/publish">
                  <Button className="font-semibold ml-2 rounded-full px-6 shadow-lg hover:shadow-xl transition-shadow bg-accent text-accent-foreground hover:bg-accent/90">
                    Déposer une annonce
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAuthTab("login")
                    setShowAuthDialog(true)
                  }}
                  className="rounded-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Connexion
                </Button>
                <Button
                  onClick={() => {
                    setAuthTab("register")
                    setShowAuthDialog(true)
                  }}
                  className="font-semibold rounded-full px-6 shadow-lg hover:shadow-xl transition-shadow bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Inscription
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Basculer le thème"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
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
      
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} defaultTab={authTab} />
    </header>
  )
}
