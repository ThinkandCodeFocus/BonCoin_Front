"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Package, Star, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { notificationService } from "@/lib/api"
import { EmptyState } from "@/components/design-system"
import { cn } from "@/lib/utils"

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
    const result = await notificationService.getAll()
    if (result.success && result.data) {
      setNotifications(Array.isArray(result.data) ? result.data : [])
    }
    setIsLoading(false)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await notificationService.markAsRead(notification.id)
      // Mettre à jour localement
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
      ))
    }
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

      <main className="flex-1 pb-16 md:pb-4 py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Notifications</h1>
            <Badge variant="secondary">{notifications.filter((n) => !n.read_at).length} non lues</Badge>
          </div>

          {notifications.length === 0 ? (
            <EmptyState icon={Package} title="Aucune notification pour le moment" />
          ) : (
            <div className="border rounded-lg divide-y overflow-hidden">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type)
                return (
                  <button
                    key={notification.id}
                    className={cn(
                      "w-full text-left flex items-start gap-3 p-4 hover:bg-muted transition-colors",
                      !notification.read_at && "bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {!notification.read_at && <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.created_at)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
