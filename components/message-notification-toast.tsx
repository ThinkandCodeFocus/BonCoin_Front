"use client"

import { useMessageNotifications } from "@/contexts/MessageNotificationContext"
import { X } from "lucide-react"
import Link from "next/link"

export function MessageNotificationToast() {
  const { newMessageNotification, clearNotification } = useMessageNotifications()

  return (
    <>
      {newMessageNotification && (
        <div
          className="fixed top-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-right-80 duration-300"
        >
          <Link href={`/messages/${newMessageNotification.conversationId}`}>
            <div className="bg-linear-to-r from-accent to-accent/80 text-accent-foreground px-6 py-4 rounded-lg shadow-lg border border-accent/50 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Nouveau message</p>
                  <p className="text-sm opacity-90 font-medium truncate">
                    {newMessageNotification.senderName}
                  </p>
                  <p className="text-xs opacity-75 truncate mt-1">
                    {newMessageNotification.preview}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    clearNotification()
                  }}
                  className="shrink-0 hover:opacity-75 transition-opacity"
                  aria-label="Fermer la notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  )
}
