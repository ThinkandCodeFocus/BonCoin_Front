"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { messageService, notificationService } from "@/lib/api"

interface MessageNotification {
  id: string
  conversationId: number
  senderName: string
  preview: string
  timestamp: Date
  isRead: boolean
}

interface MessageNotificationContextType {
  unreadCount: number
  notificationCount: number
  newMessageNotification: MessageNotification | null
  clearNotification: () => void
  refreshUnreadCount: () => Promise<void>
}

const MessageNotificationContext = createContext<MessageNotificationContextType | undefined>(undefined)

export function MessageNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)
  const [newMessageNotification, setNewMessageNotification] = useState<MessageNotification | null>(null)
  const previousCountRef = useRef(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction pour lire un son de notification (optionnel)
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = "sine"
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      // Les navigateurs peuvent bloquer l'audio, ce n'est pas grave
      console.debug("Audio notification not available")
    }
  }

  const refreshUnreadCount = async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      setNotificationCount(0)
      return
    }

    try {
      // 1. Récupérer le compte des messages non lus
      const messageResult = await messageService.getConversations()
      if (messageResult.success && Array.isArray((messageResult as any).data)) {
        const conversations = (messageResult as any).data
        const totalUnread = conversations.reduce((acc: number, conv: any) => acc + (conv.unread_count || 0), 0)
        
        if (totalUnread > previousCountRef.current && previousCountRef.current > 0) {
          playNotificationSound()
          const unreadConv = conversations.find((c: any) => c.unread_count > 0)
          if (unreadConv) {
            const otherUser = unreadConv.buyer_id === user?.id ? unreadConv.seller : unreadConv.buyer
            setNewMessageNotification({
              id: `notif-${Date.now()}`,
              conversationId: unreadConv.id,
              senderName: otherUser?.name || "Utilisateur",
              preview: unreadConv.last_message?.content || "Nouveau message",
              timestamp: new Date(),
              isRead: false,
            })
            setTimeout(() => setNewMessageNotification(null), 5000)
          }
        }
        setUnreadCount(totalUnread)
        previousCountRef.current = totalUnread
      }

      // 2. Récupérer le compte des notifications (cloche)
      const notifResult = await notificationService.getAll()
      if (notifResult.success) {
        // La structure est { success: true, data: { success: true, data: [...] } } 
        // ou simplement { success: true, data: [...] } selon le service
        const rawData = (notifResult as any).data
        const notifArray = Array.isArray(rawData.data) ? rawData.data : (Array.isArray(rawData) ? rawData : [])
        
        const unreadNotifs = notifArray.filter((n: any) => !n.read_at).length
        setNotificationCount(unreadNotifs)
      }
    } catch (error) {
      console.error("Error refreshing counts:", error)
    }
  }

  // Polling des messages non lus
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }

    // Charger immédiatement au montage
    refreshUnreadCount()

    // Ensuite faire le polling toutes les 20 secondes
    pollingIntervalRef.current = setInterval(() => {
      refreshUnreadCount()
    }, 20000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [isAuthenticated, user])

  const clearNotification = () => {
    setNewMessageNotification(null)
  }

  return (
    <MessageNotificationContext.Provider
      value={{
        unreadCount,
        notificationCount,
        newMessageNotification,
        clearNotification,
        refreshUnreadCount,
      }}
    >
      {children}
    </MessageNotificationContext.Provider>
  )
}

export function useMessageNotifications() {
  const context = useContext(MessageNotificationContext)
  if (context === undefined) {
    throw new Error("useMessageNotifications doit être utilisé dans MessageNotificationProvider")
  }
  return context
}
