"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Package, Star, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Notification {
  id: number
  type: string
  title: string
  body: string
  read_at: string | null
  created_at: string
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    loadNotifications()
  }, [isAuthenticated])

  const loadNotifications = async () => {
    setIsLoading(true)
    // TODO: Implémenter l'appel API quand le backend sera prêt
    // Pour l'instant on affiche un message vide
    setNotifications([])
    setIsLoading(false)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageCircle
      case 'favorite': return Heart
      case 'listing': return Package
      case 'review': return Star
      default: return Package
    }
  }

  const formatTime = (date: string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now.getTime() - notifDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays === 1) return "Hier"
    return `Il y a ${diffDays} jours`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <BottomNav />
      </div>
    )
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-4 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <Badge variant="secondary">{notifications.filter((n) => !n.read_at).length} non lues</Badge>
          </div>

          {notifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune notification pour le moment</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type)
                return (
                  <Card
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      !notification.read_at ? "bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold">{notification.title}</p>
                          {!notification.read_at && <div className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.body}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(notification.created_at)}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
