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
import { messageService } from "@/lib/api"
import { useMessageNotifications } from "@/contexts/MessageNotificationContext"

const categoryNav = [
  { label: "Immobilier", href: "/listings?category=2" },
  { label: "Véhicules", href: "/listings?category=3" },
  { label: "Emploi", href: "/listings?category=7" },
  { label: "Loisirs", href: "/listings?category=8" },
  { label: "Maison", href: "/listings?category=4" },
  { label: "Mode", href: "/listings?category=5" },
  { label: "Multimédia", href: "/listings?category=1" },
]

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { favoriteCount } = useFavorites()
  const { unreadCount: messageCount, notificationCount } = useMessageNotifications()
  const [latestConversationId, setLatestConversationId] = useState<number | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authTab, setAuthTab] = useState<"login" | "register">("login")
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
    }
  }, [isAuthenticated])

  const loadNotifications = async () => {
    try {
      const convResult = await messageService.getConversations()
      if (convResult.success && Array.isArray((convResult as any).data)) {
        const convs = (convResult as any).data as any[]
        let target = convs.find((c) => (c.unread_count || 0) > 0)
        if (!target) {
          target = convs.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())[0]
        }
        setLatestConversationId(target ? target.id : null)
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-xl font-bold text-primary">LeMarché</span>
          </Link>

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

                <Link href="/publish">
                  <Button size="sm" className="ml-1 gap-1.5">
                    <Plus className="w-4 h-4" />
                    Déposer une annonce
                  </Button>
                </Link>
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

        <nav className="hidden md:flex items-center gap-5 h-10 -mb-px overflow-x-auto">
          {categoryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm border-b-2 border-transparent px-0.5 h-10 flex items-center whitespace-nowrap text-muted-foreground hover:text-foreground hover:border-border transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} defaultTab={authTab} />
    </header>
  )
}
