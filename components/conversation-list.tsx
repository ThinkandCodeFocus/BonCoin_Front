"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { messageService } from "@/lib/api"
import { resolveStorageUrl } from "@/lib/media"
import { EmptyState } from "@/components/design-system"
import { cn } from "@/lib/utils"

interface Conversation {
  id: number
  annonce_id: number
  buyer_id: number
  seller_id: number
  created_at: string
  updated_at: string
  annonce?: { id: number; title: string; photos?: string[] }
  buyer?: { id: number; name: string; photo?: string }
  seller?: { id: number; name: string; photo?: string }
}

interface MessageData {
  id: number
  content: string | null
  type: "text" | "audio"
  created_at: string
  user_id: number
  read_at?: string | null
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "à l'instant"
  if (diffMins < 60) return `${diffMins} min`
  if (diffHours < 24) return `${diffHours} h`
  if (diffDays === 1) return "hier"
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function ConversationList({ activeId }: { activeId?: number }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({})
  const [lastMessages, setLastMessages] = useState<Record<number, MessageData>>({})
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadConversations()
    refreshIntervalRef.current = setInterval(loadConversations, 10000)
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadConversations() {
    setIsLoading(true)
    try {
      const result = await messageService.getConversations()
      if (result.success && Array.isArray((result as any).data)) {
        const convs = (result as any).data as Conversation[]

        const newUnreadCounts: Record<number, number> = {}
        const newLastMessages: Record<number, MessageData> = {}

        for (const conv of convs) {
          try {
            const messagesResult = await messageService.getMessages(conv.id)
            if (messagesResult.success && Array.isArray((messagesResult as any).data)) {
              const messages = (messagesResult as any).data as MessageData[]
              if (messages.length > 0) {
                newLastMessages[conv.id] = messages[messages.length - 1]
                newUnreadCounts[conv.id] = messages.filter((m) => m.user_id !== user?.id && !m.read_at).length
              }
            }
          } catch {
            // ignore une conversation en erreur
          }
        }

        setConversations(convs)
        setUnreadCounts(newUnreadCounts)
        setLastMessages(newLastMessages)
      }
    } finally {
      setIsLoading(false)
    }
  }

  function getOtherUser(conv: Conversation) {
    if (!user) return { name: "Utilisateur", photo: undefined as string | undefined }
    if (conv.buyer_id === user.id) return conv.seller || { name: "Vendeur", photo: undefined }
    return conv.buyer || { name: "Acheteur", photo: undefined }
  }

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getOtherUser(conv)
    const searchLower = searchQuery.toLowerCase()
    return (
      otherUser.name.toLowerCase().includes(searchLower) ||
      (conv.annonce?.title || "").toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Chargement...</div>
        ) : filteredConversations.length === 0 ? (
          <EmptyState title="Aucun message" description="Les conversations apparaîtront ici" />
        ) : (
          filteredConversations.map((conv) => {
            const otherUser = getOtherUser(conv)
            const hasUnread = (unreadCounts[conv.id] || 0) > 0
            const lastMsg = lastMessages[conv.id]
            const photoUrl = otherUser.photo ? resolveStorageUrl(otherUser.photo) : null

            return (
              <button
                key={conv.id}
                onClick={() => router.push(`/messages/${conv.id}`)}
                className={cn(
                  "w-full text-left flex items-center gap-3 p-3 border-b hover:bg-muted transition-colors",
                  activeId === conv.id && "bg-muted"
                )}
              >
                <div className="relative shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-semibold">{otherUser.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  {hasUnread && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">{unreadCounts[conv.id]}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-sm truncate", hasUnread && "font-semibold")}>
                      {conv.annonce?.title || otherUser.name}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTime(conv.updated_at || conv.created_at)}
                    </span>
                  </div>
                  <p className={cn("text-xs truncate text-muted-foreground", hasUnread && "text-foreground")}>
                    {user?.id === lastMsg?.user_id ? "Vous : " : ""}
                    {lastMsg && lastMsg.type === "audio" ? "Message vocal" : lastMsg?.content || "Aucun message"}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
