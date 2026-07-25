"use client"

import { Bell, Heart, MessageSquare, User, Menu, LogOut, LogIn, Moon, Sun, Plus } from "lucide-react"
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
import { useMessageNotifications } from "@/contexts/MessageNotificationContext"
import { SearchBar } from "@/components/search-bar"
import { useCategories } from "@/hooks/use-categories"

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { favoriteCount } = useFavorites()
  const { categories } = useCategories()
  const { unreadCount: messageCount, notificationCount } = useMessageNotifications()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authTab, setAuthTab] = useState<"login" | "register">("login")
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-card border-b">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center shrink-0">
              <span className="text-xl font-bold text-primary">LeMarché</span>
            </Link>
            <Link href="/publish" className="hidden md:block">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Déposer une annonce
              </Button>
            </Link>
          </div>

          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar />
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Basculer le thème"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                <Link href="/favorites">
                  <Button variant="ghost" size="sm" className="relative gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>Favoris</span>
                    {favoriteCount > 0 && (
                      <Badge className="ml-1">{favoriteCount}</Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="sm" className="relative gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>Messages</span>
                    {messageCount > 0 && (
                      <Badge className="ml-1">{messageCount}</Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    {notificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 px-1 min-w-4 justify-center">{notificationCount}</Badge>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Avatar className="w-7 h-7">
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
                      <Link href="/profile?tab=listings">Mes annonces</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAuthTab("login")
                    setShowAuthDialog(true)
                  }}
                  className="gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAuthTab("register")
                    setShowAuthDialog(true)
                  }}
                >
                  Inscription
                </Button>
              </>
            )}
          </nav>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center gap-1">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Basculer le thème"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-1 mt-8">
                  <Link href="/messages">
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                      {messageCount > 0 && <Badge className="ml-auto">{messageCount}</Badge>}
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost" className="w-full justify-start">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                      {notificationCount > 0 && <Badge className="ml-auto">{notificationCount}</Badge>}
                    </Button>
                  </Link>
                  <Link href="/favorites">
                    <Button variant="ghost" className="w-full justify-start">
                      <Heart className="w-4 h-4 mr-2" />
                      Favoris
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Mon profil
                    </Button>
                  </Link>
                  {!isAuthenticated && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setAuthTab("login")
                        setShowAuthDialog(true)
                      }}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Connexion
                    </Button>
                  )}
                  <Link href="/publish">
                    <Button className="w-full mt-3 gap-1.5">
                      <Plus className="w-4 h-4" />
                      Déposer une annonce
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <SearchBar />
        </div>

        <nav className="hidden md:flex items-center gap-2 h-10 -mb-px overflow-x-auto">
          {categories.map((category, index) => (
            <span key={category.id} className="flex items-center gap-2">
              {index > 0 && <span className="text-muted-foreground">·</span>}
              <Link
                href={`/listings?category=${category.id}`}
                className="text-sm border-b-2 border-transparent px-0.5 h-10 flex items-center whitespace-nowrap text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                {category.name}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} defaultTab={authTab} />
    </header>
  )
}
