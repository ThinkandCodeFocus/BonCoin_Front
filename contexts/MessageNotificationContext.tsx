"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { messageService } from "@/lib/api"

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
  newMessageNotification: MessageNotification | null
  clearNotification: () => void
  refreshUnreadCount: () => Promise<void>
}

const MessageNotificationContext = createContext<MessageNotificationContextType | undefined>(undefined)

export function MessageNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
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
      return
    }

    const result = await messageService.getUnreadCount()
    if (result.success && typeof (result as any).data === "number") {
      const newCount = (result as any).data
      
      // Si le nombre de messages non lus a augmenté, afficher une notification
      if (newCount > previousCountRef.current && previousCountRef.current > 0) {
        playNotificationSound()
        
        // Récupérer les conversations pour afficher plus d'info
        const convResult = await messageService.getConversations()
        if (convResult.success && Array.isArray((convResult as any).data)) {
          const conversations = (convResult as any).data
          // Trouver la première conversation avec des messages non lus
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
            
            // Masquer la notification après 5 secondes
            setTimeout(() => {
              setNewMessageNotification(null)
            }, 5000)
          }
        }
      }
      
      setUnreadCount(newCount)
      previousCountRef.current = newCount
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

    // Ensuite faire le polling toutes les 5 secondes
    pollingIntervalRef.current = setInterval(() => {
      refreshUnreadCount()
    }, 5000)

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
